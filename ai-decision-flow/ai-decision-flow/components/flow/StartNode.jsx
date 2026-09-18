import { Handle, Position } from "@xyflow/react";

export function StartNode({ data }) {
  return (
    <div className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm">
      {data.label || "Start"}
      <Handle type="source" position={Position.Right} className="!bg-slate-900" />
    </div>
  );
}