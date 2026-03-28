import { useState, useRef } from 'react';
import { Wand2, Zap, CheckCircle, Trash2, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';
import { getLayoutedElements } from '../utils/autoLayout';
import { detectComponent, getComponentDetails } from '../data/componentsList';
import { convertImageToFlow } from '../services/aiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

export default function ImageUploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [editableNodes, setEditableNodes] = useState([]);

  const fileInputRef = useRef(null);
  const { setNodes, setEdges } = useFlowStore();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      // Step 1: Base64 the file
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      // Step 2: Call AI
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error('OpenAI API Key not found in Environment. Please add VITE_OPENAI_API_KEY to your .env file.');
      
      const raw = await convertImageToFlow(base64, apiKey);

      // Step 3: Enrich nodes with component metadata + carry flowDirection for layout
      const flowDirection = raw.flowDirection || 'LR';
      const enrichedNodes = raw.nodes.map(n => {
        const compId = n.data?.componentId || 'api-server';
        const component = getComponentDetails(compId) || detectComponent(n.data?.label || '');
        return {
          ...n,
          type: 'universal',
          rank: n.rank, // Pass AI-detected rank to dagre
          _flowDirection: flowDirection,
          data: {
            ...n.data,
            componentId: component.id,
            color: component.colorHint,
            layout: 'vertical',
            status: 'Active'
          },
        };
      });

      // Step 4: Enrich edges — add handle metadata and styling
      const enrichedEdges = raw.edges.map(e => ({
        ...e,
        type: 'custom',
        sourceHandle: e.sourceHandle || (flowDirection === 'TB' ? 'bottom' : 'right'),
        targetHandle: e.targetHandle || (flowDirection === 'TB' ? 'top' : 'left'),
        data: {
          shape: 'bezier',
          stroke: 'solid',
          arrow: 'arrow',
          label: e.data?.label || '',
          showLabel: !!(e.data?.label),
          labelColor: 'slate',
        },
      }));

      // Step 5: Auto Layout using AI-detected direction
      const { nodes: laid } = getLayoutedElements(enrichedNodes, enrichedEdges, flowDirection);

      setResult({ nodes: laid, edges: enrichedEdges, flowDirection });
      setEditableNodes(laid);
    } catch (err) {
      setError(err.message || 'Error converting diagram. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const updateLabel = (id, newLabel) => {
    setEditableNodes(prev => prev.map(n => {
      if (n.id === id) {
        const component = detectComponent(newLabel);
        return { ...n, data: { ...n.data, label: newLabel, componentId: component.id, color: component.colorHint } };
      }
      return n;
    }));
  };

  const removeNode = (id) => {
    setEditableNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleApply = () => {
    if (!editableNodes.length) return;
    const nodeIds = new Set(editableNodes.map(n => n.id));
    const finalEdges = result.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    const { nodes: laid } = getLayoutedElements(editableNodes, finalEdges, result.flowDirection);
    setNodes(laid);
    setEdges(finalEdges);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setEditableNodes([]);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-[640px] p-0 gap-0 rounded-3xl dark:bg-[#0f1117] border-slate-200 dark:border-[#1e2330] overflow-hidden">

        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-[#1e2330] bg-slate-50 dark:bg-[#161b22] flex-row items-center gap-4 space-y-0">
          <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl shrink-0">
            <Zap className="text-violet-600 dark:text-violet-400" size={22} />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[17px] font-bold text-slate-800 dark:text-white text-left">
              Paper → Diagram AI
            </DialogTitle>
            <DialogDescription className="text-[12px] text-slate-500 dark:text-[#64748b] text-left mt-0.5">
              Upload an architecture sketch or whiteboard photo to convert
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3 text-red-700 dark:text-red-400 text-[13px] font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {!result ? (
            <div className="space-y-6">
              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group
                  ${preview
                    ? 'border-violet-500 bg-slate-50 dark:bg-[#161b22]'
                    : 'border-slate-300 dark:border-[#30363d] hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-[#161b22]'
                  }`}
              >
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                {preview ? (
                  <div className="absolute inset-0 p-2">
                    <img src={preview} className="w-full h-full object-contain rounded-xl shadow-sm" alt="Preview" />
                    <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[12px] font-semibold rounded-full shadow-2xl">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="text-violet-600 dark:text-violet-400" size={32} />
                    </div>
                    <p className="text-[15px] font-bold text-slate-700 dark:text-[#e2e8f0]">Drag and drop your sketch</p>
                    <p className="text-[12px] text-slate-400 dark:text-[#64748b] mt-1 italic">or click to browse from files</p>
                  </>
                )}
              </div>

              {/* Tips */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={16} />
                  </div>
                  <div className="text-[12px]">
                    <span className="font-bold text-slate-700 dark:text-[#e2e8f0] block">Better Results</span>
                    <span className="text-slate-500 dark:text-[#64748b]">Clear handwriting, high lighting, and bold lines.</span>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
                    <Wand2 className="text-cyan-600 dark:text-cyan-400" size={16} />
                  </div>
                  <div className="text-[12px]">
                    <span className="font-bold text-slate-700 dark:text-[#e2e8f0] block">Auto-Icons</span>
                    <span className="text-slate-500 dark:text-[#64748b]">AI automatically detects icons for your components.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">Review Detected Architecture</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">{editableNodes.length} Elements</span>
              </div>

              <ScrollArea className="h-[360px]">
                <div className="space-y-2 pr-3">
                  {editableNodes.map((n, i) => {
                    const details = detectComponent(n.data.label);
                    const IconComp = details.untitledIcon || details.heroIcon || details.lucideIcon || ImageIcon;
                    return (
                      <div key={n.id} className="flex items-center gap-3 bg-white dark:bg-[#06080d] p-3 rounded-2xl border border-slate-200 dark:border-[#30363d] hover:border-violet-500 transition-all shadow-sm">
                        <span className="text-[11px] font-black text-slate-300 dark:text-[#30363d] w-4">{i + 1}</span>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${details.colorHint}15` }}>
                          <IconComp color={details.colorHint} size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Input
                            className="bg-transparent border-none shadow-none text-[14px] font-bold text-slate-800 dark:text-[#e2e8f0] p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={n.data.label}
                            onChange={e => updateLabel(n.id, e.target.value)}
                          />
                          <div className="flex gap-2.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 dark:text-[#64748b] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-[#161b22] rounded capitalize">{details.type}</span>
                            <span className="text-[10px] text-slate-500 dark:text-[#64748b] font-medium opacity-50">ID: {n.id}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNode(n.id)}
                          className="text-slate-300 dark:text-[#30363d] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg h-8 w-8"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t border-slate-100 dark:border-[#1e2330] bg-slate-50 dark:bg-[#161b22] flex gap-3 sm:justify-start">
          {!result ? (
            <Button
              onClick={handleConvert}
              disabled={!file || loading}
              className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-2xl font-bold text-[14px] shadow-xl shadow-violet-500/10"
            >
              {loading
                ? <><Loader2 className="animate-spin mr-2" size={20} />Analyzing Image...</>
                : <><Wand2 className="mr-2" size={20} />Convert to Flow</>
              }
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => { setResult(null); setEditableNodes([]); }}
                disabled={loading}
                className="px-6 h-12 text-[14px] font-bold rounded-2xl dark:bg-[#0f1117] dark:border-[#30363d] dark:text-slate-300 dark:hover:bg-[#161b22]"
              >
                Start Over
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl font-bold text-[14px] shadow-xl shadow-emerald-500/10"
              >
                <CheckCircle className="mr-2" size={20} />Apply to Canvas
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
