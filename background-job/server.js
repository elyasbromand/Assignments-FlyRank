import express from "express";
import { inngest } from "./inngest/client.js";
import { sayHello, makeReport  } from "./inngest/functions.js";
import { serve } from "inngest/express";
import { randomUUID } from "crypto";
import { reports } from "./data/store.js";

const app = express();
app.use(express.json());

const PORT = 3000;

app.use("/api/inngest", serve({ client: inngest, functions: [ sayHello, makeReport ] }));

app.post("/reports", async (req, res) => {
  const { topic } = req.body;

  // TODO: generate an id with randomUUID()
  const id = randomUUID();
  // TODO: save { id, topic, status: "pending" } into `reports`
  reports.set(id, { id, topic, status: "pending" });
  // TODO: send the event "report/requested" via inngest.send(), with { id, topic } as data
  await inngest.send({
    name: "report/requested",
    data: { id, topic },
  });
  // TODO: respond with status 202 and body { id, status: "pending" }
  res.status(202).json({ id, status: "pending" });
});

app.get("/reports/:id", (req, res) => {
  // TODO: look up reports.get(req.params.id)
  const report = reports.get(req.params.id);
  // TODO: if missing -> 404
  if(!report) {
    res.status(404).json({ error: "Report not found" });
  } else {
    res.status(200).json(report);
  }
  // TODO: else -> return the stored object as JSON
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
