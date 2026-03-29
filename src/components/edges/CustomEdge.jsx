import { useState, useRef, useEffect } from 'react';
import {
  EdgeLabelRenderer, BaseEdge,
  getBezierPath, getStraightPath, getSmoothStepPath,
} from 'reactflow';
import { useFlowStore } from '../../store/useFlowStore';

// ── SVG icon components for clean rendering ─────────────────────────
const IconCurved   = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13 C4 5, 12 5, 14 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/></svg>;
const IconStep     = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13 L2 5 L14 5 L14 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
const IconStraight = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconSolid    = () => <svg width="20" height="8"  viewBox="0 0 20 8"  fill="none"><line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconDashed   = () => <svg width="20" height="8"  viewBox="0 0 20 8"  fill="none"><line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round"/></svg>;
const IconDotted   = () => <svg width="20" height="8"  viewBox="0 0 20 8"  fill="none"><line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round"/></svg>;
const IconArrow    = () => <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><line x1="0" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 2 L19 6 L12 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
const IconNoArrow  = () => <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><line x1="2" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;

const SHAPES = [
  { key: 'bezier',     Icon: IconCurved,   title: 'Curved'   },
  { key: 'smoothstep', Icon: IconStep,     title: 'Step'     },
  { key: 'straight',   Icon: IconStraight, title: 'Straight' },
];
const STROKES = [
  { key: 'solid',  Icon: IconSolid,  dash: undefined, title: 'Solid'  },
  { key: 'dashed', Icon: IconDashed, dash: '8 5',     title: 'Dashed' },
  { key: 'dotted', Icon: IconDotted, dash: '2 4',     title: 'Dotted' },
];
const ARROWS = [
  { key: 'arrow', Icon: IconArrow,   title: 'With arrow' },
  { key: 'none',  Icon: IconNoArrow, title: 'No arrow'   },
];

function buildPath(shape, p) {
  const base = { sourceX: p.sourceX, sourceY: p.sourceY, sourcePosition: p.sourcePosition, targetX: p.targetX, targetY: p.targetY, targetPosition: p.targetPosition };
  if (shape === 'straight')   return getStraightPath(base);
  if (shape === 'smoothstep') return getSmoothStepPath({ ...base, borderRadius: 14 });
  return getBezierPath(base);
}

const Divider = () => <div className="w-px self-stretch bg-slate-200 dark:bg-[#30363d] mx-0.5" />;

function ToolBtn({ active, title, children, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-100
        ${active
          ? 'bg-[#155DFC]/10 text-[#155DFC]'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#22272e] hover:text-slate-800 dark:hover:text-slate-100'
        }`}
    >
      {children}
    </button>
  );
}

const LABEL_COLORS = {
  emerald: { bg: 'bg-white dark:bg-[#131720]', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', shadow: 'shadow-emerald-100' },
  violet:  { bg: 'bg-white dark:bg-[#131720]', border: 'border-violet-500',  text: 'text-violet-700 dark:text-violet-300',   shadow: 'shadow-violet-100'  },
  blue:    { bg: 'bg-white dark:bg-[#131720]', border: 'border-blue-500',    text: 'text-blue-700 dark:text-blue-300',     shadow: 'shadow-blue-100'    },
  cyan:    { bg: 'bg-white dark:bg-[#131720]', border: 'border-cyan-500',    text: 'text-cyan-700 dark:text-cyan-300',     shadow: 'shadow-cyan-100'    },
  amber:   { bg: 'bg-white dark:bg-[#131720]', border: 'border-amber-500',   text: 'text-amber-700 dark:text-amber-400',   shadow: 'shadow-amber-100'   },
  rose:    { bg: 'bg-white dark:bg-[#131720]', border: 'border-rose-500',    text: 'text-rose-700 dark:text-rose-400',     shadow: 'shadow-rose-100'    },
  slate:   { bg: 'bg-white dark:bg-[#131720]', border: 'border-slate-400',   text: 'text-slate-700 dark:text-slate-300',   shadow: 'shadow-slate-100'   },
};

export default function CustomEdge(props) {
  const { id, selected, data = {} } = props;
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const label  = data.label  || '';
  const showLabel = data.showLabel !== false;
  const labelColor = data.labelColor || 'emerald';
  const shape  = data.shape  || 'bezier';
  const stroke = data.stroke || 'solid';
  const arrow  = data.arrow  || 'arrow';
  const color  = selected ? '#155DFC' : '#cbd5e1';
  const width  = data.width || 2;

  const [edgePath, labelX, labelY] = buildPath(shape, props);
  const dashArray = STROKES.find(s => s.key === stroke)?.dash;

  const updateEdge = (patch) => {
    useFlowStore.setState(state => ({
      edges: state.edges.map(e =>
        e.id === id ? { ...e, data: { ...(e.data || {}), ...patch } } : e
      ),
    }));
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const styles = LABEL_COLORS[labelColor] || LABEL_COLORS.emerald;

  return (
    <>
      <defs>
        <marker id={`arrowhead-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L8,3 Z" fill={color} />
        </marker>
      </defs>

      <BaseEdge
        path={edgePath}
        markerEnd={arrow === 'arrow' ? `url(#arrowhead-${id})` : undefined}
        style={{
          stroke: color,
          strokeWidth: width,
          strokeDasharray: dashArray,
          strokeLinecap: 'round',
          transition: 'stroke 0.15s',
        }}
      />

      <EdgeLabelRenderer>
        {/* The Tag (Pill) — Use explicit z-index and background to ensure it's on top */}
        {showLabel && (
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              left: labelX,
              top: labelY,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'all',
              zIndex: 1000, 
              backgroundColor: styles.bg.includes('white') ? '#ffffff' : '#131720'
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                className={`px-3 py-1 rounded-full border-2 bg-white dark:bg-[#161b22] text-[13px] font-semibold outline-none shadow-lg text-center min-w-[60px] ${styles.border} ${styles.text}`}
                value={label}
                onChange={(e) => updateEdge({ label: e.target.value })}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              />
            ) : (
              label && (
                <div 
                  className={`px-4 py-1.5 rounded-full border-2 transition-all cursor-text text-[13px] font-bold shadow-sm whitespace-nowrap
                    ${styles.bg} ${styles.border} ${styles.text} ${styles.shadow}
                    ${selected ? '!border-[#155DFC] !text-[#155DFC] dark:!text-[#155DFC]' : ''}
                  `}
                  style={{ backgroundColor: 'inherit' }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        )}

        {/* The Toolbar */}
        {selected && (
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              left: labelX,
              // Offset upwards so it doesn't overlap the label if present
              top: labelY - (label && showLabel ? 35 : 0),
              transform: 'translate(-50%, calc(-100% - 15px))',
              pointerEvents: 'all',
              zIndex: 1000,
            }}
          >
            <div className="flex items-center gap-0.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-xl px-2 py-1.5 shadow-lg shadow-slate-200/60 dark:shadow-black/50">
              {SHAPES.map(({ key, Icon, title }) => (
                <ToolBtn key={key} active={shape === key} title={title} onClick={() => updateEdge({ shape: key })}>
                  <Icon />
                </ToolBtn>
              ))}
              <Divider />
              {STROKES.map(({ key, Icon, title }) => (
                <ToolBtn key={key} active={stroke === key} title={title} onClick={() => updateEdge({ stroke: key })}>
                  <Icon />
                </ToolBtn>
              ))}
              <Divider />
              {ARROWS.map(({ key, Icon, title }) => (
                <ToolBtn key={key} active={arrow === key} title={title} onClick={() => updateEdge({ arrow: key })}>
                  <Icon />
                </ToolBtn>
              ))}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
