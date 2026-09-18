# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Deeper detail (state patterns, export pipeline, data-loader API) lives in [.github/copilot-instructions.md](.github/copilot-instructions.md).

## Commands

pnpm workspace monorepo. Root scripts fan out to `packages/*` only (the demo is dev-only).

```sh
pnpm install
pnpm dev          # build packages in watch mode + hot-reload the demo
pnpm build        # topological library builds (needed before typecheck)
pnpm test:run     # vitest once (pnpm test = watch)
pnpm typecheck    # tsc --noEmit per package
pnpm lint:fix     # Biome
pnpm bench        # benchmarks + report (packages/scellop only)
```

Single package / single test:

```sh
pnpm --filter scellop test:run src/test/rendering-utils.test.ts
pnpm --filter scellop test:run -t "name of the test"
pnpm --filter @scellop/hubmap-data-loading build
```

CI (`.github/workflows/ci.yml`) runs `lint` → `build` → `typecheck` → `test:run` in that order. `build` is not optional before `typecheck`: cross-package imports resolve through `node_modules` to built `dist/*.d.ts`. Vitest configs and the demo's *dev* server alias workspace packages to `src`; the demo's production build deliberately does not.

Python widget: see [python/CONTRIBUTING.md](python/CONTRIBUTING.md). Needs three processes — `pnpm --filter scellop dev` at the root, `pnpm run dev` in `python/`, and the notebook.

## Packages

| Path | Package | Notes |
| --- | --- | --- |
| `packages/data-loading` | `@scellop/data-loading` | schema + `DataLoader` base, zero runtime deps |
| `packages/hubmap-data-loading` | `@scellop/hubmap-data-loading` | HuBMAP/Zarr loader, reference `DataLoader` implementation |
| `packages/scellop` | `scellop` | the React library; react/react-dom/zustand are peer deps and externalized in the bundle |
| `sites/demo` | `@scellop/demo` | full API usage example, deployed to Netlify |
| `python` | `scellop` (PyPI) | anywidget wrapper around `python/js/widget.tsx` |

## Architecture

**State.** ~20 Zustand stores, each wrapped in its own React context via `createStoreContext` in [packages/scellop/src/utils/zustand.tsx](packages/scellop/src/utils/zustand.tsx), all nested in [packages/scellop/src/contexts/Providers.tsx](packages/scellop/src/contexts/Providers.tsx). **Nesting order is load-bearing** — a provider must sit inside the ones it reads. `DataContext` additionally carries temporal state (undo/redo via `zundo`) and does all filtering/sorting/removal/transposition without mutating the source data. Selectors use `proxy-memoize`.

**Rendering.** The interactive heatmap draws to Canvas (not `@visx/heatmap`) for scale; `@visx` supplies scales, axes and side graphs; the root uses `withParentSize` for responsive sizing.

**Export is a second render path.** PNG goes through an offscreen Canvas at 4x, SVG through React components, both sharing the calculations in [packages/scellop/src/export/rendering-utils.ts](packages/scellop/src/export/rendering-utils.ts). A new visualization therefore needs three pieces: a `calculate*` helper, a `render*ToCanvas`, and an `Svg*.tsx`, wired into `canvas-export.ts` and `svg-export.tsx`. Watch browser canvas limits (65535px Chrome, 32767px Firefox).

## Conventions

- Biome: double quotes, semicolons, 2-space indent, LF.
- Strict TS, `react-jsx` transform (no React import needed).
- PascalCase component files, kebab-case utility files.
- Tests target data/calculation code, not React components.
- Any PR touching a published package needs a changeset (`pnpm changeset`); release is automated from `main`.
