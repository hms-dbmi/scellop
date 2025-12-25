import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "scellopHubmapDataLoading",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
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
    }),
  ],
});
