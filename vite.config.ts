import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, UserConfigFnObject } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === "demo") {
    return {
      build: {
        rollupOptions: {
          input: {
            "index.html": "index.html",
            "demo/index.tsx": "demo/index.tsx",
            "index.ts": "src/index.ts",
            "favicon.ico": "favicon.ico",
          },
        },
      },
      base: "/",
      plugins: [react()],
    };
  }
  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "scellop",
        fileName: (format) => `index.${format}.js`,
      },
      formats: ["es", "cjs"],
      rollupOptions: {
        external: ["react", "react-dom"],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      },
    },
    sourcemap: true,
    plugins: [
      react(),
      dts({
        insertTypesEntry: true,
      }),
    ],
    base: "/scellop/",
  };
}) satisfies UserConfigFnObject;
