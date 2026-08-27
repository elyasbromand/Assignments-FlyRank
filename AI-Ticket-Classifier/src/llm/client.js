import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { configDotenv } from "dotenv";

configDotenv();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.OPEN_ROUTER_API_KEY,
});

const systemPrompt = readFileSync(
  path.join(__dirname, "../../prompts/ticket-classifier-v1.md"),
  "utf-8"
);

export async function classifyTicket(ticketText) {
  const res = await client.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify({ text: ticketText }) },
    ],
  });

  return res.choices[0].message.content;
}