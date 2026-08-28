export function parseModelOutput(raw) {
  if (typeof raw !== "string") {
    return { ok: false, error: "raw output is not a string" };
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return { ok: false, error: "no JSON object found in output" };
  }

  const slice = raw.slice(firstBrace, lastBrace + 1);

  try {
    const data = JSON.parse(slice);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: `JSON parse failed: ${err.message}` };
  }
}
