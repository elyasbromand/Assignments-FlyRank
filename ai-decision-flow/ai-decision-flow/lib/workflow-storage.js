const STORAGE_KEY = "ai-decision-flow:workflows";

function readAll() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function saveWorkflow(name, { nodes, edges }) {
  const all = readAll();
  all[name] = { nodes, edges, savedAt: new Date().toISOString() };
  writeAll(all);
}

export function listWorkflows() {
  return Object.entries(readAll())
    .map(([name, w]) => ({ name, savedAt: w.savedAt }))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function loadWorkflow(name) {
  return readAll()[name] ?? null;
}

export function deleteWorkflow(name) {
  const all = readAll();
  delete all[name];
  writeAll(all);
}
