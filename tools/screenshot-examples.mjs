// Capture one framed PNG per gallery widget for the README. Each gallery page
// wraps its widget in a `.demo-surface` card (background, border, padding), so
// shooting that element gives every screenshot a consistent look.
//
// Run the gallery dev server first, then this script from the repo root:
//   npm run dev                       # Vite at http://localhost:5173
//   node tools/screenshot-examples.mjs
//
// Override the base URL (e.g. to shoot a production build) with GALLERY_URL.
import { chromium } from "playwright-chromium";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "images");
const BASE = process.env.GALLERY_URL ?? "http://localhost:5173/auspoligraphs";

// One entry per gallery route. `ready` is a selector that must be present before
// we shoot — for SVG widgets we wait for actual drawn content so animated charts
// have something on screen.
const SHOTS = [
  { route: "/cartogram", file: "cartogram.png", ready: ".demo-surface svg polygon" },
  { route: "/parliament", file: "parliament.png", ready: ".parliament-panel svg circle" },
  { route: "/charts/votes", file: "votes-chart.png", ready: ".demo-surface" },
  { route: "/charts/seats", file: "seats-chart.png", ready: ".demo-surface" },
  { route: "/charts/composition", file: "composition-bar.png", ready: ".scs-card" },
  { route: "/controls/swings", file: "swing-panels.png", ready: ".demo-surface" },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1100, height: 1200 },
  deviceScaleFactor: 2,
});

for (const { route, file, ready } of SHOTS) {
  // Vite keeps an HMR websocket open, so `networkidle` never settles — wait on
  // the DOM and the target selector instead.
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(ready);
  await page.evaluate(() => document.fonts.ready);
  // Let arc/bar entry transitions settle before capturing.
  await page.waitForTimeout(800);

  const el = await page.$(".demo-surface");
  if (!el) throw new Error(`no .demo-surface on ${route}`);
  await el.screenshot({ path: join(OUT, file) });
  console.log("wrote", file);
}

await browser.close();
