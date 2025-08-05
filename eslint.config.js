// @ts-check

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{jsx,tsx}"],
    ...reactPlugin.configs.flat.recommended,
  },
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    rules: {
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      "no-trailing-spaces": "error",
      "comma-dangle": ["error", "always-multiline"],
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      ".venv",
      // to prevent eslint from crashing every time this file is changed
      "./demo/testData.ts",
    ],
  },
);
