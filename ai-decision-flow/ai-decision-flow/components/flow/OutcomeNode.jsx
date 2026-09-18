import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { execStatusRingClass } from "./exec-status";

export function OutcomeNode({ id, data }) {
  return (
    <div
      className={cn(
        "w-40 rounded-xl border border-purple-200 bg-purple-50 px-3 py-3 text-center shadow-sm transition-shadow",
        execStatusRingClass(data.execStatus),
      )}
    >
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 mb-1">Outcome</Badge>
      <Input
        value={data.label || ""}
        onChange={(e) => data.onLabelChange?.(id, e.target.value)}
        placeholder="Outcome name"
        className="h-7 border-purple-200 bg-white text-center text-sm font-medium text-purple-900 nodrag"
      />
      <Handle type="target" position={Position.Left} className="!bg-purple-400" />
    </div>
  );
}