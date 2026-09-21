import { join } from "node:path";
import { db } from "./db.js";
import { getReportData } from "./queries.js";
import { buildHtml } from "./template.js";
import { renderPdf } from "./render.js";

const root = join(import.meta.dirname, "..");
export const reportsDir = join(root, "reports");

export async function createReport() {
  const { lastInsertRowid } = db.prepare(`INSERT INTO reports (created_at) VALUES (?)`).run(new Date().toISOString());
  const id = Number(lastInsertRowid);
  const path = join(reportsDir, `${id}.pdf`);
  await renderPdf(buildHtml(getReportData()), path);
  db.prepare(`UPDATE reports SET path = ? WHERE id = ?`).run(path, id);
  return getReport(id);
}

export function getReport(id) {
  const report = db.prepare(`SELECT id, path, created_at FROM reports WHERE id = ?`).get(id);
  return report || undefined;
}