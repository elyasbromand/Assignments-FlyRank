import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
export const db = new DatabaseSync(join(root,"report.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id     INTEGER PRIMARY KEY,
    title  TEXT    NOT NULL,
    price  REAL    NOT NULL,
    rating INTEGER NOT NULL,
    url    TEXT    NOT NULL
  );
`);