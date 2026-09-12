import { inngest } from "./client.js";
import { reports } from "../data/store.js";

// FUNCTION: "say-hello"
// - triggered by event: "test/hello"
// - inside the handler: use step.sleep(...) to wait 5 seconds,
//   then return the string "Hello from the background!"
export const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.sleep("wait-5-seconds", 5000);
    return "Hello from the background!";
  },
);

// FUNCTION: "make-report"
// - triggered by event: "report/requested"
// - event.data will contain { id, topic }
export const makeReport = inngest.createFunction(
  { id: "make-report", triggers: [{ event: "report/requested" }], retries: 2 },
  async ({ event, step }) => {
    const { id, topic } = event.data;
    await step.sleep("do-the-slow-work", 8000);

    // step.run("build-report", async () => { ... })
    // - build some kind of result object (up to you — a fake summary is fine)
    // - fetch the existing entry from `reports` by id
    // - update it with { ...entry, status: "done", result }
    // - save it back into the map
    await step.run("build-report", async () => {
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }

      const result = { summary: `This is a report on ${topic}` };
      const entry = reports.get(id);

      reports.set(id, { ...entry, status: "done", result });
    });
  },
);
