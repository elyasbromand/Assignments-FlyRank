import express from "express";
import swaggerUi from "swagger-ui-express";
import specs from "./openapi.json" with { type: "json" };

const app = express();

app.use(express.json());

const port = 3000;

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

const tasks = [
  { id: 1, title: "Journal Writing", done: false },
  { id: 2, title: "Exercise", done: true },
  { id: 3, title: "Read a book", done: false },
];

app.get("/", (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req, res) => {
  res.json({ done: "ok" });
});

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    done: false,
  };

  tasks.push(newTask);

  return res.status(201).json(newTask);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = Number.parseInt(req.params.id, 10);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  return res.json(task);
});

app.put("/tasks/:id", (req, res) => {
  const taskId = Number.parseInt(req.params.id, 10);
  const { title, done } = req.body;
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  if (title !== undefined && title.trim() !== "") {
    tasks[taskIndex].title = title;
  }

  if (done !== undefined) {
    tasks[taskIndex].done = done;
  }

  return res.json(tasks[taskIndex]);
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = Number.parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  tasks.splice(taskIndex, 1);

  return res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
