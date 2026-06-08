import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    // Unit/component tests live under src/. The Playwright E2E suite in
    // tests/e2e is run separately via `pnpm test:e2e`.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
