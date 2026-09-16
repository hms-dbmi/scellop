import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@scellop/data-loading": path.resolve(__dirname, "../data-loading/src"),
      "@demo": path.resolve(__dirname, "../../sites/demo/src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts", "./src/benchmarks/setup-benchmarks.ts"],
    benchmark: {
      include: ["src/benchmarks/**/*.bench.ts"],
    },
  },
});
