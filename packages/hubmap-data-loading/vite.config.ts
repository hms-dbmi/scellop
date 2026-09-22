import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, "src/index.ts"),
      name: "scellopHubmapDataLoading",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"],
    },
    rolldownOptions: {
      external: ["@scellop/data-loading", "@vitessce/zarr"],
      output: {
        globals: {
          "@scellop/data-loading": "ScellopDataLoading",
          "@vitessce/zarr": "VitessceZarr",
        },
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
      exclude: ["src/test/**", "src/benchmarks/**"],
    }),
  ],
});
