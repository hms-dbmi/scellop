# @scellop/hubmap-data-loading

## 0.3.0

### Minor Changes

- 4dfce13: Upgrade `@vitessce/zarr` from 3 to 4.

  It is a declared runtime dependency and is externalized from the bundle, so consumers resolve it themselves and will pick up the new major. No source change was needed in this package, and its own API is unchanged.

  Also rebuilt with Vite 8 and TypeScript 7, so the emitted bundle and declarations differ from the previous release.

### Patch Changes

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
