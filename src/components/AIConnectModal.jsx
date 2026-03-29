import { useState } from 'react';
import { X, Sparkles, Wand2 } from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';

export default function AIConnectModal({ isOpen, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { setNodes, setEdges } = useFlowStore();

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      setNodes([
        { id: 'ai-1', type: 'universal', data: { componentId: 'web-app', label: 'User Request' }, position: { x: 100, y: 300 } },
        { id: 'ai-2', type: 'universal', data: { componentId: 'api-server', label: 'API Gateway' }, position: { x: 400, y: 150 } },
        { id: 'ai-3', type: 'universal', data: { componentId: 'llm', label: 'Core AI Model' }, position: { x: 700, y: 300 } },
      ]);
      setEdges([
        { id: 'e1-2', source: 'ai-1', target: 'ai-2', type: 'smoothstep', animated: true, zIndex: 1000, style: { stroke: '#155DFC', strokeWidth: 2, strokeDasharray: '5 5' } },
        { id: 'e2-3', source: 'ai-2', target: 'ai-3', type: 'smoothstep', animated: true, zIndex: 1000, style: { stroke: '#155DFC', strokeWidth: 2, strokeDasharray: '5 5' } },
      ]);
      setIsGenerating(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl w-[500px] shadow-2xl border border-slate-200 dark:border-[#1e2330] overflow-hidden transition-colors animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-[#1e2330] flex items-center justify-between bg-slate-50 dark:bg-[#161b22] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg">
              <Sparkles className="text-[#155DFC]" size={20} />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-bold text-xl tracking-tight leading-none mb-1">AI Connect</h2>
              <p className="text-slate-500 dark:text-[#64748b] text-[13px] font-medium italic">Transform your vision into flows</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-[#64748b] dark:hover:text-white transition-colors">
             <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-[#94a3b8] mb-2">Describe your workflow</label>
            <textarea 
              autoFocus
              className="w-full h-32 px-4 py-3 bg-white dark:bg-[#06080d] border border-slate-200 dark:border-[#1e2330] rounded-xl text-sm shadow-inner focus:outline-none focus:border-[#155DFC] focus:ring-1 focus:ring-[#155DFC] transition-all text-slate-800 dark:text-[#e2e8f0] resize-none font-medium placeholder-slate-400 dark:placeholder-[#475569]"
              placeholder="e.g. Build an AI customer support bot connected to a high-capacity vector database..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <button 
             onClick={handleGenerate}
             disabled={isGenerating || !prompt.trim()}
             className="w-full flex justify-center items-center gap-2 py-3 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white rounded-xl font-semibold text-[14px] transition-all shadow-[0_4px_14px_0_rgba(21,93,252,0.3)] hover:shadow-[0_6px_20px_rgba(21,93,252,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Architecture...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate Flow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
