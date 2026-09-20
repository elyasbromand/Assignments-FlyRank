import { db } from "./db.js";

export function getReportData() {
  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM books`)
    .get();

  const { avgPrice } = db
    .prepare(`SELECT ROUND(AVG(price), 2) AS avgPrice FROM books`)
    .get();

  const topExpensive = db
    .prepare(
      `SELECT title, price
       FROM books
       ORDER BY price DESC, title ASC
       LIMIT 5`,
    )
    .all();

  const byRating = db
    .prepare(
      `WITH scale(rating) AS (VALUES (1), (2), (3), (4), (5))
       SELECT scale.rating       AS rating,
              COUNT(books.id)    AS count
       FROM scale
       LEFT JOIN books ON books.rating = scale.rating
       GROUP BY scale.rating
       ORDER BY scale.rating DESC`,
    )
    .all();

  const allBooks = db
    .prepare(
      `SELECT title, price, rating, url
       FROM books
       ORDER BY title ASC`,
    )
    .all();

  return {
    generatedAt: new Date().toISOString(),
    total,
    avgPrice,
    topExpensive,
    byRating,
    allBooks,
  };
}