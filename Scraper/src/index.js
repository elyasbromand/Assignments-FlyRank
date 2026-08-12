// src/index.js
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import * as cheerio from "cheerio";

const USER_AGENT = "FlyRankInternshipA9/1.0 (+https://github.com/elyasbromand/Assignments-FlyRank)";
const TIMEOUT_MS = 8000;
const MIN_DELAY_MS = 500;

async function sleep(ms = MIN_DELAY_MS) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithCache(url, cachePath) {
  if (existsSync(cachePath)) {
    const html = await readFile(cachePath, "utf-8");
    console.log(`CACHE HIT ${url} (size=${html.length} bytes)`);
    return html;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${url}: status ${response.status}`);
  }

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
  const allBookUrls = [];

  while (currentUrl && pageNum <= 3) {
    const { bookUrls, nextUrl } = await getCatalogueBookUrls(currentUrl, pageNum);
    allBookUrls.push(...bookUrls);
    currentUrl = nextUrl;
    pageNum++;
  }

  const uniqueBookUrls = [...new Set(allBookUrls)];

  console.log(`catalogue_pages=${pageNum - 1} discovered=${uniqueBookUrls.length} unique_urls=${uniqueBookUrls.length}`);
  return uniqueBookUrls;
}

async function main() {
  const bookUrls = await discoverAllCatalogueUrls();
}


main();