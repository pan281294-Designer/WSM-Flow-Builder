import { Handle, Position } from "reactflow";
import { Icon } from '@iconify/react';
import * as LucideIcons from 'lucide-react';
import * as UntitledIcons from '@untitledui/icons';
import { getComponentDetails } from "../../data/componentsList";

const STATUS_COLORS = {
  Active: '#10b981', Idle: '#f59e0b', Error: '#ef4444', Offline: '#64748b'
};

export default function UniversalNode({ id, data, selected }) {
  const details = getComponentDetails(data.componentId);
  const color = data.color || details?.colorHint || '#06b6d4';
  const status = data.status || 'Active';
  const statusColor = STATUS_COLORS[status];

  const renderIcon = () => {
    if (data.customIcon) {
      // Untitled UI: stored as "untitled:IconName"
      if (data.customIcon.startsWith('untitled:')) {
        const name = data.customIcon.slice(9);
        const U = UntitledIcons[name];
        if (U) return <U size={28} color={color} strokeWidth={1.5} />;
      }
      // Iconify: stored as "prefix:name"
      if (data.customIcon.includes(':')) return <Icon icon={data.customIcon} width={28} color={color} />;
      // Lucide: stored as plain name
      let L = LucideIcons[data.customIcon];
      if (!L) {
        // AI sometimes returns lowercase or kebab-case ("shield", "file-text")
        const pascalCase = data.customIcon.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        L = LucideIcons[pascalCase] || LucideIcons[data.customIcon.charAt(0).toUpperCase() + data.customIcon.slice(1)];
      }
      if (L) return <L size={28} color={color} strokeWidth={1.5} />;
    }
    if (details?.preferred === 'untitled' && details.untitledIcon) {
      const U = details.untitledIcon;
      return <U size={28} color={color} strokeWidth={1.5} />;
    }
    if (details?.preferred === 'hero' && details.heroIcon) {
      const H = details.heroIcon;
      return <H style={{ width: 28, height: 28, color }} strokeWidth={1.5} />;
    }
    if (details?.lucideIcon || details?.untitledIcon) {
      const I = details.untitledIcon || details.lucideIcon;
      return <I color={color} size={28} strokeWidth={1.5} />;
    }
    return null;
  };

  // All 4 handle positions — each is BOTH source and target so any can initiate or receive
  const handleStyle = (pos) => {
    const base = { '--hc': color };
    if (pos === 'top')    return { ...base, top: -7, left: '50%', transform: 'translateX(-50%)' };
    if (pos === 'bottom') return { ...base, bottom: -7, left: '50%', transform: 'translateX(-50%)' };
    if (pos === 'left')   return { ...base, left: -7, top: '50%', transform: 'translateY(-50%)' };
    if (pos === 'right')  return { ...base, right: -7, top: '50%', transform: 'translateY(-50%)' };
    return base;
  };

  const shape = data.shape || 'rectangle'; // rectangle | circle | diamond
  const radius = data.radius !== undefined ? `${data.radius}px` : (shape === 'circle' ? '50%' : '16px');
  
  const nodeStyle = {
    borderColor: selected ? '#155DFC' : undefined,
    boxShadow: selected ? `0 0 0 3px #155DFC33, 0 4px 12px rgba(0,0,0,0.08)` : undefined,
    borderRadius: radius,
  };

  const labelStyle = {
    fontSize: `${data.fontSize || 14}px`,
    fontWeight: data.fontWeight || 600,
    fontFamily: data.fontFamily || 'Inter, system-ui, sans-serif',
  };

  return (
    <div
      data-id={id}
      className={`universal-node flex flex-col items-center justify-center bg-white dark:bg-[#131720] border transition-all duration-150 p-4 relative 
        ${shape === 'diamond' ? 'rotate-45 w-[180px] h-[180px]' : (shape === 'circle' ? 'w-[180px] h-[180px]' : 'w-[200px] min-h-[170px]')}
        ${selected ? 'border-[2px] shadow-md' : 'border-[1.5px] border-slate-200 dark:border-[#1e293b] shadow-sm'}
      `}
      style={nodeStyle}
    >
      {/* Container for content that should NOT be rotated if the node is a diamond */}
      <div className={`flex flex-col items-center justify-center w-full h-full ${shape === 'diamond' ? '-rotate-45' : ''}`}>
        {/* All handles bidirectional — use connectionMode="loose" on ReactFlow */}
        <Handle id="top"    type="source" position={Position.Top}    className="node-handle" style={handleStyle('top')} />
        <Handle id="bottom" type="source" position={Position.Bottom} className="node-handle" style={handleStyle('bottom')} />
        <Handle id="left"   type="source" position={Position.Left}   className="node-handle" style={handleStyle('left')} />
        <Handle id="right"  type="source" position={Position.Right}  className="node-handle" style={handleStyle('right')} />

        {/* Icon */}
        <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center mb-3 transition-colors shrink-0"
          style={{ backgroundColor: `${color}1A` }}>
          {renderIcon()}
        </div>

        {/* Label */}
        <div 
          className="text-slate-800 dark:text-[#f1f5f9] text-center mb-2 px-2 leading-tight break-words w-full line-clamp-3"
          style={labelStyle}
          title={data.label || details?.label}
        >
          {data.label || details?.label}
        </div>

        {/* Status */}
        {status !== 'None' && (
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-slate-400 dark:text-[#64748b] text-[10px] font-bold tracking-wider uppercase">
              {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
