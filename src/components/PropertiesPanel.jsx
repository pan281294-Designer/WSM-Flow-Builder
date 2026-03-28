import { useFlowStore } from "../store/useFlowStore";
import { COMPONENT_CATEGORIES, getComponentDetails } from "../data/componentsList";
import IconPicker from "./IconPicker";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";

const COLORS = ['#06b6d4','#a855f7','#10b981','#f59e0b','#ec4899','#64748b','#ef4444','#3b82f6'];

// ── SVG icons for edge controls ──────────────────────────────────────────────
const IconCurved   = () => <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 12 C4 2, 14 2, 17 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/></svg>;
const IconStep     = () => <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 12 L1 3 L17 3 L17 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
const IconStraight = () => <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><line x1="1" y1="12" x2="17" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconSolid    = () => <svg width="22" height="8"  viewBox="0 0 22 8"  fill="none"><line x1="0" y1="4" x2="22" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconDashed   = () => <svg width="22" height="8"  viewBox="0 0 22 8"  fill="none"><line x1="0" y1="4" x2="22" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round"/></svg>;
const IconDotted   = () => <svg width="22" height="8"  viewBox="0 0 22 8"  fill="none"><line x1="0" y1="4" x2="22" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round"/></svg>;
const IconArrow    = () => <svg width="22" height="12" viewBox="0 0 22 12" fill="none"><line x1="0" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M13 2 L20 6 L13 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
const IconNoArrow  = () => <svg width="22" height="12" viewBox="0 0 22 12" fill="none"><line x1="2" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;

const IconRect     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>;
const IconCircle   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>;
const IconDiamond  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l6.59 6.59a2.41 2.41 0 0 0 3.41 0l6.59-6.59a2.41 2.41 0 0 0 0-3.41l-6.59-6.59a2.41 2.41 0 0 0-3.41 0L2.7 10.3Z"/></svg>;

function SectionLabel({ children }) {
  return <Label className="text-[10px] font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-widest block mb-2">{children}</Label>;
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt.key}
          title={opt.title}
          onClick={() => onChange(opt.key)}
          className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-all text-slate-500 dark:text-slate-400
            ${value === opt.key
              ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300'
              : 'border-slate-200 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-[#1c212b]'
            }`}
        >
          {opt.Icon && <opt.Icon />}
          {opt.label && <span className="text-[12px] font-medium">{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Edge Properties ───────────────────────────────────────────────────────────
function EdgeProperties({ edgeId }) {
  const { edges, updateEdgeData } = useFlowStore();
  const edge = edges.find(e => e.id === edgeId);
  if (!edge) return null;
  const d = edge.data || {};
  const upd = (key, val) => updateEdgeData(edgeId, { [key]: val });
  const colors = ['emerald', 'violet', 'blue', 'cyan', 'amber', 'rose', 'slate'];

  return (
    <div className="space-y-5">
      {/* Label Toggle & Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Description</SectionLabel>
          <Switch
            checked={d.showLabel !== false}
            onCheckedChange={(checked) => upd('showLabel', checked)}
            className="scale-75 data-[state=checked]:bg-cyan-500"
          />
        </div>

        {d.showLabel !== false && (
          <div className="space-y-3">
            <Input
              className="bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[13px] font-medium text-slate-800 dark:text-[#e2e8f0] focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
              value={d.label || ''}
              onChange={e => upd('label', e.target.value)}
              placeholder="e.g. Connect to data"
            />
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => upd('labelColor', c)}
                  className={`w-6 h-6 rounded-md border-2 transition-all ${d.labelColor === c || (!d.labelColor && c === 'emerald') ? 'border-cyan-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c === 'emerald' ? '#10b981' : c === 'violet' ? '#8b5cf6' : c === 'blue' ? '#3b82f6' : c === 'cyan' ? '#06b6d4' : c === 'amber' ? '#f59e0b' : c === 'rose' ? '#f43f5e' : '#64748b' }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shape */}
      <div>
        <SectionLabel>Line shape</SectionLabel>
        <ToggleGroup
          value={d.shape || 'bezier'}
          onChange={v => upd('shape', v)}
          options={[
            { key: 'bezier',     Icon: IconCurved,   title: 'Curved'   },
            { key: 'smoothstep', Icon: IconStep,      title: 'Step'     },
            { key: 'straight',   Icon: IconStraight,  title: 'Straight' },
          ]}
        />
      </div>

      {/* Stroke */}
      <div>
        <SectionLabel>Stroke style</SectionLabel>
        <ToggleGroup
          value={d.stroke || 'solid'}
          onChange={v => upd('stroke', v)}
          options={[
            { key: 'solid',  Icon: IconSolid,  title: 'Solid'  },
            { key: 'dashed', Icon: IconDashed, title: 'Dashed' },
            { key: 'dotted', Icon: IconDotted, title: 'Dotted' },
          ]}
        />
      </div>

      {/* Arrow */}
      <div>
        <SectionLabel>Arrow</SectionLabel>
        <ToggleGroup
          value={d.arrow || 'arrow'}
          onChange={v => upd('arrow', v)}
          options={[
            { key: 'arrow', Icon: IconArrow,   title: 'With arrow' },
            { key: 'none',  Icon: IconNoArrow, title: 'No arrow'   },
          ]}
        />
      </div>
    </div>
  );
}

// ── Node Properties ───────────────────────────────────────────────────────────
function NodeProperties({ nodeId }) {
  const { nodes, updateNodeData } = useFlowStore();
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;
  const details = getComponentDetails(node.data.componentId);
  const color = node.data?.color || '#06b6d4';
  const upd = (key, val) => updateNodeData(nodeId, { [key]: val });

  const radiusValue = node.data.radius ?? (node.data.shape === 'circle' ? 99 : 16);

  return (
    <div className="space-y-5">
      {/* Label */}
      <div>
        <SectionLabel>Label</SectionLabel>
        <Input
          className="bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[13px] font-medium text-slate-800 dark:text-[#e2e8f0] focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
          value={node.data.label || details?.label || ''}
          onChange={e => upd('label', e.target.value)}
          placeholder="Enter display name"
        />
      </div>

      {/* Type */}
      <div>
        <SectionLabel>Type</SectionLabel>
        <Select
          value={node.data.componentId || ''}
          onValueChange={val => {
            const nd = getComponentDetails(val);
            updateNodeData(nodeId, { componentId: val, label: nd.label, customIcon: null });
          }}
        >
          <SelectTrigger className="bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[13px] font-medium text-slate-800 dark:text-[#e2e8f0] focus:ring-cyan-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-[#161b22] dark:border-[#30363d]">
            {COMPONENT_CATEGORIES.map(cat => (
              <SelectGroup key={cat.id}>
                <SelectLabel className="text-[10px] font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">{cat.name}</SelectLabel>
                {cat.items.map(item => (
                  <SelectItem key={item.id} value={item.id} className="text-[13px] dark:text-[#e2e8f0] focus:bg-violet-50 dark:focus:bg-violet-900/30">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Icon */}
      <IconPicker currentIcon={node.data.customIcon || null} color={color} onSelect={icon => upd('customIcon', icon)} />

      {/* Color */}
      <div>
        <SectionLabel>Color</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => upd('color', c)}
              className={`h-10 rounded-xl transition-all outline-none border-[2.5px] ${color === c ? 'scale-110 shadow border-white dark:border-[#f8fafc]' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <SectionLabel>Status</SectionLabel>
        <Select value={node.data.status || 'Active'} onValueChange={val => upd('status', val)}>
          <SelectTrigger className="bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[13px] font-medium text-slate-800 dark:text-[#e2e8f0] focus:ring-cyan-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-[#161b22] dark:border-[#30363d]">
            {['Active', 'Idle', 'Error', 'Offline'].map(s => (
              <SelectItem key={s} value={s} className="text-[13px] dark:text-[#e2e8f0]">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="dark:bg-[#1e2330]" />

      {/* Shape & Style */}
      <div className="space-y-4">
        <div>
          <SectionLabel>Shape</SectionLabel>
          <ToggleGroup
            value={node.data.shape || 'rectangle'}
            onChange={v => upd('shape', v)}
            options={[
              { key: 'rectangle', Icon: IconRect,    title: 'Rectangle' },
              { key: 'circle',    Icon: IconCircle,  title: 'Circle'    },
              { key: 'diamond',   Icon: IconDiamond, title: 'Diamond'   },
            ]}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Corner Radius</SectionLabel>
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 dark:bg-[#1e2330] dark:text-slate-400">
              {radiusValue}px
            </Badge>
          </div>
          <Slider
            min={0} max={60} step={2}
            value={[radiusValue]}
            onValueChange={([val]) => upd('radius', val)}
            className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-500"
          />
        </div>
      </div>

      <Separator className="dark:bg-[#1e2330]" />

      {/* Typography */}
      <div className="space-y-4">
        <SectionLabel>Typography</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase block">Size</Label>
            <Select value={String(node.data.fontSize || 14)} onValueChange={val => upd('fontSize', parseInt(val))}>
              <SelectTrigger className="bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[12px] font-bold text-slate-800 dark:text-[#e2e8f0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#161b22] dark:border-[#30363d]">
                {[12, 13, 14, 15, 16, 18, 20, 24, 32].map(s => (
                  <SelectItem key={s} value={String(s)} className="text-[12px] dark:text-[#e2e8f0]">{s}px</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase block">Weight</Label>
            <Select value={String(node.data.fontWeight || 600)} onValueChange={val => upd('fontWeight', parseInt(val))}>
              <SelectTrigger className="bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[12px] font-bold text-slate-800 dark:text-[#e2e8f0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#161b22] dark:border-[#30363d]">
                <SelectItem value="400" className="text-[12px] dark:text-[#e2e8f0]">Regular</SelectItem>
                <SelectItem value="500" className="text-[12px] dark:text-[#e2e8f0]">Medium</SelectItem>
                <SelectItem value="600" className="text-[12px] dark:text-[#e2e8f0]">SemiBold</SelectItem>
                <SelectItem value="700" className="text-[12px] dark:text-[#e2e8f0]">Bold</SelectItem>
                <SelectItem value="800" className="text-[12px] dark:text-[#e2e8f0]">ExtraBold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase block">Font Family</Label>
          <Select value={node.data.fontFamily || 'Inter'} onValueChange={val => upd('fontFamily', val)}>
            <SelectTrigger className="bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[12px] font-bold text-slate-800 dark:text-[#e2e8f0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#161b22] dark:border-[#30363d]">
              {['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Source Code Pro'].map(f => (
                <SelectItem key={f} value={f} className="text-[12px] dark:text-[#e2e8f0]">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <SectionLabel>Description</SectionLabel>
        <Textarea
          value={node.data.description || ''}
          onChange={e => upd('description', e.target.value)}
          className="h-20 bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-[13px] font-medium text-slate-800 dark:text-[#e2e8f0] focus-visible:ring-cyan-500 focus-visible:border-cyan-500 resize-none"
          placeholder="Describe this component…"
        />
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function PropertiesPanel() {
  const { selectedNodeId, selectedEdgeId } = useFlowStore();
  const mode = selectedEdgeId ? 'edge' : selectedNodeId ? 'node' : 'empty';

  return (
    <div className="w-[320px] border-l border-slate-200 dark:border-[#1e2330] flex flex-col bg-white dark:bg-[#0d1017] transition-colors shadow-xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-[#1e2330]">
        <h2 className="font-bold text-[14px] text-slate-800 dark:text-[#f8fafc]">
          {mode === 'edge' ? '⚡ Connection Properties' : mode === 'node' ? '⬡ Node Properties' : 'Properties'}
        </h2>
        {mode !== 'empty' && (
          <p className="text-[11px] text-slate-400 dark:text-[#64748b] mt-0.5">
            {mode === 'edge' ? 'Edit selected connection' : 'Edit selected node'}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {mode === 'empty' && (
          <div className="flex flex-col items-center justify-center h-full text-center border-[1.5px] border-dashed border-slate-200 dark:border-[#1e2330] rounded-xl bg-slate-50 dark:bg-[#161b22]/50 p-8 mt-4">
            <p className="text-[13px] text-slate-500 dark:text-[#64748b] font-medium">Nothing selected</p>
            <p className="text-[12px] text-slate-400 dark:text-[#475569] mt-1">Click a node or connection line to edit</p>
          </div>
        )}
        {mode === 'node' && <NodeProperties nodeId={selectedNodeId} />}
        {mode === 'edge' && <EdgeProperties edgeId={selectedEdgeId} />}
      </div>
    </div>
  );
}
