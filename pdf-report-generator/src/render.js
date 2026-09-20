import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";

export async function renderPdf(html, outPath) {
  await mkdir(dirname(outPath), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({ path: outPath, format: "A4", printBackground: true });
  } catch (err) {
    console.error("Error generating PDF: ", err);
  } finally {
    await browser.close();
  }
}
