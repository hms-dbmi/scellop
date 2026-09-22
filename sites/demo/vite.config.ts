import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In dev, resolve the workspace packages to their sources so HMR reaches them.
// Production builds deliberately go through the published `dist` output, which
// makes the Netlify deploy preview a real packaging smoke test.
const sourceAliases = {
  scellop: path.resolve(import.meta.dirname, "../../packages/scellop/src"),
  "@scellop/data-loading": path.resolve(
    import.meta.dirname,
    "../../packages/data-loading/src",
  ),
  "@scellop/hubmap-data-loading": path.resolve(
    import.meta.dirname,
    "../../packages/hubmap-data-loading/src",
  ),
};

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: command === "serve" ? sourceAliases : {},
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
}));
