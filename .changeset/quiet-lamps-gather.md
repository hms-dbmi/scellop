---
"@scellop/hubmap-data-loading": minor
---

Upgrade `@vitessce/zarr` from 3 to 4.

It is a declared runtime dependency and is externalized from the bundle, so consumers resolve it themselves and will pick up the new major. No source change was needed in this package, and its own API is unchanged.

Also rebuilt with Vite 8 and TypeScript 7, so the emitted bundle and declarations differ from the previous release.
