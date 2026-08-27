import { Router } from "express";
import { ticketInputSchema } from "../llm/schema.js";
import { ticketClassificationSchema } from "../llm/schema.js";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = ticketInputSchema.safeParse(req.body);
  if (!parsed.success) {
    const field = parsed.error.issues[0].path[0];
    const reason = parsed.error.issues[0].message;
    return res.status(400).json({ error: `${field}: ${reason}` });
  }

  if (process.env.LLM_STUB === "1") {
    const stub = {
      category: "billing",
      priority: "normal",
      sentiment: "neutral",
      summary: "I am unsure about the content of this ticket",
      confidence: 0.1,
    };
    const valid = ticketClassificationSchema.safeParse(stub);
    if (!valid.success) {
      console.error("Stub does not pass schema:", valid.error);
      return res.status(500).json({ error: "stub schema mismatch" });
    }
    return res.status(200).json(stub);
  }

  res.status(501).json({ error: "not implemented yet" });
});

export default router;