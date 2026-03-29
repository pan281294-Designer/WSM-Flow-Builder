import { useFlowStore } from "../store/useFlowStore";
import { 
  Type, Square, Circle, Diamond, 
  Maximize2, CornerUpLeft, CornerUpRight, 
  Save, FolderOpen, Trash2, Layout
} from "lucide-react";

export default function FloatingToolbar() {
  const { 
    nodes, 
    updateSelectedNodesData, 
    deleteSelected, 
    saveProject, 
    loadProject 
  } = useFlowStore();
  
  const selectedNodes = nodes.filter(n => n.selected);
  if (selectedNodes.length === 0) return null;

  // Derive common values if all selected nodes share them
  const first = selectedNodes[0].data;
  const commonShape = selectedNodes.every(n => n.data.shape === first.shape) ? first.shape : 'mixed';
  const commonSize = selectedNodes.every(n => n.data.fontSize === first.fontSize) ? first.fontSize : 'mixed';

  const update = (patch) => updateSelectedNodesData(patch);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1.5 p-2 bg-white dark:bg-[#131720] border border-slate-200 dark:border-[#1e293b] rounded-2xl shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
      
      {/* Title / Count */}
      <div className="px-3 py-1.5 border-r border-slate-100 dark:border-[#1e293b] mr-1">
        <span className="text-[11px] font-black text-[#155DFC] dark:text-[#155DFC] uppercase tracking-tighter">
          {selectedNodes.length} SELECTED
        </span>
      </div>

      {/* Typography group */}
      <div className="flex items-center gap-1 px-1">
        <select 
          className="bg-transparent text-[12px] font-bold text-slate-700 dark:text-[#e2e8f0] outline-none cursor-pointer hover:text-[#155DFC] transition-colors"
          value={commonSize}
          onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
        >
          <option value="mixed" disabled>Size</option>
          {[12, 14, 16, 18, 20, 24, 32].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        
        <div className="w-px h-4 bg-slate-100 dark:bg-[#1e293b] mx-1" />

        <button 
          onClick={() => update({ fontWeight: first.fontWeight === 700 ? 500 : 700 })}
          className={`p-1.5 rounded-lg transition-all ${first.fontWeight === 700 ? 'bg-[#155DFC]/10 text-[#155DFC]' : 'hover:bg-slate-100 text-slate-400'}`}
          title="Toggle Bold"
        >
          <Type size={16} strokeWidth={first.fontWeight === 700 ? 3 : 2} />
        </button>
      </div>

      <div className="w-px h-8 bg-slate-100 dark:bg-[#1e293b]" />

      {/* Shape group */}
      <div className="flex items-center gap-1 px-1">
        {[
          { id: 'rectangle', icon: Square, label: 'Rect' },
          { id: 'circle', icon: Circle, label: 'Circle' },
          { id: 'diamond', icon: Diamond, label: 'Diamond' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => update({ shape: s.id, radius: s.id === 'circle' ? 999 : (s.id === 'rectangle' ? 16 : 4) })}
            className={`p-1.5 rounded-lg transition-all ${commonShape === s.id ? 'bg-[#155DFC]/10 text-[#155DFC]' : 'hover:bg-slate-100 text-slate-400'}`}
            title={s.label}
          >
            <s.icon size={16} />
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-slate-100 dark:bg-[#1e293b]" />

      {/* Style group */}
      <div className="flex items-center gap-2 px-1 pr-2">
        <div className="flex flex-col items-center gap-0.5">
           <input 
             type="range" min="0" max="40" step="2"
             className="w-16 h-1.5 bg-slate-100 dark:bg-[#1e293b] rounded-full appearance-none cursor-pointer accent-[#155DFC]"
             value={first.radius || 16}
             onChange={(e) => update({ radius: parseInt(e.target.value) })}
           />
           <span className="text-[9px] font-bold text-slate-400">RADIUS</span>
        </div>
      </div>

      <div className="w-px h-8 bg-slate-100 dark:bg-[#1e293b]" />

      {/* Action group */}
      <div className="flex items-center gap-1 pl-1">
        <button 
          onClick={deleteSelected}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
          title="Delete Selection"
        >
          <Trash2 size={18} />
        </button>
      </div>

    </div>
  );
}
