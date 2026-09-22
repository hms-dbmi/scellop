# scellop

## 0.3.0

### Minor Changes

- 4dfce13: Upgrade Material UI from v6 to v9.

  **Breaking changes for consumers:**

  - `@mui/material`, `@mui/icons-material`, `@emotion/react` and `@emotion/styled` are now **peer dependencies** and are no longer bundled. Install them alongside `scellop`. This removes the duplicate MUI runtime and Emotion cache that apps already using Material UI were shipping, and cuts the ESM bundle from 1,483 kB to 620 kB.
  - The **UMD build is replaced by CJS**. `main` and `exports["."].require` now point at `./dist/index.cjs.js`. There are no UMD globals for MUI or Emotion, so the externalized bundle cannot be expressed as UMD.
  - `customTheme` now **deep merges** with the built-in theme instead of shallow-spreading over it, and accepts `Theme | ThemeOptions`. Previously, overriding a single palette value discarded the rest of the palette, including `palette.mode`.
  - Material UI v9 raises the supported browser floor to **Chrome 117+, Firefox 121+, Safari 17+**.

  **Fixes that came out of the upgrade:**

  - The Row and Column tabs in the settings modal now receive the `selected` prop, so they are reachable by keyboard under v9's roving tabindex and get their selected styling.
  - Removed four redundant `component={IconButton}` props that, under v9, made `ButtonBase` render a non-native button (no native `disabled`, no `type="button"`, an error logged on every mount).

### Patch Changes

- 4dfce13: Refresh runtime dependencies: visx 3 to 4 and @radix-ui/react-context-menu 2.2 to 2.3.

  visx 4 drops prop-types and lodash, requires React 18 or 19, and moves d3-shape and d3-path to 3. Neither upgrade changes this package's API.

- 4dfce13: Replace `useStoreWithEqualityFn` from `zustand/traditional` with `useStore` plus `useShallow`. The behaviour is unchanged — selector results were already compared with zustand's `shallow`, and no caller ever passed a custom equality function — but it drops `use-sync-external-store`, a React 17 compatibility shim, from the dependency graph. The unused `equalityFn` parameter is gone from `CurriedUseStore`.
- Updated dependencies [4dfce13]
  - @scellop/data-loading@0.2.1

## 0.2.0

### Minor Changes

- 84cf318: Split the library into a pnpm workspace monorepo.

  `scellop` keeps the visualization component and its npm name. Data loading now
  lives in two new packages: `@scellop/data-loading` (schema, wrangling helpers and
  the `DataLoader` interface, zero runtime dependencies) and
  `@scellop/hubmap-data-loading` (HuBMAP Zarr loader, previously bundled into
  `scellop`).

  Breaking: `loadHuBMAPData` and `ScellopHuBMAPLoader` are no longer exported from
  `scellop`. Install `@scellop/hubmap-data-loading` and import `loadHuBMAPData`
  from there. `loadDataWithCounts` moved to `@scellop/data-loading`.

### Patch Changes

- Updated dependencies [84cf318]
  - @scellop/data-loading@0.2.0
