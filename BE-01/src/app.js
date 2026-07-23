import express from "express";
import swaggerUi from "swagger-ui-express";
import specs from "../openapi.json" with { type: "json" };
import tasksRouter from "./routes/tasks.router.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.get("/", (req, res) => {
	res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req, res) => {
	res.json({ done: "ok" });
});

app.use("/tasks", tasksRouter);

// error handler should be last
app.use(errorHandler);

export default app;

