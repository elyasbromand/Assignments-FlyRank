import { inngest } from "@/lib/inngest/client";

export const runWorkflow = inngest.createFunction(
  { id: "run-workflow" },
  { event: "workflow/run" },
  async ({ event, step }) => {
    // Phase 3: traverse event.data.nodes / event.data.edges here
  }
);