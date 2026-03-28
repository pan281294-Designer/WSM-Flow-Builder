import { Handle, Position } from "reactflow";
import { LogIn } from "lucide-react";

export default function InputNode({ data, selected }) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 ${selected ? 'border-blue-500' : 'border-zinc-200 dark:border-zinc-700'} min-w-[150px]`}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
          <LogIn size={16} />
        </div>
        <div className="font-semibold text-sm">{data.label || 'Start'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-zinc-400" />
    </div>
  );
}
