import { useState, useRef } from 'react';
import { Wand2, Zap, CheckCircle, ImageIcon, Loader2, AlertCircle, ArrowRight, X } from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';
import { getLayoutedElements } from '../utils/autoLayout';
import { detectComponent, getComponentDetails } from '../data/componentsList';
import { convertImageToFlow, preprocessImageInBrowser, validateAndCleanFlow } from '../services/aiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

// ── Tiny loading state labels ──────────────────────────────────────────────────
const LOADING_STAGES = [
  { key: 'preprocess', label: 'Preprocessing image…' },
  { key: 'ai',        label: 'AI is reading the diagram…' },
  { key: 'validate',  label: 'Validating structure…' },
  { key: 'layout',    label: 'Computing layout…' },
];

export default function ImageUploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingStage, setLoadingStage] = useState(null); // null | 'preprocess' | 'ai' | 'validate' | 'layout'
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);         // { nodes, edges, flowDirection }
  const [editableNodes, setEditableNodes] = useState([]);
  const [editableEdges, setEditableEdges] = useState([]);
  const [activeTab, setActiveTab] = useState('nodes'); // 'nodes' | 'edges'

  const fileInputRef = useRef(null);
  const { setNodes, setEdges } = useFlowStore();

  // ── File handling ────────────────────────────────────────────────────────────

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setResult(null);
    setEditableNodes([]);
    setEditableEdges([]);
  };

  const handleFileChange = (e) => loadFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); };

  // ── Conversion pipeline ──────────────────────────────────────────────────────

  const handleConvert = async () => {
    if (!file) return;
    setError(null);

    try {
      // Stage 1: preprocess
      setLoadingStage('preprocess');
      const base64 = await preprocessImageInBrowser(file);

      // Stage 2: AI
      setLoadingStage('ai');
      const raw = await convertImageToFlow(base64, 'image/png');

      // Stage 3: validate
      setLoadingStage('validate');
      const flowDirection = raw.flowDirection || 'LR';

      // Enrich nodes
      const enrichedNodes = (raw.nodes || []).map(n => {
        const compId = n.data?.componentId;
        const component = getComponentDetails(compId) || detectComponent(n.data?.label || '');
        return {
          ...n,
          id: String(n.id),
          type: 'universal',
          data: {
            ...n.data,
            componentId: component.id,
            color: component.colorHint,
            label: n.data?.label || component.label,
            customIcon: n.data?.iconName || null,
          },
        };
      });

      // Enrich edges
      const defaultSource = flowDirection === 'TB' ? 'bottom' : 'right';
      const defaultTarget = flowDirection === 'TB' ? 'top' : 'left';
      const enrichedEdges = (raw.edges || []).map(e => ({
        ...e,
        id: e.id || `e${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        type: 'custom',
        sourceHandle: e.sourceHandle || defaultSource,
        targetHandle: e.targetHandle || defaultTarget,
        data: {
          shape: 'smoothstep',
          stroke: 'solid',
          arrow: 'arrow',
          color: '#155DFC',
          width: 2,
          showLabel: !!(e.data?.label),
          label: '',
          ...e.data,
        },
      }));

      // Validate — remove orphan/duplicate edges
      const { nodes: cleanNodes, edges: cleanEdges } = validateAndCleanFlow(enrichedNodes, enrichedEdges);

      // Stage 4: layout
      setLoadingStage('layout');
      const { nodes: laid } = getLayoutedElements(cleanNodes, cleanEdges, flowDirection);

      setResult({ nodes: laid, edges: cleanEdges, flowDirection });
      setEditableNodes(laid);
      setEditableEdges(cleanEdges);
      setActiveTab('nodes');

    } catch (err) {
      setError(err.message || 'Conversion failed. Check your API key.');
    } finally {
      setLoadingStage(null);
    }
  };

  // ── Node editing ─────────────────────────────────────────────────────────────

  const updateNodeLabel = (id, newLabel) => {
    setEditableNodes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const component = detectComponent(newLabel);
      return { ...n, data: { ...n.data, label: newLabel, componentId: component.id, color: component.colorHint } };
    }));
  };

  const removeNode = (id) => {
    setEditableNodes(prev => prev.filter(n => n.id !== id));
    // Also remove edges connected to this node
    setEditableEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
  };

  // ── Edge editing ─────────────────────────────────────────────────────────────

  const removeEdge = (id) => setEditableEdges(prev => prev.filter(e => e.id !== id));

  // ── Apply to canvas ───────────────────────────────────────────────────────────

  const handleApply = () => {
    if (!editableNodes.length) return;
    const nodeIds = new Set(editableNodes.map(n => n.id));
    // Final validation pass
    const { edges: finalEdges } = validateAndCleanFlow(
      editableNodes,
      editableEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
    );
    const { nodes: laid } = getLayoutedElements(editableNodes, finalEdges, result.flowDirection);
    setNodes(laid);
    setEdges(finalEdges);
    handleClose();
  };

  // ── Close / reset ─────────────────────────────────────────────────────────────

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setEditableNodes([]);
    setEditableEdges([]);
    setError(null);
    setLoadingStage(null);
    onClose();
  };

  const isLoading = loadingStage !== null;
  const currentStageLabel = LOADING_STAGES.find(s => s.key === loadingStage)?.label || 'Processing…';

  // ── Helper: get node label by id ──────────────────────────────────────────────
  const nodeLabel = (id) => editableNodes.find(n => n.id === id)?.data?.label || id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-[660px] p-0 gap-0 rounded-2xl dark:bg-[#0f1117] border-slate-200 dark:border-[#1e2330] overflow-hidden">

        {/* Header */}
        <DialogHeader className="p-5 border-b border-slate-100 dark:border-[#1e2330] bg-white dark:bg-[#161b22] flex-row items-center gap-4 space-y-0">
          <div className="w-10 h-10 bg-[#155DFC]/10 rounded-xl flex items-center justify-center shrink-0">
            <Zap className="text-[#155DFC]" size={20} />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[15px] font-bold text-slate-800 dark:text-white text-left">
              Image → Flow Diagram
            </DialogTitle>
            <DialogDescription className="text-[12px] text-slate-500 dark:text-[#64748b] text-left mt-0.5">
              Upload a sketch, whiteboard photo, or architecture diagram
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[62vh]">

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3 text-red-700 dark:text-red-400 text-[12.5px] font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            /* ── UPLOAD STATE ─────────────────────────────────────────────── */
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`relative h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group
                  ${preview ? 'border-[#155DFC]/50 bg-slate-50 dark:bg-[#161b22]' : 'border-slate-200 dark:border-[#30363d] hover:border-[#155DFC]/50 hover:bg-slate-50 dark:hover:bg-[#161b22]'}
                  ${isLoading ? 'pointer-events-none opacity-60' : ''}
                `}
              >
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />

                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#155DFC]" size={28} />
                    <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">{currentStageLabel}</p>
                    {/* Stage progress dots */}
                    <div className="flex gap-1.5">
                      {LOADING_STAGES.map(s => (
                        <div key={s.key} className={`w-1.5 h-1.5 rounded-full transition-colors ${s.key === loadingStage ? 'bg-[#155DFC]' : LOADING_STAGES.indexOf(LOADING_STAGES.find(x => x.key === loadingStage)) > LOADING_STAGES.indexOf(s) ? 'bg-[#155DFC]/40' : 'bg-slate-200 dark:bg-[#30363d]'}`} />
                      ))}
                    </div>
                  </div>
                ) : preview ? (
                  <div className="absolute inset-0 p-2">
                    <img src={preview} className="w-full h-full object-contain rounded-lg" alt="Preview" />
                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-3 py-1 bg-slate-900/80 text-white text-[11px] font-semibold rounded-full">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 dark:bg-[#1c212b] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="text-slate-400" size={22} />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-700 dark:text-[#e2e8f0]">Drop your diagram here</p>
                    <p className="text-[12px] text-slate-400 dark:text-[#64748b] mt-1">or click to browse files</p>
                  </>
                )}
              </div>

              {/* Tips */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CheckCircle, title: 'Best results', desc: 'Clear handwriting, good lighting, bold lines' },
                  { icon: Wand2, title: 'Auto detection', desc: 'AI reads shapes, arrows & labels from image' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3 p-3 bg-slate-50 dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-[#155DFC]/10 flex items-center justify-center shrink-0">
                      <Icon className="text-[#155DFC]" size={14} />
                    </div>
                    <div className="text-[11.5px]">
                      <span className="font-bold text-slate-700 dark:text-[#e2e8f0] block">{title}</span>
                      <span className="text-slate-500 dark:text-[#64748b]">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* ── REVIEW STATE ─────────────────────────────────────────────── */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Summary bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 dark:text-white">Review before applying</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-[10px] font-bold dark:bg-[#1c212b] dark:text-slate-400">
                    {editableNodes.length} nodes
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-bold dark:bg-[#1c212b] dark:text-slate-400">
                    {editableEdges.length} edges
                  </Badge>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-[#1e2330]">
                {[['nodes', 'Nodes'], ['edges', 'Connections']].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 py-2 text-[12px] font-semibold transition-colors border-b-2 -mb-px ${
                      activeTab === key
                        ? 'text-[#155DFC] border-[#155DFC]'
                        : 'text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {label}
                    <span className="ml-1.5 text-[10px] bg-slate-100 dark:bg-[#1c212b] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
                      {key === 'nodes' ? editableNodes.length : editableEdges.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Nodes tab */}
              {activeTab === 'nodes' && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1.5 pr-2">
                    {editableNodes.map((n, i) => {
                      const details = detectComponent(n.data.label);
                      const IconComp = details.untitledIcon || details.lucideIcon || ImageIcon;
                      const connectedEdgeCount = editableEdges.filter(e => e.source === n.id || e.target === n.id).length;
                      return (
                        <div key={n.id} className="flex items-center gap-3 bg-white dark:bg-[#161b22] p-3 rounded-xl border border-slate-100 dark:border-[#30363d] hover:border-[#155DFC]/30 transition-all">
                          <span className="text-[10px] font-black text-slate-300 dark:text-[#30363d] w-4 shrink-0">{i + 1}</span>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${details.colorHint}15` }}>
                            <IconComp color={details.colorHint} size={18} strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Input
                              className="bg-transparent border-none shadow-none text-[13px] font-semibold text-slate-800 dark:text-[#e2e8f0] p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                              value={n.data.label}
                              onChange={e => updateNodeLabel(n.id, e.target.value)}
                            />
                            <div className="flex gap-2 mt-0.5 items-center">
                              <span className="text-[10px] text-slate-400 dark:text-[#64748b] font-medium">{details.label}</span>
                              {connectedEdgeCount > 0 && (
                                <span className="text-[9px] bg-slate-100 dark:bg-[#1c212b] text-slate-500 dark:text-slate-400 px-1.5 py-px rounded-full font-bold">
                                  {connectedEdgeCount} connection{connectedEdgeCount !== 1 ? 's' : ''}
                                </span>
                              )}
                              {connectedEdgeCount === 0 && (
                                <span className="text-[9px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-px rounded-full font-bold">
                                  isolated
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeNode(n.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-[#30363d] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                    {editableNodes.length === 0 && (
                      <div className="text-center py-8 text-[12px] text-slate-400 dark:text-[#64748b]">No nodes remaining</div>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Edges tab */}
              {activeTab === 'edges' && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1.5 pr-2">
                    {editableEdges.map((e, i) => {
                      const srcLabel = nodeLabel(e.source);
                      const tgtLabel = nodeLabel(e.target);
                      return (
                        <div key={e.id} className="flex items-center gap-3 bg-white dark:bg-[#161b22] p-3 rounded-xl border border-slate-100 dark:border-[#30363d] hover:border-[#155DFC]/30 transition-all">
                          <span className="text-[10px] font-black text-slate-300 dark:text-[#30363d] w-4 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-slate-700 dark:text-[#e2e8f0] truncate max-w-[120px]">{srcLabel}</span>
                            <ArrowRight size={12} className="text-[#155DFC] shrink-0" />
                            <span className="text-[12px] font-semibold text-slate-700 dark:text-[#e2e8f0] truncate max-w-[120px]">{tgtLabel}</span>
                            {e.data?.label && (
                              <span className="text-[10px] bg-slate-100 dark:bg-[#1c212b] text-slate-500 dark:text-slate-400 px-1.5 py-px rounded font-medium ml-auto shrink-0 truncate max-w-[80px]">
                                "{e.data.label}"
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeEdge(e.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-[#30363d] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                    {editableEdges.length === 0 && (
                      <div className="text-center py-8 text-[12px] text-slate-400 dark:text-[#64748b]">No connections detected</div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-5 border-t border-slate-100 dark:border-[#1e2330] bg-slate-50 dark:bg-[#161b22] flex gap-2 sm:justify-start">
          {!result ? (
            <Button
              onClick={handleConvert}
              disabled={!file || isLoading}
              className="flex-1 h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white rounded-xl font-bold text-[13px] shadow-sm shadow-[#155DFC]/20 disabled:opacity-50"
            >
              {isLoading
                ? <><Loader2 className="animate-spin mr-2" size={16} />{currentStageLabel}</>
                : <><Wand2 className="mr-2" size={16} />Convert to Flow</>
              }
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => { setResult(null); setEditableNodes([]); setEditableEdges([]); }}
                className="h-11 px-5 text-[13px] font-semibold rounded-xl dark:bg-[#0f1117] dark:border-[#30363d] dark:text-slate-300"
              >
                Start Over
              </Button>
              <Button
                onClick={handleApply}
                disabled={editableNodes.length === 0}
                className="flex-1 h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white rounded-xl font-bold text-[13px] shadow-sm shadow-[#155DFC]/20 disabled:opacity-50"
              >
                <CheckCircle className="mr-2" size={16} />
                Apply {editableNodes.length} Nodes + {editableEdges.length} Edges
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
