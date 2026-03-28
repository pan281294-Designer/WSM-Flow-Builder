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
      const L = LucideIcons[data.customIcon];
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
  const layout = data.layout || 'vertical';
  
  const nodeStyle = {
    borderColor: selected ? color : (data.borderColor || undefined),
    borderWidth: data.borderWidth !== undefined ? `${data.borderWidth}px` : undefined,
    borderStyle: data.borderStyle || 'solid',
    boxShadow: selected ? `0 0 0 3px ${color}33, 0 8px 24px rgba(0,0,0,0.12)` : (data.shadow || '0 4px 12px rgba(0,0,0,0.05)'),
    borderRadius: radius,
    backgroundColor: data.bgColor || undefined,
  };

  const labelStyle = {
    fontSize: `${data.fontSize || 14}px`,
    fontWeight: data.fontWeight || 600,
    fontFamily: data.fontFamily || 'Inter, system-ui, sans-serif',
  };

  return (
    <div
      className={`universal-node bg-white dark:bg-[#131720] border transition-all duration-150 p-4 relative 
        ${layout === 'horizontal' ? 'w-[320px] min-h-[110px]' : (shape === 'diamond' ? 'w-[180px] h-[180px] rotate-45' : (shape === 'circle' ? 'w-[180px] h-[180px]' : 'w-[200px] min-h-[170px]'))}
        ${selected ? 'border-[2.5px] shadow-lg scale-[1.02]' : 'border-[1.5px] border-slate-200 dark:border-[#1e293b] shadow-sm'}
        flex items-center justify-center
      `}
      style={nodeStyle}
    >
      {/* Handles are always relative to the main container */}
      <Handle id="top"    type="source" position={Position.Top}    className="node-handle" style={handleStyle('top')} />
      <Handle id="bottom" type="source" position={Position.Bottom} className="node-handle" style={handleStyle('bottom')} />
      <Handle id="left"   type="source" position={Position.Left}   className="node-handle" style={handleStyle('left')} />
      <Handle id="right"  type="source" position={Position.Right}  className="node-handle" style={handleStyle('right')} />

      {/* Content Container */}
      <div className={`w-full h-full flex ${layout === 'horizontal' ? 'flex-row items-center gap-5' : 'flex-col items-center justify-center'} ${shape === 'diamond' ? '-rotate-45' : ''}`}>
        
        {/* Icon Wrapper */}
        <div 
          className="rounded-2xl flex items-center justify-center transition-all shrink-0"
          style={{ 
            backgroundColor: `${color}1A`,
            width: layout === 'horizontal' ? '76px' : '64px',
            height: layout === 'horizontal' ? '76px' : '64px',
            borderRadius: data.iconRadius !== undefined ? `${data.iconRadius}px` : '18px'
          }}
        >
          {renderIcon()}
        </div>

        {/* Text Area */}
        <div className={`flex flex-col ${layout === 'horizontal' ? 'items-start text-left flex-1 min-w-0' : 'items-center text-center mt-3'}`}>
          <div 
            className="text-slate-900 dark:text-[#f1f5f9] leading-tight break-words w-full"
            style={labelStyle}
          >
            {data.label || details?.label}
          </div>

          <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
            <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
            <span className="text-slate-400 dark:text-[#64748b] text-[10px] font-bold tracking-wider uppercase truncate">
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
