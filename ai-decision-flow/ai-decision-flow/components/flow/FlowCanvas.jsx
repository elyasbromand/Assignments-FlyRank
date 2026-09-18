"use client";
import { useCallback, useRef, useState } from "react";
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
import { Save, FolderOpen, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DecisionNode } from "./DecisionNode";
import { StartNode } from "./StartNode";
import { OutcomeNode } from "./OutcomeNode";
import { DecisionEdge } from "./edges/DecisionEdge";
import { saveWorkflow, listWorkflows, loadWorkflow, deleteWorkflow } from "@/lib/workflow-storage";

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

// Keeps future nextId() calls from colliding with ids restored from a
// saved/imported graph (idCounter otherwise has no idea those ids exist).
function syncIdCounter(nodes) {
  const maxExisting = nodes.reduce((max, n) => {
    const match = /^node-(\d+)$/.exec(n.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  idCounter = Math.max(idCounter, maxExisting + 1);
}

function sanitizeNodes(nodes) {
  return nodes.map(({ id, type, position, data }) => ({
    id,
    type,
    position,
    data: { prompt: data.prompt, label: data.label },
  }));
}

// sanitizeNodes strips the onPromptChange callback before saving (it's a
// function, not serializable) — this puts it back on load/import so
// decision node textareas stay editable.
function rehydrateNodes(nodes, onPromptChange) {
  return nodes.map((n) =>
    n.type === "decision" ? { ...n, data: { ...n.data, onPromptChange } } : n,
  );
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [running, setRunning] = useState(false);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [loadOpen, setLoadOpen] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const importInputRef = useRef(null);

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

  const loadGraph = useCallback(
    ({ nodes: loadedNodes, edges: loadedEdges }) => {
      const hydrated = rehydrateNodes(loadedNodes, updateNodePrompt);
      syncIdCounter(hydrated);
      setNodes(hydrated);
      setEdges(loadedEdges);
    },
    [setNodes, setEdges, updateNodePrompt],
  );

  const handleSaveConfirm = () => {
    const name = saveName.trim();
    if (!name) return;
    saveWorkflow(name, { nodes: sanitizeNodes(nodes), edges });
    setSaveName("");
    setSaveOpen(false);
  };

  const openLoadDialog = () => {
    setSavedWorkflows(listWorkflows());
    setLoadOpen(true);
  };

  const handleLoadPick = (name) => {
    const workflow = loadWorkflow(name);
    if (!workflow) return;
    loadGraph(workflow);
    setLoadOpen(false);
  };

  const handleDeleteSaved = (name) => {
    deleteWorkflow(name);
    setSavedWorkflows(listWorkflows());
  };

  const handleExport = () => {
    const payload = { nodes: sanitizeNodes(nodes), edges };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow importing the same filename again later
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error("File must contain { nodes, edges }");
      }
      loadGraph(parsed);
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: sanitizeNodes(nodes), edges }),
      });
      const data = await res.json();
      console.log("Queued:", data); // Phase 4 replaces this with a real logs panel
    } finally {
      setRunning(false);
    }
  };

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
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            disabled={running}
          >
            {running ? "Running..." : "▶ Run Workflow"}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button size="sm" variant="outline" onClick={() => setSaveOpen(true)}>
            <Save /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={openLoadDialog}>
            <FolderOpen /> Load
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download /> Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => importInputRef.current?.click()}
          >
            <Upload /> Import
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </Panel>
      </ReactFlow>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save workflow</DialogTitle>
            <DialogDescription>
              Saved locally in this browser. Loading later restores nodes,
              prompts, and connections exactly as they are now.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveConfirm()}
            placeholder="e.g. Support Triage v1"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm} disabled={!saveName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load workflow</DialogTitle>
            <DialogDescription>
              Replaces the current canvas with the saved graph.
            </DialogDescription>
          </DialogHeader>
          {savedWorkflows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved workflows yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {savedWorkflows.map((w) => (
                <div
                  key={w.name}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5"
                >
                  <button
                    onClick={() => handleLoadPick(w.name)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-medium">{w.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(w.savedAt).toLocaleString()}
                    </div>
                  </button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDeleteSaved(w.name)}
                    aria-label={`Delete ${w.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
