"use client";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export function FlowCanvas() {
  // Phase 2: wire up state, custom node/edge types
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ReactFlow nodes={[]} edges={[]}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}