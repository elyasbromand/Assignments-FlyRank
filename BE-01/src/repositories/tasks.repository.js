import db from "../db/database.js";

const sampleTasks = [
  { id: 1, title: "Learn Express", done: false },
  { id: 2, title: "Document the API", done: false },
  { id: 3, title: "Test CRUD routes", done: true },
];

// mapTask is a safe function to shape the response, so that we don't expose the internal db schema
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
  const rows = db
    .prepare("SELECT id, title, done FROM tasks ORDER BY id")
    .all();
  return rows.map(mapTask);
}

function getTaskById(id) {
  const row = db
    .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
    .get(id);
  return row ? mapTask(row) : null;
}

function createTask(title) {
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  const info = insert.run(title, 0);
  if (info.changes === 0) {
    return null;
  }
  return getTaskById(info.lastInsertRowid);
}

function updateTask(id, changes) {
  const current = getTaskById(id);
  if (!current) {
    return null;
  }

  const nextTitle = changes.title !== undefined ? changes.title : current.title;
  const nextDone =
    changes.done !== undefined ? (changes.done ? 1 : 0) : current.done ? 1 : 0;

  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(
    nextTitle,
    nextDone,
    id,
  );

  return getTaskById(id);
}

function deleteTask(id) {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}

initializeDatabase();
export { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
