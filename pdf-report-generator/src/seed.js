import { readFileSync } from "node:fs";
import { db } from "./db.js";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const books = JSON.parse(
  readFileSync(join(root, "..","Scraper", "output", "books.json"), "utf8"),
);

const deleteStmt = db.prepare("DELETE FROM books");

const insert = db.prepare(
  `INSERT INTO books (title, price, rating, url) VALUES (?, ?, ?, ?)`,
);

const ratingMap = {
    "One": 1,
    "Two": 2,
    "Three": 3,
    "Four": 4,
    "Five": 5,
}

db.exec("BEGIN");

deleteStmt.run();

for (const book of books) {
  const rating = ratingMap[book.rating_text];
  insert.run(book.title, book.price_gbp, rating, book.product_url);
}

db.exec("COMMIT");

const { count } = db.prepare("SELECT COUNT(*) AS count FROM books").get();

console.log(`seeded ${count} books`);
