import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ScellopDataLoading",
      fileName: (format) => `index.${format}.js`,
    },
    formats: ["es", "cjs"],
  },
  sourcemap: true,
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
