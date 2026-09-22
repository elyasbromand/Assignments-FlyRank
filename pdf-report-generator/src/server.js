// src/server.js
import express from "express";
import { existsSync } from "node:fs";
import { createReport, getReport } from "./reports.js";

const app = express();
app.use(express.json());

const toJson = (r) => ({
  id: r.id,
  created_at: r.created_at,
  file: `/reports/${r.id}/file`,
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/reports", async (req, res) => {
  const { report, created } = await createReport({ force: req.body?.force === true });
  res.status(created ? 201 : 200).json(toJson(report));
});

app.get("/reports/:id", (req, res) => {
  const report = getReport(Number(req.params.id));
  if (!report) return res.status(404).json({ error: "report not found" });
  res.json(toJson(report));
});

app.get("/reports/:id/file", (req, res) => {
  const report = getReport(Number(req.params.id));
  if (!report?.path || !existsSync(report.path)) {
    return res.status(404).json({ error: "file not found" });
  }
  res.sendFile(report.path);
});

app.listen(3000, () => console.log("http://localhost:3000"));