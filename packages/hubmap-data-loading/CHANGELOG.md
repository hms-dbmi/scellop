# @scellop/hubmap-data-loading

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
