import { inngest } from "@/lib/inngest/client";
import { openai } from "@/lib/openai";

const MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-flash-0731:free";
const MAX_HOPS = 25; // guards against a cycle in the user-built graph

function buildEdgeMap(edges) {
  const map = {};
  for (const e of edges) {
    map[`${e.source}:${e.sourceHandle || "default"}`] = e.target;
  }
  return map;
}

async function askYesNo(prompt) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    max_tokens: 20,
    reasoning: { enabled: false },
    messages: [
      {
        role: "system",
        content:
          'You are a strict binary classifier. Respond with exactly one word: "YES" or "NO". No punctuation, no explanation.',
      },
      { role: "user", content: prompt },
    ],
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error(
      `Model returned no content (finish_reason: "${completion.choices[0].finish_reason}") — it may have exhausted its token budget on hidden reasoning instead of answering`
    );
  }

  const raw = content.trim().toUpperCase();
  if (raw.startsWith("YES")) return "yes";
  if (raw.startsWith("NO")) return "no";
  throw new Error(`Model returned unparseable answer: "${raw}"`);
}

export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", triggers: { event: "workflow/run" } },
  async ({ event, step }) => {
    const { nodes, edges } = event.data;
    const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const edgeMap = buildEdgeMap(edges);

    const startNode = nodes.find((n) => n.type === "start");
    if (!startNode) throw new Error("No start node found in graph");

    const trace = [];
    let currentId = edgeMap[`${startNode.id}:default`];
    let hops = 0;

    // A thrown error here (bad graph shape, or the LLM step exhausting its
    // own retries) would otherwise propagate out of the function, discard
    // `trace`, and cause Inngest to keep retrying a traversal that can never
    // succeed. Catching it lets us return the partial trace plus which node
    // failed, so the UI can show exactly where execution stopped.
    try {
      while (currentId) {
        if (++hops > MAX_HOPS) throw new Error("Max hops exceeded — check for a cycle in the graph");

        const node = nodeById[currentId];
        if (!node) throw new Error(`Node ${currentId} referenced by an edge but not found`);

        if (node.type === "outcome") {
          trace.push({ nodeId: node.id, type: "outcome", label: node.data.label });
          return { outcome: node.data.label, trace };
        }

        if (node.type !== "decision") {
          throw new Error(`Unsupported node type mid-traversal: ${node.type}`);
        }

        const answer = await step.run(`decide-${node.id}`, () => askYesNo(node.data.prompt));
        trace.push({ nodeId: node.id, type: "decision", prompt: node.data.prompt, answer });

        const nextId = edgeMap[`${node.id}:${answer}`];
        if (!nextId) throw new Error(`Decision node ${node.id} has no "${answer}" edge`);
        currentId = nextId;
      }

      return { outcome: null, trace }; // dead-ended without hitting an outcome node
    } catch (err) {
      return { outcome: null, trace, error: err.message, failedNodeId: currentId };
    }
  }
);