import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { configDotenv } from "dotenv";
import { withRetry } from "./retry.js";

configDotenv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000,
  maxRetries: 0,
});

const systemPrompt = readFileSync(
  path.join(__dirname, "../../prompts/ticket-classifier-v1.md"),
  "utf-8",
);

const PROMPT_VERSION = "v1";

function logCall({ model, usage, durationMs, wasRepair }) {
  console.log(
    JSON.stringify({
      event: "llm_call",
      promptVersion: PROMPT_VERSION,
      model,
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
      durationMs,
      wasRepair,
    }),
  );
}

function makeCompletion(messages) {
  return () =>
    client.chat.completions.create({
      model: process.env.LLM_MODEL,
      temperature: 0,
      messages,
    });
}

export async function classifyTicket(ticketText) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify({ text: ticketText }) },
  ];
  const start = Date.now();
  const res = await withRetry(makeCompletion(messages), {
    onRetry: ({ attempt, err, delayMs }) =>
      console.warn(
        JSON.stringify({
          event: "llm_retry",
          where: "classifyTicket",
          attempt,
          delayMs,
          status: err?.status,
          message: err?.message,
        }),
      ),
  });
  logCall({
    model: res.model,
    usage: res.usage,
    durationMs: Date.now() - start,
    wasRepair: false,
  });
  return res.choices[0].message.content;
}

export async function repairClassification(
  ticketText,
  brokenOutput,
  validationError,
) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify({ text: ticketText }) },
    { role: "assistant", content: brokenOutput },
    {
      role: "user",
      content: JSON.stringify({
        error: validationError,
        instruction:
          "The previous answer was rejected. Please provide ONLY corrected JSON.",
      }),
    },
  ];
  const start = Date.now();
  const res = await withRetry(makeCompletion(messages), {
    onRetry: ({ attempt, err, delayMs }) =>
      console.warn(
        JSON.stringify({
          event: "llm_retry",
          where: "repairClassification",
          attempt,
          delayMs,
          status: err?.status,
          message: err?.message,
        }),
      ),
  });
  logCall({
    model: res.model,
    usage: res.usage,
    durationMs: Date.now() - start,
    wasRepair: true,
  });
  return res.choices[0].message.content;
}
