# @scellop/data-loading

## 0.2.1

### Patch Changes

- 4dfce13: Toolchain-only release. The package is built with Vite 8 and TypeScript 7 now, so the emitted bundle and declarations differ from the previous release, but there is no source or API change.

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
