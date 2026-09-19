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
    // Vitest 5 runs benchmarks inside a test, and a group of a dozen datasets
    // takes far longer than any test timeout. Benchmark projects clamp this to a
    // 60s floor, so 0 does not disable it -- the value has to be large instead.
    testTimeout: 3_600_000,
    benchmark: {
      include: ["src/benchmarks/**/*.bench.ts"],
    },
  },
});
