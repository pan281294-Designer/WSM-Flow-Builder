import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Sun, Moon, Download, Sparkles, LayoutTemplate, Copy, Clipboard, Trash2, ImagePlus, Undo2, ChevronDown, Check, FileCode2, CornerUpRight, Save, FolderOpen } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';

import Sidebar from "./components/Sidebar";
import PropertiesPanel from "./components/PropertiesPanel";
import AIConnectModal from "./components/AIConnectModal";
import FloatingToolbar from './components/FloatingToolbar';
import { useFlowStore } from "./store/useFlowStore";
import { nodeTypes } from "./components/nodes";
import CustomEdge from "./components/edges/CustomEdge";
import { getLayoutedElements } from "./utils/autoLayout";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import ImageUploadModal from "./components/ImageUploadModal";
import { downloadVectorSVG, copyVectorSVG, downloadPNG } from "./utils/exportFlow";

const edgeTypes = { custom: CustomEdge };

let id = 0;
const getId = () => `node_${id++}`;

const ALIGN_THRESHOLD = 8;

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [guides, setGuides] = useState([]);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, undo, redo, copy, paste, duplicate, deleteSelected, saveProject } = useFlowStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === 'z') { e.preventDefault(); undo(); }
      if (isMod && e.key === 'y') { e.preventDefault(); redo(); }
      if (isMod && e.key === 'c') { e.preventDefault(); copy(); }
      if (isMod && e.key === 'v') { e.preventDefault(); paste(); }
      if (isMod && e.key === 'd') { e.preventDefault(); duplicate(); }
      if (isMod && e.key === 's') { e.preventDefault(); saveProject(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { 
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          deleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copy, paste, duplicate, deleteSelected, saveProject]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData('application/reactflow');
      if (typeof componentId === 'undefined' || !componentId) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      useFlowStore.getState().addNode({
        id: getId(),
        type: 'universal',
        position,
        data: { componentId },
      });
    },
    [reactFlowInstance]
  );
  
  // Use onSelectionChange — tracks both nodes and edges
  const onSelectionChange = useCallback(({ nodes: sel, edges: selEdges }) => {
    const singleNode = sel.length === 1 ? sel[0].id : null;
    const singleEdge = selEdges?.length === 1 ? selEdges[0].id : null;
    useFlowStore.getState().setSelectedNodeId(singleNode);
    useFlowStore.getState().setSelectedEdgeId(singleEdge);
  }, []);

  // Smart alignment guide detection while dragging
  const onNodeDrag = useCallback((_, draggedNode) => {
    const allNodes = useFlowStore.getState().nodes;
    const newGuides = [];

    allNodes.forEach(n => {
      if (n.id === draggedNode.id) return;

      // Vertical (x) alignment
      if (Math.abs(n.position.x - draggedNode.position.x) < ALIGN_THRESHOLD) {
        newGuides.push({ type: 'vertical', x: n.position.x });
      }
      // Horizontal (y) alignment
      if (Math.abs(n.position.y - draggedNode.position.y) < ALIGN_THRESHOLD) {
        newGuides.push({ type: 'horizontal', y: n.position.y });
      }
    });

    setGuides(newGuides);
  }, []);

  const onNodeDragStop = useCallback(() => {
    setGuides([]);
  }, []);

  return (
    <div className="flex-1 relative bg-slate-50 dark:bg-[#06080d] transition-colors" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={onSelectionChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineStyle={{ stroke: '#22d3ee', strokeWidth: 2 }}
        connectionLineType="bezier"
        defaultEdgeOptions={{
          type: 'custom',
          data: { shape: 'bezier', stroke: 'solid', arrow: 'arrow', color: '#22d3ee', width: 2 }
        }}
        connectionRadius={30}
        connectionMode="loose"
        snapToGrid={true}
        snapGrid={[24, 24]}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        elementsSelectable={true}
        nodesDraggable={true}
        nodesConnectable={true}
        deleteKeyCode={['Delete','Backspace']}
        elevateEdgesOnSelect={true}
        fitView
      >
        <MiniMap nodeStrokeWidth={3} className="!bg-white dark:!bg-[#0f1117] border border-slate-200 dark:border-[#1e2330] rounded-lg shadow-xl" maskColor="rgba(0,0,0,0.1)" />
        <Controls className="!bg-white dark:!bg-[#0f1117] border border-slate-200 dark:border-[#1e2330] rounded-lg overflow-hidden shadow-xl fill-slate-800 dark:fill-white" />
        <Background gap={24} size={2} color="#94a3b8" className="opacity-50 dark:opacity-20" />
      </ReactFlow>

      {/* Smart alignment guides overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {guides.map((g, i) => g.type === 'vertical' ? (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-blue-500 opacity-50" style={{ left: g.x }} />
        ) : (
          <div key={i} className="absolute left-0 right-0 h-px bg-blue-500 opacity-50" style={{ top: g.y }} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { nodes, edges, setNodes, setEdges, copy, paste, duplicate, deleteSelected, undo, redo, past, saveProject, loadProject } = useFlowStore();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopySVG = async () => {
    const success = await copyVectorSVG(nodes, edges);
    if (success) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleAutoLayout = () => {
    if (!nodes.length) return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'LR');
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  };

  // Bind keyboard shortcuts (works outside Canvas scope)
  useKeyboardShortcuts({ copy, paste, duplicate, deleteSelected, undo, redo });

  const selectedCount = nodes.filter(n => n.selected).length;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#0d1017] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors">
      {/* Top Navbar */}
      <TooltipProvider delayDuration={400}>
      <div className="h-14 border-b border-slate-200 dark:border-[#1e2330] bg-white dark:bg-[#0d1017] flex items-center justify-between px-5 z-30 shadow-sm relative transition-colors">
        <div className="font-bold text-lg flex items-center gap-3">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2.5 py-1 rounded-md text-sm font-extrabold shadow-inner leading-relaxed">WSM</span>
          <span className="tracking-tight text-slate-800 dark:text-white font-medium">Flow Builder</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Undo / Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={undo} disabled={!past?.length}
                className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30">
                <Undo2 size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={redo}
                className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                <CornerUpRight size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1 dark:bg-[#30363d]" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={saveProject}
                className="h-8 w-8 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400">
                <Save size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Project (Ctrl+S)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={loadProject}
                className="h-8 w-8 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400">
                <FolderOpen size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load Project</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1 dark:bg-[#30363d]" />

          {/* Selection feedback */}
          {selectedCount > 1 && (
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 font-bold">
              {selectedCount} selected
            </Badge>
          )}

          {/* Selection action buttons */}
          {selectedCount > 0 && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={copy}
                    className="h-8 w-8 dark:bg-[#161b22] dark:border-[#30363d] text-slate-500 dark:text-slate-400">
                    <Copy size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy (Ctrl+C)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={duplicate}
                    className="h-8 w-8 dark:bg-[#161b22] dark:border-[#30363d] text-slate-500 dark:text-slate-400">
                    <Clipboard size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={deleteSelected}
                    className="h-8 w-8 dark:bg-[#161b22] dark:border-[#30363d] text-slate-500 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete (Del)</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-5 mx-1 dark:bg-[#30363d]" />
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleAutoLayout}
                className="gap-1.5 text-xs font-semibold dark:bg-[#161b22] dark:border-[#30363d] dark:text-slate-300 dark:hover:text-white">
                <LayoutTemplate size={13} /> Auto Layout
              </Button>
            </TooltipTrigger>
            <TooltipContent>Re-arrange nodes automatically</TooltipContent>
          </Tooltip>

          <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}
            className="gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700">
            <ImagePlus size={13} /> Image → Flow
          </Button>

          {/* Export dropdown */}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setIsExportOpen(!isExportOpen)}
              className="gap-1.5 text-xs font-semibold dark:bg-[#161b22] dark:border-[#30363d] dark:text-slate-300 dark:hover:text-white">
              <Download size={13} /> Export
              <ChevronDown size={11} className={isExportOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </Button>
            {isExportOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-xl shadow-2xl p-1.5 z-50">
                <button onClick={() => { downloadVectorSVG(nodes, edges); setIsExportOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1c212b] rounded-lg transition-colors">
                  <Download size={14} className="text-cyan-500" /> Download SVG
                </button>
                <button onClick={() => { handleCopySVG(); setIsExportOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1c212b] rounded-lg transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileCode2 size={14} className="text-violet-500" /> Copy SVG Code
                  </div>
                  {copyFeedback && <Check size={12} className="text-emerald-500" />}
                </button>
                <button onClick={() => { downloadPNG(reactFlowWrapper); setIsExportOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1c212b] rounded-lg transition-colors">
                  <Download size={14} className="text-emerald-500" /> Download PNG
                </button>
              </div>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={toggleTheme}
                className="h-8 w-8 dark:bg-[#161b22] dark:border-[#30363d] text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400">
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1 dark:bg-[#30363d]" />

          <Button onClick={() => setIsAIModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm shadow-md hover:scale-105 transition-all">
            <Sparkles size={15} /> AI Connect
          </Button>
        </div>
      </div>
      </TooltipProvider>

      <div className="flex-1 flex flex-row relative h-[calc(100vh-56px)]">
        <Sidebar />
        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>
        <PropertiesPanel />
      </div>

      <AIConnectModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <ImageUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <FloatingToolbar />
    </div>
  );
}
