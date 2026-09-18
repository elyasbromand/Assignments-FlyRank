"use client";
import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { DecisionNode } from "./DecisionNode";
import { StartNode } from "./StartNode";
import { OutcomeNode } from "./OutcomeNode";
import { DecisionEdge } from "./edges/DecisionEdge";

const nodeTypes = {
  start: StartNode,
  decision: DecisionNode,
  outcome: OutcomeNode,
};
const edgeTypes = { decision: DecisionEdge };

const initialNodes = [
  {
    id: "start",
    type: "start",
    position: { x: 50, y: 150 },
    data: { label: "Start" },
  },
];

let idCounter = 1;
const nextId = () => `node-${idCounter++}`;

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const updateNodePrompt = useCallback(
    (id, prompt) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, prompt } } : n,
        ),
      );
    },
    [setNodes],
  );

  const onConnect = useCallback(
    (connection) => {
      // one outgoing edge per handle — a decision node can't have two YES paths
      const alreadyUsed = edges.some(
        (e) =>
          e.source === connection.source &&
          e.sourceHandle === connection.sourceHandle,
      );
      if (alreadyUsed) return;

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "decision",
            data: { branch: connection.sourceHandle },
          },
          eds,
        ),
      );
    },
    [edges, setEdges],
  );

  const addDecisionNode = () => {
    const id = nextId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "decision",
        position: { x: 320 + Math.random() * 120, y: 80 + Math.random() * 240 },
        data: { prompt: "", onPromptChange: updateNodePrompt },
      },
    ]);
  };

  const addOutcomeNode = () => {
    const id = nextId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "outcome",
        position: { x: 640 + Math.random() * 80, y: 80 + Math.random() * 240 },
        data: { label: "Outcome" },
      },
    ]);
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-left" className="flex gap-2">
          <Button size="sm" onClick={addDecisionNode}>
            + Decision
          </Button>
          <Button size="sm" variant="outline" onClick={addOutcomeNode}>
            + Outcome
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
