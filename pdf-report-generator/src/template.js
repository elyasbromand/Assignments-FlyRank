// src/template.js

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const money = (n) => `£${Number(n).toFixed(2)}`;

export function buildHtml(report) {
  const { total, avgPrice, topExpensive, byRating, allBooks, generatedAt } = report;

  const topExpensiveRows = topExpensive
    .map((b) => `<tr><td>${esc(b.title)}</td><td>${money(b.price)}</td></tr>`)
    .join("");

  const byRatingRows = byRating
    .map((r) => `<tr><td>${r.rating} stars</td><td>${r.count}</td></tr>`)
    .join("");

  const allBooksRows = allBooks
    .map(
      (b) =>
        `<tr><td>${esc(b.title)}</td><td>${money(b.price)}</td><td>${b.rating} stars</td><td><a href="${esc(b.url)}">${esc(b.url)}</a></td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@media screen { h1::after { content: " — SCREEN"; } }
@media print  { h1::after { content: " — PRINT";  } }
  @page { size: A4; margin: 18mm 14mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
         font-size: 11pt; color: #1a1a1a; }
  h1 { font-size: 20pt; margin: 0 0 4px; }
  .meta { color: #666; font-size: 9pt; margin-bottom: 20px; }
  .totals { display: flex; gap: 32px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; }
  th { background: #f2f2f2; }

  thead { display: table-header-group; }
  tr    { break-inside: avoid; }
</style>
</head>
<body>
  <h1>Book Price Report</h1>
  <div class="meta">Generated ${esc(generatedAt)}</div>

  <div class="totals">
    <div><strong>${total}</strong> books total</div>
    <div><strong>${money(avgPrice)}</strong> average price</div>
  </div>

  <h2>Top 5 Most Expensive</h2>
  <table>
    <thead><tr><th>Title</th><th>Price</th></tr></thead>
    <tbody>${topExpensiveRows}</tbody>
  </table>

  <h2>Books by Rating</h2>
  <table>
    <thead><tr><th>Rating</th><th>Count</th></tr></thead>
    <tbody>${byRatingRows}</tbody>
  </table>

  <h2>All Books</h2>
  <table>
    <thead><tr><th>Title</th><th>Price</th><th>Rating</th><th>URL</th></tr></thead>
    <tbody>${allBooksRows}</tbody>
  </table>
</body>
</html>`;
}