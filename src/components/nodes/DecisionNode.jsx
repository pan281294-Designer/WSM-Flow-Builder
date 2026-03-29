import { Handle, Position } from "reactflow";
import { GitBranch } from "lucide-react";

export default function DecisionNode({ data, selected }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 ${selected ? 'border-[#155DFC]' : 'border-zinc-200 dark:border-zinc-700'} min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-16 !bg-zinc-400" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
          <GitBranch size={16} />
        </div>
        <div className="font-semibold text-sm">{data.label || 'Decision'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} className="!bg-green-500" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} className="!bg-red-500" />
    </div>
  );
}
