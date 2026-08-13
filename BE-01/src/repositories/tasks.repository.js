import pool from "../db/database.js";

const sampleTasks = [
  { id: 1, title: "Learn Express", done: false },
  { id: 2, title: "Document the API", done: false },
  { id: 3, title: "Test CRUD routes", done: true },
];

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    done: row.done,
  };
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT false
    )
  `);

  const { rowCount } = await pool.query(
    "SELECT COUNT(*) AS count FROM tasks"
  );

  if (rowCount === 0) {
    const insert = await pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
      [sampleTasks[0].title, sampleTasks[0].done ? true : false]
    );

    for (const task of sampleTasks) {
      await pool.query(
        "INSERT INTO tasks (title, done) VALUES ($1, $2)",
        [task.title, task.done]
      );
    }
  }
}
async function getAllTasks() {
  const { rows } = await pool.query(
    "SELECT id, title, done FROM tasks ORDER BY id"
  );
  return rows.map(mapTask);
}

async function getTaskById(id) {
  const { rows } = await pool.query(
    "SELECT id, title, done FROM tasks WHERE id = $1",
    [id]
  );
  return rows.length > 0 ? mapTask(rows[0]) : null;
}

async function createTask(title) {
  const { rows } = await pool.query(
    "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
    [title, false]
  );
  return mapTask(rows[0]);
}

async function updateTask(id, changes) {
  const current = await getTaskById(id);
  if (!current) {
    return null;
  }

  const nextTitle = changes.title !== undefined ? changes.title : current.title;
  const nextDone =
    changes.done !== undefined ? changes.done : current.done;

  const { rows } = await pool.query(
    "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *",
    [nextTitle, nextDone, id]
  );

  return mapTask(rows[0]);
}

async function deleteTask(id) {
  const { rowCount } = await pool.query(
    "DELETE FROM tasks WHERE id = $1",
    [id]
  );
  return rowCount > 0;
}

await initializeDatabase();
export { getAllTasks, getTaskById, createTask, updateTask, deleteTask };