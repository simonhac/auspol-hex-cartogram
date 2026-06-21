import { defineConfig } from "vitest/config";

// Dedicated Vitest config so the library tests aren't affected by the gallery's
// vite.config.ts (which sets `root: "site"`). Vitest prefers this file over
// vite.config.ts.
export default defineConfig({
  test: {
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
  },
});
