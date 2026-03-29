import { Handle, Position } from "reactflow";
import { LogOut } from "lucide-react";

export default function OutputNode({ data, selected }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 ${selected ? 'border-[#155DFC]' : 'border-zinc-200 dark:border-zinc-700'} min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-16 !bg-zinc-400" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          <LogOut size={16} />
        </div>
        <div className="font-semibold text-sm">{data.label || 'Output'}</div>
      </div>
    </div>
  );
}
