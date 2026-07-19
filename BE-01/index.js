import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

app.use(express.json());

const port = 3000;

const options = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "ToDo Express API with Swagger",
      version: "1.0",
      description:
        "A simple CRUD API built with Express and documented with Swagger.",
    },
    servers: [{ url: "http://localhost:3000" }],
    tags: [{ name: "General" }, { name: "Tasks" }],
  },
  apis: ["./index.js"],
};

const specs = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

const tasks = [
  { id: 1, title: "Journal Writing", done: false },
  { id: 2, title: "Exercise", done: true },
  { id: 3, title: "Read a book", done: false },
];

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 version:
 *                   type: string
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 */
app.get("/", (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 done:
 *                   type: string
 */
app.get("/health", (req, res) => {
  res.json({ done: "ok" });
});

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreateInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 */
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

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateInput'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required: [id, title, done]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Journal Writing
 *         done:
 *           type: boolean
 *           example: false
 *     TaskCreateInput:
 *       type: object
 *       required: [title]
 *       properties:
 *         title:
 *           type: string
 *           example: Journal Writing
 *     TaskUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Journal Writing
 *         done:
 *           type: boolean
 *           example: false
 */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
