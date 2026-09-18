import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { execStatusRingClass } from "./exec-status";

export function StartNode({ data }) {
  return (
    <div
      className={cn(
        "rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm transition-shadow",
        execStatusRingClass(data.execStatus),
      )}
    >
      {data.label || "Start"}
      <Handle type="source" position={Position.Right} className="!bg-slate-900" />
    </div>
  );
}