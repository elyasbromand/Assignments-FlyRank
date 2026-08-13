import { Pool } from "pg";
import { configDotenv } from "dotenv";

configDotenv();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

let initializationStarted = false;

pool.on("connect", async () => {
  if (initializationStarted) return;
  initializationStarted = true;

  try {
    console.log("Database connected");
    const { initializeDatabase } = await import("../repositories/tasks.repository.js");
    await initializeDatabase();
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
});

export default pool;