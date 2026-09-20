# AI Decision Flow

A visual workflow builder where each node is an AI decision step that answers
**YES** or **NO**, branching the execution path accordingly. Workflows are
designed on a [React Flow](https://reactflow.dev) canvas and executed
step-by-step by [Inngest](https://www.inngest.com/), with each decision
resolved by an LLM call.

```
(Start) → "Is this a support request?" ──YES──▶ [Support]
                    │
                    └────NO────▶ "Is it a sales inquiry?" ──YES──▶ [Sales]
                                            │
                                            └────NO────▶ [General Inquiry]
```

## Features

**Flow editor**
- Drag-and-drop canvas (Start / Decision / Outcome nodes) built on React Flow
- Editable decision prompts and outcome labels, inline on each node
- Typed edges: a decision node exposes a **YES** handle and a **NO** handle,
  each allowed exactly one outgoing connection
- Node deletion with automatic edge cleanup

**Execution**
- Running a workflow POSTs the graph to an Inngest function, which walks the
  graph node-by-node as durable `step.run` calls
- Each decision node's prompt is sent to an LLM constrained to answer only
  `YES` or `NO`; the response selects which outgoing edge to follow
- Traversal continues until it reaches an Outcome node (or fails/hits a hop
  limit, e.g. a cycle in the graph)
- The frontend polls the run's status and replays the resulting trace onto
  the canvas: each visited node lights up (running → success/fail) in order,
  and the edges actually taken are highlighted and animated while the rest
  dim out

**Polish (4+ of the suggested features)**
- **Visual execution state** — per-node running/success/fail rings and
  animated "active path" edges, replayed step-by-step from the run trace
- **Execution logs panel** — a slide-over listing every past run with its
  outcome/error and full decision-by-decision trace
- **Execution history** — the last 50 runs persist in `localStorage` and
  survive a page reload
- **Save / load workflows** — name and store the current graph in
  `localStorage`, reload it later from a picker
- **JSON export / import** — download the graph as `workflow.json` or import
  one from disk
- **Error handling & retry** — a failed run reports which node it stopped at
  and why; **Retry** re-runs the workflow starting from just that node
  instead of from the top, merging the new trace with the successful prefix

## Tech stack

| Layer            | Choice |
|-------------------|--------|
| Framework          | Next.js 16 (App Router) |
| Flow canvas        | React Flow (`@xyflow/react`) |
| Workflow execution | Inngest |
| LLM client         | OpenAI SDK, pointed at [OpenRouter](https://openrouter.ai) |
| UI components      | shadcn/ui, Tailwind CSS, lucide-react icons |

The OpenAI SDK is used as a generic client against OpenRouter's
OpenAI-compatible API (`baseURL: https://openrouter.ai/api/v1`), which gives
access to a wide range of models — including free ones — through a single
`OPENROUTER_API_KEY`. Swapping the `baseURL`/key back to `api.openai.com`
works without further changes if you'd rather call OpenAI directly.

## Project structure

```
app/
  page.js                          # renders the flow canvas
  api/
    inngest/route.js               # Inngest handler (serves registered functions)
    workflow/run/route.js          # POST — queues a workflow run
    workflow/status/[eventId]/     # GET  — polls a run's status/result
components/
  flow/
    FlowCanvas.jsx                 # canvas, toolbar, save/load/export/import, logs panel
    StartNode.jsx / DecisionNode.jsx / OutcomeNode.jsx
    edges/DecisionEdge.jsx         # colored YES/NO edge with active-path styling
    exec-status.js                 # shared running/success/fail style helper
  ui/                               # shadcn/ui primitives
lib/
  inngest/
    client.js                      # Inngest client
    functions/run-workflow.js      # graph traversal + LLM decision function
  openai.js                        # OpenAI SDK client (OpenRouter-backed)
  workflow-storage.js              # localStorage save/load/list/delete
  run-history.js                   # localStorage execution history
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```bash
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=deepseek/deepseek-v4-flash-0731:free   # optional, this is the default
```

Get a key at [openrouter.ai/keys](https://openrouter.ai/keys). Any
OpenRouter-hosted chat model works — pick one via `OPENROUTER_MODEL`.

### 3. Run the Inngest dev server

```bash
npx inngest-cli@latest dev
```

This starts the Inngest dev UI at `http://localhost:8288`, where you can
watch each workflow run's steps execute live.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Both the Next.js app (`npm run dev`) and the Inngest dev server
(`npx inngest-cli@latest dev`) need to be running at the same time.

## Using it

1. Click **+ Decision** to add a decision node, and type a yes/no question
   into it (e.g. *"Is this a support request?"*).
2. Click **+ Outcome** to add one or more terminal outcome nodes, and name
   each one.
3. Drag from the green **YES** / red **NO** handle on a decision node to the
   next node in that branch. Connect **Start** to your first decision node.
4. Click **▶ Run Workflow**. The graph is sent to Inngest, which asks the
   LLM each decision node's question in turn and follows the matching edge.
   Watch nodes light up on the canvas as the run progresses.
5. Use **Save**/**Load** to keep named versions of a workflow, or
   **Export**/**Import** to move a workflow as a `workflow.json` file.
6. Open **Logs** to review past runs and their full decision trace. If a run
   fails partway through, use **Retry** to re-run just from the failed node.

## How execution works

1. The frontend sends the sanitized graph (`{ nodes, edges }`) to
   `POST /api/workflow/run`, which fires a `workflow/run` event via
   `inngest.send()` and returns immediately with an event id.
2. The `run-workflow` Inngest function (`lib/inngest/functions/run-workflow.js`)
   picks up the event and walks the graph starting from the Start node's
   outgoing edge:
   - For each **Decision** node, `step.run` sends its prompt to the LLM with
     a system instruction to answer only `YES`/`NO`, then follows the edge
     matching that answer.
   - Reaching an **Outcome** node ends the run with that node's label.
   - A cycle, a dangling edge, or an unparseable model response ends the run
     with an error and the id of the node where it stopped, along with the
     trace collected so far.
3. The frontend polls `GET /api/workflow/status/[eventId]` until the run
   reaches a terminal state, then replays the returned trace onto the canvas
   and records it to history.

## Notes

- The graph and saved workflows live entirely in the browser's
  `localStorage` — there is no database or server-side persistence.
- Each decision node's handle allows only one outgoing edge (enforced in the
  editor), matching the "exactly one YES path, one NO path" model.
