"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Save, FolderOpen, Download, Upload, Trash2, ScrollText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { DecisionNode } from "./DecisionNode";
import { StartNode } from "./StartNode";
import { OutcomeNode } from "./OutcomeNode";
import { DecisionEdge } from "./edges/DecisionEdge";
import { saveWorkflow, listWorkflows, loadWorkflow, deleteWorkflow } from "@/lib/workflow-storage";
import { addHistoryEntry, listHistory, clearHistory } from "@/lib/run-history";

const TERMINAL_STATUSES = ["Completed", "Failed", "Cancelled"];
const POLL_INTERVAL_MS = 1200;
const POLL_TIMEOUT_MS = 30_000;
const REPLAY_RUNNING_MS = 450; // how long a node shows "running" before settling
const REPLAY_SETTLE_MS = 250; // pause after settling before advancing to the next node

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// sanitizeNodes strips the onPromptChange/onLabelChange callbacks before
// saving (functions aren't serializable) — this puts them back on
// load/import so node inputs stay editable.
function rehydrateNodes(nodes, { onPromptChange, onLabelChange }) {
  return nodes.map((n) => {
    if (n.type === "decision") return { ...n, data: { ...n.data, onPromptChange } };
    if (n.type === "outcome") return { ...n, data: { ...n.data, onLabelChange } };
    return n;
  });
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

  const [runResult, setRunResult] = useState(null); // { status, outcome?, trace?, error?, failedNodeId? }
  const pollRef = useRef(null);

  const [execStatus, setExecStatus] = useState({}); // { [nodeId]: "running" | "success" | "fail" }

  const [logsOpen, setLogsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Every terminal run result (success, workflow failure, network/timeout
  // failure) goes through here so it's recorded to history exactly once,
  // with the newest entry auto-expanded in the logs panel.
  const recordResult = useCallback((data) => {
    setRunResult(data);
    const updated = addHistoryEntry(data);
    setHistory(updated);
    setExpandedIds(updated[0] ? new Set([updated[0].id]) : new Set());
  }, []);

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openLogsDialog = () => {
    setHistory(listHistory());
    setLogsOpen(true);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setExpandedIds(new Set());
  };

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

  const updateNodeLabel = useCallback(
    (id, label) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n,
        ),
      );
    },
    [setNodes],
  );

  const loadGraph = useCallback(
    ({ nodes: loadedNodes, edges: loadedEdges }) => {
      const hydrated = rehydrateNodes(loadedNodes, { onPromptChange: updateNodePrompt, onLabelChange: updateNodeLabel });
      syncIdCounter(hydrated);
      setNodes(hydrated);
      setEdges(loadedEdges);
    },
    [setNodes, setEdges, updateNodePrompt, updateNodeLabel],
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

  const pollStatus = useCallback((eventId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    const startedAt = Date.now();

    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        clearInterval(pollRef.current);
        recordResult({ status: "Failed", error: "Timed out waiting for a result" });
        setRunning(false);
        return;
      }

      const res = await fetch(`/api/workflow/status/${eventId}`);
      const data = await res.json();

      if (TERMINAL_STATUSES.includes(data.status)) {
        clearInterval(pollRef.current);
        recordResult(data);
        setRunning(false);
      }
    }, POLL_INTERVAL_MS);
  }, [recordResult]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setExecStatus({});
    try {
      const res = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: sanitizeNodes(nodes), edges }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to queue workflow");
      pollStatus(data.eventId);
    } catch (err) {
      recordResult({ status: "Failed", error: err.message });
      setRunning(false);
    }
  };

  // Replays the finished run's trace onto the canvas one node at a time —
  // we only get the final trace from polling (Option A), not live per-step
  // updates, so this recreates the "watch it execute" feel after the fact.
  useEffect(() => {
    if (!runResult?.trace) return;
    let cancelled = false;

    const play = async () => {
      const startNode = nodes.find((n) => n.type === "start");
      if (startNode) setExecStatus((s) => ({ ...s, [startNode.id]: "success" }));

      for (const entry of runResult.trace) {
        if (cancelled) return;
        const isFailedNode = runResult.status === "Failed" && entry.nodeId === runResult.failedNodeId;

        setExecStatus((s) => ({ ...s, [entry.nodeId]: "running" }));
        await sleep(REPLAY_RUNNING_MS);
        if (cancelled) return;

        setExecStatus((s) => ({ ...s, [entry.nodeId]: isFailedNode ? "fail" : "success" }));
        await sleep(REPLAY_SETTLE_MS);
      }

      // Traversal errors that happen before reaching a node (e.g. an edge
      // pointing at a node id that doesn't exist) leave failedNodeId out of
      // the trace entirely — mark it directly so the failure is still visible.
      if (
        !cancelled &&
        runResult.status === "Failed" &&
        runResult.failedNodeId &&
        !runResult.trace.some((t) => t.nodeId === runResult.failedNodeId)
      ) {
        setExecStatus((s) => ({ ...s, [runResult.failedNodeId]: "fail" }));
      }
    };

    play();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- replay only when a new result arrives, not on every nodes/setExecStatus identity change
  }, [runResult]);

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
        data: { label: "Outcome", onLabelChange: updateNodeLabel },
      },
    ]);
  };

  // Execution state is kept separate from `nodes`/`edges` (the editable,
  // saveable graph) and merged in only for rendering, so Save/Export never
  // pick up transient run state and dragging/editing never has to know
  // about it either.
  const activeEdgeKeys = useMemo(() => {
    if (!runResult?.trace) return null;
    const startNode = nodes.find((n) => n.type === "start");
    const keys = new Set(startNode ? [`${startNode.id}:default`] : []);
    for (const entry of runResult.trace) {
      if (entry.type === "decision") keys.add(`${entry.nodeId}:${entry.answer}`);
    }
    return keys;
  }, [runResult, nodes]);

  const displayNodes = useMemo(
    () => nodes.map((n) => ({ ...n, data: { ...n.data, execStatus: execStatus[n.id] } })),
    [nodes, execStatus],
  );

  const displayEdges = useMemo(() => {
    if (!activeEdgeKeys) return edges;
    return edges.map((e) => {
      const active = activeEdgeKeys.has(`${e.source}:${e.sourceHandle || "default"}`);
      return { ...e, animated: active, data: { ...e.data, active } };
    });
  }, [edges, activeEdgeKeys]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
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

          {runResult?.status === "Completed" && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              ✓ {runResult.outcome ?? "No outcome reached"}
            </Badge>
          )}
          {(runResult?.status === "Failed" || runResult?.status === "Cancelled") && (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              ✕ {runResult.error ?? runResult.status}
            </Badge>
          )}

          <Button size="sm" variant="outline" onClick={openLogsDialog}>
            <ScrollText /> Logs
            {history.length > 0 && <Badge variant="outline">{history.length}</Badge>}
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

      <Sheet open={logsOpen} onOpenChange={setLogsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Execution logs</SheetTitle>
            <SheetDescription>
              Newest run first. Click a run to see its step-by-step trace.
            </SheetDescription>
          </SheetHeader>

          <div className="-mx-4 flex-1 overflow-y-auto px-4">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No runs yet — hit Run Workflow to see logs here.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((entry) => {
                  const isExpanded = expandedIds.has(entry.id);
                  const ok = entry.status === "Completed";
                  return (
                    <div key={entry.id} className="rounded-lg border border-border">
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Badge
                            className={
                              ok
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                            }
                          >
                            {ok ? "✓" : "✕"}
                          </Badge>
                          <span className="truncate text-sm font-medium">
                            {ok ? (entry.outcome ?? "No outcome reached") : entry.error}
                          </span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                      <div className="px-2.5 pb-2 text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>

                      {isExpanded && (
                        <div className="flex flex-col gap-2 border-t border-border px-2.5 py-2">
                          {entry.trace.length === 0 && (
                            <p className="text-xs text-muted-foreground">No steps recorded.</p>
                          )}
                          {entry.trace.map((step, i) =>
                            step.type === "decision" ? (
                              <div key={i} className="flex flex-col gap-0.5 text-xs">
                                <span className="font-medium text-slate-700">{step.nodeId}</span>
                                <span className="text-slate-500">&ldquo;{step.prompt}&rdquo;</span>
                                <span
                                  className={
                                    step.answer === "yes"
                                      ? "font-semibold text-green-600"
                                      : "font-semibold text-red-600"
                                  }
                                >
                                  → {step.answer.toUpperCase()}
                                  {step.nodeId === entry.failedNodeId && " (failed here)"}
                                </span>
                              </div>
                            ) : (
                              <div key={i} className="text-xs font-medium text-purple-700">
                                → Outcome: {step.label}
                              </div>
                            ),
                          )}
                          {entry.status === "Failed" &&
                            entry.failedNodeId &&
                            !entry.trace.some((t) => t.nodeId === entry.failedNodeId) && (
                              <div className="text-xs text-red-600">
                                Failed at {entry.failedNodeId}: {entry.error}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <SheetFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              <Trash2 /> Clear history
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
