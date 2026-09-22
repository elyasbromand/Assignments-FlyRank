import { join } from "node:path";
import { db } from "./db.js";
import { getReportData } from "./queries.js";
import { buildHtml } from "./template.js";
import { renderPdf } from "./render.js";
import { randomUUID } from "node:crypto";

const root = join(import.meta.dirname, "..");
export const reportsDir = join(root, "reports");

const claim = db.prepare(
  `INSERT INTO reports (report_date, path, created_at)
   VALUES (?, NULL, ?)
   ON CONFLICT (report_date) DO NOTHING`,
);

const latestForDate = db.prepare(
  `SELECT id, report_date, path, created_at
   FROM reports
   WHERE substr(report_date, 1, 10) = ?
   ORDER BY id DESC
   LIMIT 1`,
);

export async function createReport({ force = false } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const key = force ? `${today}#${randomUUID()}` : today;

  const { changes, lastInsertRowid } = claim.run(key, new Date().toISOString());

  if (changes === 0) {
    // means there is already a report for today, so we return the latest one
    return { report: latestForDate.get(today), created: false };
  }

  const id = Number(lastInsertRowid);
  const path = join(reportsDir, `${id}.pdf`);
  await renderPdf(buildHtml(getReportData()), path);
  db.prepare(`UPDATE reports SET path = ? WHERE id = ?`).run(path, id);

  return { report: getReport(id), created: true };
}

export function getReport(id) {
  return db
    .prepare(`SELECT id, report_date, path, created_at FROM reports WHERE id = ?`)
    .get(id);
}
