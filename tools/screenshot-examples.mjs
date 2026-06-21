// Render the example pages with headless Chromium and capture one PNG per
// component for the README. Run from the repo root:
//   node tools/screenshot-examples.mjs
// Requires a static server at http://localhost:8000 serving the repo root.
import { chromium } from "playwright-chromium";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "images");
const BASE = "http://localhost:8000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });

async function shoot(el, file) {
  await el.screenshot({ path: join(OUT, file) });
  console.log("wrote", file);
}

// 1. Hex cartogram (dark theme) — capture the map SVG with theme padding.
await page.goto(`${BASE}/examples/vanilla.html`);
await page.waitForSelector("#map polygon");
await page.evaluate(() => {
  const c = document.querySelector(".map-container");
  c.style.background = "#111";
  c.style.padding = "20px";
  c.style.borderRadius = "8px";
});
await shoot(await page.$(".map-container"), "cartogram.png");

// 2 & 3. Parliament arc + results table (light theme).
await page.goto(`${BASE}/examples/parliament.html`);
await page.waitForSelector("#arc circle");
await page.evaluate(() => {
  for (const sel of [".chart", "table.parliament-results-table"]) {
    const el = document.querySelector(sel);
    el.style.background = "#fff";
    el.style.padding = "16px";
  }
});
await shoot(await page.$(".chart"), "parliament-arc.png");
await shoot(await page.$("table.parliament-results-table"), "results-table.png");

await browser.close();
