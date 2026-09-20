"use client";
import { Handle, Position } from "@xyflow/react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { execStatusRingClass } from "./exec-status";

export function DecisionNode({ id, data }) {
  return (
    <div
      className={cn(
        "relative w-64 rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow",
        execStatusRingClass(data.execStatus),
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100">
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Decision</Badge>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">{id}</span>
          <Button
            size="icon-xs"
            variant="ghost"
            className="nodrag text-slate-400 hover:bg-red-50 hover:text-red-600"
            onClick={() => data.onDelete?.(id)}
            aria-label="Delete node"
          >
            <X />
          </Button>
        </div>
      </div>

      <div className="p-3">
        <Textarea
          value={data.prompt || ""}
          onChange={(e) => data.onPromptChange?.(id, e.target.value)}
          placeholder="e.g. Is this a support request?"
          className="min-h-[70px] text-sm resize-none nodrag"
        />
      </div>

      <Handle type="target" position={Position.Left} className="!bg-slate-400" />

      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        style={{ top: "35%", background: "#22c55e", width: 10, height: 10 }}
      />
      <span className="absolute right-[-32px] top-[29%] text-[10px] font-semibold text-green-600">
        YES
      </span>

      <Handle
        type="source"
        position={Position.Right}
        id="no"
        style={{ top: "70%", background: "#ef4444", width: 10, height: 10 }}
      />
      <span className="absolute right-[-28px] top-[64%] text-[10px] font-semibold text-red-600">
        NO
      </span>
    </div>
  );
}