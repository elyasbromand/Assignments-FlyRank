import { NextResponse } from "next/server";

const INNGEST_BASE_URL = process.env.INNGEST_DEV_SERVER_URL || "http://localhost:8288";

// The documented REST endpoint (GET /v1/events/:id/runs) reports run_id and
// status correctly against the local dev server, but its "output" field
// comes back empty for Completed runs on this CLI build — that only works
// as documented against Inngest Cloud. The dev server's own UI gets output
// from an internal GraphQL endpoint (/v0/gql), so we fall back to that.
// This GraphQL route is undocumented and dev-server-only — do not point
// this at Inngest Cloud; swap back to the plain REST response (or Realtime)
// when deploying against Cloud.
async function fetchRunOutput(runId) {
  const res = await fetch(`${INNGEST_BASE_URL}/v0/gql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($runId: String!) { run(runID: $runId) { output } }`,
      variables: { runId },
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const raw = json?.data?.run?.output;
  if (!raw) return null;

  // "output" is a JSON-stringified array of executor ops, e.g.
  // [{"op":"RunComplete","data":{...the function's return value...}}]
  let ops;
  try {
    ops = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(ops)) return null;

  const complete = ops.find((o) => o.op === "RunComplete");
  if (complete) return { ok: true, result: complete.data };

  const failed = ops.find((o) => o.error || o.op === "StepError");
  if (failed) return { ok: false, error: failed.error ?? "Workflow failed" };

  // Unrecognized op shape — hand back the raw ops so it's visible in devtools
  // instead of silently swallowing data we don't yet know how to parse.
  return { ok: false, error: "Unrecognized run output", raw: ops };
}

export async function GET(_req, { params }) {
  const { eventId } = await params;

  const runsRes = await fetch(`${INNGEST_BASE_URL}/v1/events/${eventId}/runs`);
  if (!runsRes.ok) {
    return NextResponse.json({ status: "Unknown" }, { status: 502 });
  }
  const { data } = await runsRes.json();
  const run = data?.[0];
  if (!run) {
    return NextResponse.json({ status: "Unknown" });
  }

  if (run.status !== "Completed" && run.status !== "Failed") {
    return NextResponse.json({ status: run.status });
  }

  const output = await fetchRunOutput(run.run_id);
  if (run.status === "Completed" && output?.ok) {
    const result = output.result;
    // run-workflow.js catches its own traversal/step errors and returns
    // them normally (see its comment) rather than throwing — so a
    // "Completed" Inngest run can still represent a failed workflow.
    if (result?.error) {
      return NextResponse.json({
        status: "Failed",
        error: result.error,
        failedNodeId: result.failedNodeId ?? null,
        trace: result.trace ?? [],
      });
    }
    return NextResponse.json({
      status: "Completed",
      outcome: result?.outcome ?? null,
      trace: result?.trace ?? [],
    });
  }

  return NextResponse.json({
    status: "Failed",
    error: output?.error ?? "Workflow failed — check the terminal running `inngest dev`",
    raw: output?.raw,
  });
}
