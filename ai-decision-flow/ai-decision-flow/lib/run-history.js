const STORAGE_KEY = "ai-decision-flow:history";
const MAX_ENTRIES = 50;

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

// Adds a finished run to history (newest first) and returns the updated
// list, so callers can update their state from the same call.
export function addHistoryEntry({ status, outcome, error, failedNodeId, trace }) {
  const all = readAll();
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    status,
    outcome: outcome ?? null,
    error: error ?? null,
    failedNodeId: failedNodeId ?? null,
    trace: trace ?? [],
  };
  const next = [entry, ...all].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function listHistory() {
  return readAll();
}

export function clearHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
