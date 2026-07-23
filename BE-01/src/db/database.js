import Database from "better-sqlite3";

const db = new Database("tasks.db", { verbose: console.log("Database connected")});

db.pragma("journal_mode = WAL");

export default db;