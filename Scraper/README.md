## Target classification
- **Site:** https://books.toscrape.com/
- **Why this site is appropriate to scrape:** This website was designed to be scraped and it gives literal approval for it.
- **Scope:** First 3 catalogue pages (60 books)
- **robots.txt result:** Not found (approval implied by site design)
- **Data collected:** title, product_url, price_text, price_gbp, availability_text, rating_text, description, source_page, fetched_at
- **Ethics statement:** I will not reuse this code on another site without checking its rules and terms first.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/elyasbromand/Assignments-FlyRank.git
cd Assignments-FlyRank/Scraper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the scraper

```bash
node src/index.js
```

By default the scraper iterates over the three configured catalogue pages, extracts book records, normalizes prices, validates against a Zod schema, deduplicates by product URL, and writes results to `output/books.json`, `output/errors.json`, and `output/run-report.json`.

---

## Lane
**Node** — standalone script, no browser, no build step required.

---

## Record schema (validated by Zod)

```js
{
  title: string,
  product_url: string (URL),
  price_text: string (e.g. "£51.77"),
  price_gbp: number (positive, e.g. 51.77),
  availability_text: string (e.g. "In stock (22 available)"),
  rating_text: string (e.g. "Three"),
  description: string | null,
  source_page: string (URL, e.g. "https://books.toscrape.com/catalogue/page-1.html"),
  fetched_at: string (ISO timestamp),
}
```

---

## Politeness rules

- **User-Agent:** `FlyRankInternshipA9/1.0 (+https://github.com/elyasbromand/Assignments-FlyRank)`
- **Minimum delay:** 500ms between fetches (`MIN_DELAY_MS`)
- **Timeout:** 8 seconds per fetch (`TIMEOUT_MS`), with AbortController cancellation
- **Caching:** Persistent `cache/` directory — repeated runs serve from cache (`cache_hits` counted in run report)
- **Retry policy:** Timeout or 5xx → retry once after a brief delay; 403/404 → never retry

---

## One honest limitation

Everything runs fully sequential, one request at a time — polite, but slow; there's no concurrency cap.

---

## Why this assignment needed no browser

The data is already in the HTML the server sends — a browser would only add cost without adding any new information.

---

## Ethics note

Collect only what website gives you permission to, and don't hammer the website with massive load of requests.

---

### Proof — one real run-report.json

```json
{
  "start_time": "2026-08-12T21:42:31.187Z",
  "duration_ms": 1328,
  "pages_fetched": 0,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0
}
```