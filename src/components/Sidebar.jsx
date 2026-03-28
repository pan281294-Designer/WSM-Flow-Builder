import { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { COMPONENT_CATEGORIES } from '../data/componentsList';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState({
    'data-storage': true,
    'core-ai-ml': true,
    'client': true,
  });

  const toggleCategory = (id) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', nodeData.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = COMPONENT_CATEGORIES.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0 || searchTerm === '');

  return (
    <div className="w-[300px] flex flex-col h-full bg-slate-50 dark:bg-[#0d1017] border-r border-slate-200 dark:border-[#1e2330] z-10 font-sans text-sm selection:bg-cyan-200 dark:selection:bg-cyan-900 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-colors">
      {/* Header */}
      <div className="p-4 flex-shrink-0 bg-white dark:bg-[#0d1017] transition-colors">
         <h2 className="text-slate-800 dark:text-[#f8fafc] font-semibold text-[16px] mb-3">Components</h2>
         <div className="relative">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748b] z-10" />
           <Input
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="bg-slate-100 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] focus-visible:border-cyan-500 focus-visible:ring-cyan-500 pl-9 text-slate-700 dark:text-[#e2e8f0] text-[13px] placeholder:text-slate-400 dark:placeholder:text-[#64748b]"
             placeholder="Search components..."
           />
         </div>
      </div>

      {/* Categories */}
      <ScrollArea className="flex-1">
        <div className="pb-10">
        {filteredCategories.map((category) => {
          const isOpen = openCategories[category.id] || searchTerm !== '';
          return (
            <div key={category.id} className="border-t border-slate-200 dark:border-[#1e2330]/50">
              <button 
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-transparent hover:bg-slate-200/50 dark:hover:bg-[#161b22]/50 transition-colors focus:outline-none"
              >
                <span className="text-slate-500 dark:text-[#64748b] text-[11px] font-bold tracking-widest uppercase">{category.name}</span>
                {isOpen ? <ChevronDown size={14} className="text-slate-400 dark:text-[#64748b]" /> : <ChevronRight size={14} className="text-slate-400 dark:text-[#64748b]" />}
              </button>
              
              {isOpen && (
                <div className="px-3 pb-3 flex flex-col gap-1.5 pt-1">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onDragStart={(event) => onDragStart(event, item)}
                      draggable
                      className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-[#1c212b] transition-all group border border-transparent hover:shadow-sm dark:hover:shadow-none hover:border-slate-200 dark:hover:border-[#30363d]"
                    >
                      <div className={`p-1.5 rounded-lg ${item.iconBg}`}>
                        <item.icon className={item.iconColor} size={16} strokeWidth={2} />
                      </div>
                      <span className="text-slate-600 dark:text-[#cbd5e1] text-[13.5px] font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </ScrollArea>

      {/* Footer sticky block */}
      <div className="p-4 bg-slate-100 dark:bg-[#161b22] border-t border-slate-200 dark:border-[#30363d] flex-shrink-0 text-center shadow-[0_-10px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.3)] transition-colors">
         <p className="text-slate-500 dark:text-[#64748b] text-[12.5px] font-medium">Drag components onto the canvas</p>
      </div>
    </div>
  );
}
