import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";

const COLORS = { yes: "#22c55e", no: "#ef4444" };

export function DecisionEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const color = COLORS[data?.branch] || "#94a3b8";

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: color, strokeWidth: 2 }} />
      {data?.branch && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: color,
              color: "white",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          >
            {data.branch.toUpperCase()}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}