import { inngest } from "./client.js";

// FUNCTION: "say-hello"
// - triggered by event: "test/hello"
// - inside the handler: use step.sleep(...) to wait 5 seconds,
//   then return the string "Hello from the background!"
export const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.sleep("wait-5-seconds", 5000);
    return "Hello from the background!";
  }
);