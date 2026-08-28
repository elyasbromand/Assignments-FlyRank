import { Router } from "express";
import { ticketInputSchema } from "../llm/schema.js";
import { ticketClassificationSchema } from "../llm/schema.js";
import { classifyTicket, repairClassification } from "../llm/client.js";
import { parseModelOutput } from "../llm/parse.js";
import { quarantine } from "../llm/log.js";

const router = Router();

async function tryClassify(text, raw) {
  const parsed = parseModelOutput(raw);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, raw };
  }
  const valid = ticketClassificationSchema.safeParse(parsed.data);
  if (!valid.success) {
    return { ok: false, error: valid.error.issues[0].message, raw };
  }
  return { ok: true, data: valid.data };
}

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

  try {
    const raw = await classifyTicket(parsed.data.text);
    const first = await tryClassify(parsed.data.text, raw);
    if (first.ok) {
      return res.status(200).json(first.data);
    }

    const repairedRaw = await repairClassification(
      parsed.data.text,
      raw,
      first.error,
    );
    const second = await tryClassify(parsed.data.text, repairedRaw);
    if (second.ok) {
      return res.status(200).json(second.data);
    }

    quarantine(parsed.data.text, { raw, repairedRaw }, second.error);
    return res
      .status(422)
      .json({ error: "could not produce a valid classification" });
  } catch (err) {
    quarantine(parsed.data.text, null, err.message);
    return res.status(500).json({ error: "classification request failed" });
  }
});

export default router;
