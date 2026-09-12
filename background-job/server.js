import express from "express";
import { inngest } from "./inngest/client.js";
import { sayHello } from "./inngest/functions.js";
import { serve } from "inngest/express";

const app = express();
app.use(express.json());

const PORT = 3000;

app.use("/api/inngest", serve({ client: inngest, functions: [sayHello] }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok"});
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});