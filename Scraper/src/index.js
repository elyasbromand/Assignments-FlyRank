// src/index.js
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import * as cheerio from "cheerio";
import { z } from "zod";

const USER_AGENT =
  "FlyRankInternshipA9/1.0 (+https://github.com/elyasbromand/Assignments-FlyRank)";
const TIMEOUT_MS = 8000;
const MIN_DELAY_MS = 500;

const stats = { pagesFetched: 0, cacheHits: 0 };

const BookSchema = z.object({
  title: z.string().min(1),
  product_url: z.url(),
  price_text: z.string(),
  price_gbp: z.number().positive(),
  availability_text: z.string(),
  rating_text: z.string(),
  description: z.string().nullable(),
  source_page: z.url(),
  fetched_at: z.string(),
});

function parsePriceGBP(priceText) {
  const cleaned = priceText.replace(/[^\d.]/g, "");
  const price = Number(cleaned);
  return isFinite(price) ? price : null;
}

function normalizeAndValidate(rawRecord) {
  const price_gbp = parsePriceGBP(rawRecord.price_text);

  const candidate = { ...rawRecord, price_gbp };

  const result = BookSchema.safeParse(candidate);

  if (result.success) {
    return { ok: true, record: result.data };
  } else {
    return {
      ok: false,
      record: rawRecord,
      reason: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }
}

async function sleep(ms = MIN_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithCache(url, cachePath, attempt = 1) {
  if (existsSync(cachePath)) {
    const html = await readFile(cachePath, "utf-8");
    stats.cacheHits++;
    console.log(`CACHE HIT ${url} (size=${html.length} bytes)`);
    return html;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    // Timeout or network failure — retry once if we haven't already
    if (attempt < 2) {
      await sleep(MIN_DELAY_MS);
      return fetchWithCache(url, cachePath, attempt + 1);
    }
    throw new Error(`Network error after ${attempt} attempt(s): ${err.message}`);
  }

  clearTimeout(timeoutId);

  // 403 / 404 — never retry, throw immediately
  if (response.status === 404) {
    throw new Error(`Not found (404): ${url}`);
  }
  if (response.status === 403) {
    throw new Error(`Forbidden (403): ${url}`);
  }

  // 5xx on first attempt — retry once
  if (response.status >= 500 && attempt === 1) {
    await sleep(MIN_DELAY_MS);
    return fetchWithCache(url, cachePath, attempt + 1);
  }

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${url}: status ${response.status}`);
  }

  stats.pagesFetched++;

  const html = await response.text();

  await sleep(MIN_DELAY_MS);

  const dir = path.dirname(cachePath);
  await mkdir(dir, { recursive: true });
  await writeFile(cachePath, html);

  console.log(`FETCH ${url} (status=200, size=${html.length} bytes)`);

  return html;
}

async function getCatalogueBookUrls(pageUrl, pageNum) {
  const cachePath = `cache/catalogue-page-${pageNum}.html`;
  const html = await fetchWithCache(pageUrl, cachePath);
  const $ = cheerio.load(html);

  const bookUrls = $("article.product_pod h3 a")
    .map((_, el) => new URL($(el).attr("href"), pageUrl).toString())
    .get();

  const nextRel = $("li.next a").attr("href");
  const nextUrl = nextRel ? new URL(nextRel, pageUrl).toString() : null;

  return { bookUrls, nextUrl };
}

async function discoverAllCatalogueUrls() {
  const startUrl = "https://books.toscrape.com/catalogue/page-1.html";
  let currentUrl = startUrl;
  let pageNum = 1;
  const allEntries = [];

  while (currentUrl && pageNum <= 3) {
    const { bookUrls, nextUrl } = await getCatalogueBookUrls(
      currentUrl,
      pageNum,
    );
    for (const bookUrl of bookUrls) {
      allEntries.push({ url: bookUrl, sourcePage: currentUrl });
    }
    currentUrl = nextUrl;
    pageNum++;
  }

  const seen = new Set();
  const uniqueEntries = [];
  for (const entry of allEntries) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      uniqueEntries.push(entry);
    }
  }

  console.log(
    `catalogue_pages=${pageNum - 1} discovered=${uniqueEntries.length} unique_urls=${uniqueEntries.length}`,
  );
  return uniqueEntries;
}

async function extractBookRecord(bookUrl, sourcePage, indexInList) {
  const cachePath = `cache/book-${indexInList}.html`; // or derive a cleaner filename from the URL
  const html = await fetchWithCache(bookUrl, cachePath);
  const $ = cheerio.load(html);

  const title = $("div.product_main h1").first().text().trim();

  const price_text = $("div.product_main p.price_color").first().text().trim();

  const availability_text = $("div.product_main p.instock.availability")
    .first()
    .text()
    .trim()
    .replace(/\s+/g, " ");

  const rating_text = $("div.product_main p.star-rating")
    .first()
    .attr("class")
    .split(/\s+/)[1];

  const descriptionElement = $("#product_description + p").first();
  const description = descriptionElement.length ? descriptionElement.text().trim() : null;

  return {
    title,
    product_url: bookUrl,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  };
}

async function main() {
  const startTime = new Date();

  const entries = await discoverAllCatalogueUrls();

  const rawRecords = [];
  const failedPages = [];


  for (let i = 0; i < entries.length; i++) {
    try {
      const record = await extractBookRecord(entries[i].url, entries[i].sourcePage, i);
      rawRecords.push(record);
    } catch (err) {
      failedPages.push({ url: entries[i].url, reason: err.message });
      console.log(`SKIP ${entries[i].url}: ${err.message}`);
    }
  }

  console.log(`Extracted ${rawRecords.length} book records (${failedPages.length} failed)`);
  // Normalize and validate
  const good = [];
  const bad = [];
  for (const record of rawRecords) {
    const { ok, record: normalized, reason } = normalizeAndValidate(record);
    if (ok) {
      good.push(normalized);
    } else {
      bad.push({ ...record, reason });
    }
  }

  // Dedup by product_url (later record overwrites)
  const seen = new Map();
  for (const record of good) {
    seen.set(record.product_url, record);
  }
  const deduped = [...seen.values()];

  await mkdir("output", { recursive: true });
  await writeFile("output/books.json", JSON.stringify(deduped, null, 2));
  await writeFile("output/errors.json", JSON.stringify(bad, null, 2));

  const endTime = new Date();
  const runReport = {
    start_time: startTime.toISOString(),
    duration_ms: endTime - startTime,
    pages_fetched: stats.pagesFetched,
    cache_hits: stats.cacheHits,
    valid_records: deduped.length,
    invalid_records: bad.length,
    failed_pages: failedPages.length,
  };
  await writeFile("output/run-report.json", JSON.stringify(runReport, null, 2));

  console.log(`Valid: ${deduped.length}, Errors: ${bad.length}, Failed pages: ${failedPages.length}`);
  console.log("Run report written to output/run-report.json");
}

main();
