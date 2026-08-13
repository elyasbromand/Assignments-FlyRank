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



await initializeDatabase();
// export { getAllTasks, getTaskById, createTask, updateTask, deleteTask };