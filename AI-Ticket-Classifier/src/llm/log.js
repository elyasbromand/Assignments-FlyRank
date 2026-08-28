import fs from "fs";

export function quarantine(input, rawOutput, error) {
  fs.mkdirSync("logs", { recursive: true });
  fs.appendFileSync(
    "logs/quarantine.jsonl",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      promptVersion: "v1",
      input,
      rawOutput,
      error,
    }) + "\n",
  );
}
