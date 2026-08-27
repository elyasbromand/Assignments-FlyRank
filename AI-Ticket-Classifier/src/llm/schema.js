import { z } from "zod";

export const ticketInputSchema = z.object({
  text: z.string().min(1).max(1000),
});

// category: enum of 5 values
// priority: enum of 3 values
// sentiment: enum of 4 values
// summary: a string (capped — one short sentence)
// confidence: number between 0 and 1
export const ticketClassificationSchema = z.object({
  category: z.enum(["billing", "bug", "account", "feature_guide", "other"]),
  priority: z.enum(["low", "normal", "high"]),
  sentiment: z.enum(["negative", "neutral", "positive", "unsure"]),
  summary: z.string().max(400),
  confidence: z.number().min(0).max(1),
});