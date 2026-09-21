---
"scellop": minor
---

Upgrade Material UI from v6 to v9.

**Breaking changes for consumers:**

- `@mui/material`, `@mui/icons-material`, `@emotion/react` and `@emotion/styled` are now **peer dependencies** and are no longer bundled. Install them alongside `scellop`. This removes the duplicate MUI runtime and Emotion cache that apps already using Material UI were shipping, and cuts the ESM bundle from 1,483 kB to 620 kB.
- The **UMD build is replaced by CJS**. `main` and `exports["."].require` now point at `./dist/index.cjs.js`. There are no UMD globals for MUI or Emotion, so the externalized bundle cannot be expressed as UMD.
- `customTheme` now **deep merges** with the built-in theme instead of shallow-spreading over it, and accepts `Theme | ThemeOptions`. Previously, overriding a single palette value discarded the rest of the palette, including `palette.mode`.
- Material UI v9 raises the supported browser floor to **Chrome 117+, Firefox 121+, Safari 17+**.

**Fixes that came out of the upgrade:**

- The Row and Column tabs in the settings modal now receive the `selected` prop, so they are reachable by keyboard under v9's roving tabindex and get their selected styling.
- Removed four redundant `component={IconButton}` props that, under v9, made `ButtonBase` render a non-native button (no native `disabled`, no `type="button"`, an error logged on every mount).
