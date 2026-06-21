import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const r = (p: string) => path.resolve(root, p);

// On GitHub Pages the site is served from /<repo>/. Derive the base path from
// GITHUB_REPOSITORY in CI so it stays correct whether the repo is still named
// `auspol-hex-cartogram` or has been renamed to `auspoligraphs`. Locally it
// defaults to /auspoligraphs/.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repo ? `/${repo}/` : "/auspoligraphs/";

export default defineConfig({
  root: r("site"),
  base,
  plugins: [react()],
  resolve: {
    // Import the library exactly as a consumer would, but against live source —
    // no pre-build needed. Order matters: more specific aliases first.
    alias: [
      { find: "auspoligraphs/react", replacement: r("src/react/index.ts") },
      { find: "auspoligraphs/charts.css", replacement: r("src/styles/charts.css") },
      { find: "auspoligraphs", replacement: r("src/index.ts") },
    ],
  },
  server: {
    // site/ is the Vite root but the library lives in ../src and ../data.
    fs: { allow: [root] },
  },
  build: {
    outDir: r("dist-site"),
    emptyOutDir: true,
  },
});
