import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@scellop/scellop": path.resolve(__dirname, "../../packages/scellop/src"),
      "@scellop/data-loading": path.resolve(
        __dirname,
        "../../packages/data-loading/src",
      ),
      "@scellop/hubmap-data-loading": path.resolve(
        __dirname,
        "../../packages/hubmap-data-loading/src",
      ),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
