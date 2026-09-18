import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";

export function OutcomeNode({ data }) {
  return (
    <div className="w-40 rounded-xl border border-purple-200 bg-purple-50 px-3 py-3 text-center shadow-sm">
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 mb-1">Outcome</Badge>
      <div className="text-sm font-medium text-purple-900">{data.label}</div>
      <Handle type="target" position={Position.Left} className="!bg-purple-400" />
    </div>
  );
}