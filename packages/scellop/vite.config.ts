import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, "src/index.ts"),
      name: "scellop",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rolldownOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        "zustand",
        /^@mui\//,
        /^@emotion\//,
      ],
    },
    sourcemap: true,
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
      exclude: ["src/test/**", "src/benchmarks/**"],
      include: ["src"],
    }),
  ],
});
