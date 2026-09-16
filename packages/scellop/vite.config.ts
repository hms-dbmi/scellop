import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "scellop",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-dom/client",
        "react-dom/server",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "zustand",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOM",
          "react-dom/server": "ReactDOMServer",
          "react/jsx-runtime": "ReactJSXRuntime",
          "react/jsx-dev-runtime": "ReactJSXDevRuntime",
          zustand: "zustand",
        },
      },
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
