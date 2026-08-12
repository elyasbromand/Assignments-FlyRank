// src/index.js
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const USER_AGENT = "FlyRankInternshipA9/1.0 (+https://github.com/elyasbromand/Assignments-FlyRank)";
const TIMEOUT_MS = 8000;

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

  const dir = path.dirname(cachePath);
  await mkdir(dir, { recursive: true });
  await writeFile(cachePath, html);

  console.log(`FETCH ${url} (status=200, size=${html.length} bytes)`);

  return html;
}

async function main() {
  const url = "https://books.toscrape.com/catalogue/page-1.html";
  const html = await fetchWithCache(url, "cache/catalogue-page-1.html");
}

main();