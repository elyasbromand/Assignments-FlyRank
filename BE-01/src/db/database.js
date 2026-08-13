import { configDotenv } from "dotenv";
import { Pool } from "pg";
configDotenv();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

pool.on("connect", () => {
  console.log("Database connected");
});

export default pool;