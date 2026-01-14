# Scellop Developer Instructions

## Project Overview

**Scellop** is a React visualization library for interactive exploration of cell type compositions from single-cell RNA-seq data. Provides flexible heatmaps with side views (bar/violin charts) distributed via NPM and PyPI.

**Stack**: TypeScript, React 18, Vite, visx, Zustand, MUI, Canvas rendering

**Monorepo** (pnpm workspaces):

- `@scellop/data-loading` - Core types/schema (zero dependencies)
- `@scellop/hubmap-data-loading` - HuBMAP Zarr data loading
- `@scellop/scellop` - Main visualization library
- `sites/demo` - Demo site (not published)
- `python/` - Jupyter widget via anywidget

## Architecture Essentials

### State: Zustand + Context Pattern

State uses **Zustand stores wrapped in React Context** ([packages/scellop/src/utils/zustand.tsx](packages/scellop/src/utils/zustand.tsx)). All 15+ providers nest in [packages/scellop/src/contexts/Providers.tsx](packages/scellop/src/contexts/Providers.tsx).

**Critical features**:

- `DataContext` has **temporal state** (undo/redo via `zundo`)
- Selectors use `proxy-memoize` for performance
- Provider nesting order matters (dependencies must nest inside)

**Adding state**:

```tsx
const [Provider, useMyStore] = createStoreContext(
  (props) => createStore<State>(() => ({ ...props })),
  "MyContext"
);
// Add to Providers.tsx, use: useMyStore((s) => s.value)
```

### Data Model: ScellopData

Schema in [packages/data-loading/src/scellop-schema.ts](packages/data-loading/src/scellop-schema.ts):

```tsx
type ScellopData = {
  rowNames: string[];           // Dataset IDs
  colNames: string[];           // Cell types
  countsMatrix: [string, string, number][]; // [row, col, count]
  metadata: { rows: {...}, cols: {...} };
}
```

**DataContext** ([packages/scellop/src/contexts/DataContext.tsx](packages/scellop/src/contexts/DataContext.tsx)) handles filtering, sorting, removal, transposition - all without mutating source data.

### Dual Export System

**PNG**: Offscreen Canvas at 4x+ resolution (NOT html2canvas)  
**SVG**: React components render `<svg>` with data-driven elements

Both share logic in [packages/scellop/src/export/rendering-utils.ts](packages/scellop/src/export/rendering-utils.ts). When adding visualizations:

1. Add `calculateMyGraph()` to `rendering-utils.ts`
2. Add `renderMyGraphToCanvas()` for PNG
3. Create `SvgMyGraph.tsx` for SVG
4. Update `canvas-export.ts` and `svg-export.tsx`

**Gotcha**: Browser canvas size limits (65535px Chrome, 32767px Firefox)

### Rendering: Canvas + visx

Interactive heatmap uses **Canvas** (not `@visx/heatmap`) for performance. `@visx` provides scales, axes, side graphs. Root uses `withParentSize` HOC for responsive sizing.

## Development Workflow

**Setup**:

```bash
pnpm install      # Install all deps
pnpm run dev      # Build packages in watch + demo
pnpm run build    # Production builds
pnpm run test     # Vitest across all packages
pnpm run lint:fix # Biome auto-fix
pnpm run bench    # Performance benchmarks
```

**Dev mode**: Builds all packages once, then watches + hot-reloads demo at [sites/demo/src/demo.tsx](sites/demo/src/demo.tsx)

**Python widget**:

```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pnpm install && pnpm run build
# Open example.ipynb
```

Changes in [python/js/widget.tsx](python/js/widget.tsx) need `pnpm run build`

**Path mappings**: TypeScript resolves `@scellop/*` imports to source via `tsconfig.json` paths. Vite/vitest configs alias these for bundling/testing.

## Code Conventions

**Biome** ([biome.json](biome.json)): double quotes, semicolons, 2-space indent, unix LF. Run `pnpm run lint:fix` before commits.

**TypeScript**: Strict mode ([tsconfig.base.json](tsconfig.base.json)), explicit types, avoid `any`, JSX transform `react-jsx` (no React imports needed).

**Naming**:

- Contexts: `MyContext` with `useMyContext()` hook
- Files: PascalCase components, kebab-case utils (`array-reordering.ts`)

**Testing**: Vitest + jsdom. Test data calculations, not React components. See [packages/scellop/src/test/rendering-utils.test.ts](packages/scellop/src/test/rendering-utils.test.ts).

## Data Loading Pattern

Implement `DataLoader<TParams>` from `@scellop/data-loading`:

```tsx
import { BaseDataLoader, ScellopData } from "@scellop/data-loading";

class MyLoader extends BaseDataLoader<{ url: string }> {
  async load({ url }): Promise<ScellopData | undefined> {
    // Fetch and transform to ScellopData schema
  }
}
```

See [packages/hubmap-data-loading/src/HuBMAPDataLoader.ts](packages/hubmap-data-loading/src/HuBMAPDataLoader.ts) for reference implementation with Zarr.

## Key Files

- [packages/scellop/src/ScellopComponent.tsx](packages/scellop/src/ScellopComponent.tsx) - Main entry point
- [packages/scellop/src/contexts/Providers.tsx](packages/scellop/src/contexts/Providers.tsx) - Provider nesting (ORDER MATTERS)
- [packages/scellop/src/utils/zustand.tsx](packages/scellop/src/utils/zustand.tsx) - Context+Zustand factory
- [packages/scellop/src/export/rendering-utils.ts](packages/scellop/src/export/rendering-utils.ts) - Export calculations
- [sites/demo/src/demo.tsx](sites/demo/src/demo.tsx) - Full API usage example
- [packages/scellop/src/benchmarks/README.md](packages/scellop/src/benchmarks/README.md) - Performance testing guide

## Common Gotchas

1. **Provider order**: Dependencies must nest inside dependents in `Providers.tsx`
2. **Canvas vs SVG**: Separate render paths for interactive (Canvas) vs export (both)
3. **Reactive providers**: Have `reactive` prop that resets state on prop changes (expensive)
4. **Memoization**: Use `proxy-memoize` in Zustand selectors, `useMemo` for scales/maps
5. **Workspace deps**: Changes to `@scellop/data-loading` auto-rebuild in watch mode
