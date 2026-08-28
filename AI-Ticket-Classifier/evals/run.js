// evals/run.js
import { readFileSync } from "fs";

const ENDPOINT = process.env.EVAL_ENDPOINT ?? "http://localhost:3000/tickets";
const REQUEST_TIMEOUT_MS = 15_000;
const SEQUENTIAL_DELAY_MS = 3_100;

const cases = JSON.parse(readFileSync("cases.json", "utf-8"));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postTicket(text) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

function diff(actual, expected) {
  const fields = ["category", "priority"];
  const mismatches = [];
  for (const field of fields) {
    if (actual?.[field] !== expected[field]) {
      mismatches.push({
        field,
        expected: expected[field],
        actual: actual?.[field] ?? null,
      });
    }
  }
  return mismatches;
}

async function runCase(testCase) {
  let response;
  try {
    response = await postTicket(testCase.input);
  } catch (err) {
    return {
      id: testCase.id,
      passed: false,
      expected: testCase.expected,
      actual: null,
      mismatches: [],
      status: 0,
      error: err.name === "AbortError" ? "request timed out" : err.message,
    };
  }

  if (response.status !== 200 || !response.body) {
    return {
      id: testCase.id,
      passed: false,
      expected: testCase.expected,
      actual: response.body,
      mismatches: [],
      status: response.status,
      error:
        typeof response.body?.error === "string"
          ? response.body.error
          : `non-200 response: ${response.status}`,
    };
  }

  const actual = {
    category: response.body.category,
    priority: response.body.priority,
  };
  const mismatches = diff(actual, testCase.expected);

  return {
    id: testCase.id,
    passed: mismatches.length === 0,
    expected: testCase.expected,
    actual,
    mismatches,
    status: response.status,
    error: null,
  };
}

function formatResult(r) {
  const tag = r.passed ? "PASS" : "FAIL";
  const lines = [`  [${tag}] ${r.id}`];

  if (r.error) {
    lines.push(`    error: ${r.error} (status=${r.status})`);
    return lines.join("\n");
  }

  if (r.mismatches.length > 0) {
    for (const m of r.mismatches) {
      lines.push(
        `    ${m.field}: expected=${m.expected} actual=${m.actual}`,
      );
    }
  } else {
    lines.push(
      `    category=${r.actual.category} priority=${r.actual.priority}`,
    );
  }
  return lines.join("\n");
}

async function main() {
  const results = [];
  // Sequential, not Promise.all: each ticket calls the upstream LLM once (plus
  // a possible repair retry), and OpenRouter's free tier is rate-limited to
  // ~20 requests/minute. Firing them in parallel would 429 the suite and
  // produce noisy, non-deterministic failures. A small delay between cases
  // (3.1s) keeps us under the limit even when the server performs a repair
  // pass on top of the initial classification.
  for (const testCase of cases) {
    const result = await runCase(testCase);
    results.push(result);
    console.log(formatResult(result));
    if (testCase !== cases[cases.length - 1]) {
      await sleep(SEQUENTIAL_DELAY_MS);
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n${passed}/${total} passed`);

  const exitCode = passed === total ? 0 : 1;
  process.exit(exitCode);
}

main();
