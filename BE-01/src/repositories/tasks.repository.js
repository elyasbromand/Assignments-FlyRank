import db from "../db/database.js";

const sampleTasks = [
  { id: 1, title: "Learn Express", done: false },
  { id: 2, title: "Document the API", done: false },
  { id: 3, title: "Test CRUD routes", done: true },
];

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
  };
}

function initializeDatabase() {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `,
  ).run();

  const row = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

  if (row.count === 0) {
    const insert = db.prepare(
      "INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)",
    );
    const runSeed = db.transaction((tasks) => {
      for (const task of tasks) {
        insert.run(task.id, task.title, task.done ? 1 : 0);
      }
    });

    runSeed(sampleTasks);
  }
}

function getAllTasks() {
  return tasks;
}

function getTaskById(id) {
  return tasks.find((task) => task.id === id);
}

function createTask(title) {
  const newTask = {
    id: tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1,
    title,
    done: false,
  };

  tasks.push(newTask);
  return newTask;
}

function updateTask(id, changes) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return null;
  Object.assign(task, changes);
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

initializeDatabase();
export { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
