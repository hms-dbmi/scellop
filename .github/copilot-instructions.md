# Scellop Developer Instructions

## Project Overview

**Scellop** (formerly CellPop) is a React-based interactive visualization library for exploring cell type compositions from single-cell RNA-seq data. It provides flexible heatmaps with side views (bar charts, violin plots) and supports both NPM/PyPI distribution. Built with TypeScript, React 18+, Vite, and visx.

**Architecture**: Monorepo using pnpm workspaces with three main packages:
- `@scellop/data-loading`: Core data types and loading utilities (zero dependencies)
- `@scellop/hubmap-data-loading`: HuBMAP-specific data loading (depends on @vitessce/zarr)
- `@scellop/scellop`: Main visualization library

## Architecture & Key Patterns

### Context-Driven State Management

State is managed via **Zustand stores wrapped in React Context** (see [packages/scellop/src/utils/zustand.tsx](packages/scellop/src/utils/zustand.tsx)). The entire app wraps in 15+ nested context providers via [packages/scellop/src/contexts/Providers.tsx](packages/scellop/src/contexts/Providers.tsx). This enables:

- Type-safe state access with custom hooks like `useData()`, `useScale()`, `useColorScale()`
- **Temporal state** (undo/redo) via `zundo` for `DataContext`
- **Memoized selectors** via `proxy-memoize` for performance

**Pattern**: To add new state:

```tsx
// 1. Create store with zustand helper
const [Provider, useMyStore] = createStoreContext(
  (initialProps) => createStore<MyState>(() => ({ ...initialProps })),
  "MyContext"
);

// 2. Add to Providers.tsx nesting
// 3. Use via hook: const value = useMyStore((s) => s.value)
```

### Data Schema

Core type is `ScellopData` (see [packages/data-loading/src/scellop-schema.ts](packages/data-loading/src/scellop-schema.ts)):

- `rowNames`/`colNames`: Dataset IDs and cell type identifiers
- `countsMatrix`: Array of `[rowKey, colKey, count]` tuples
- `metadata`: Nested object for rows/cols with arbitrary key-value pairs

**Critical**: The `DataContext` ([packages/scellop/src/contexts/DataContext.tsx](packages/scellop/src/contexts/DataContext.tsx)) manages:

- Filtering (hiding rows/cols based on metadata)
- Sorting (by count, alphabetically, or metadata fields)
- Removal (transient hide without data mutation)
- Transposition (swap X/Y axes)

### Dual Export Pipeline

The export system ([packages/scellop/src/export/](packages/scellop/src/export/)) provides **high-quality PNG and SVG exports**:

- **PNG**: Offscreen canvas rendering at 4x+ resolution (not html2canvas screenshots)
- **SVG**: React components generate `<svg>` with data-driven `<rect>` elements

Both use shared utilities in [packages/scellop/src/export/rendering-utils.ts](packages/scellop/src/export/rendering-utils.ts) for calculating cell positions/colors from the same data as the interactive view. See [packages/scellop/src/export/README.md](packages/scellop/src/export/README.md) for details.

**Pattern**: When adding visualizations, create:

1. `calculateMyGraph()` in `rendering-utils.ts`
2. `renderMyGraphToCanvas()` for PNG
3. `SvgMyGraph.tsx` component for SVG
4. Update `canvas-export.ts` and `svg-export.tsx`

### Responsive Sizing with visx

The root component uses `withParentSize` HOC from `@visx/responsive` to get container dimensions. Scales are created via `@visx/scale` (e.g., `scaleBand`, `scaleLinear`) and passed through context providers.

**Note**: We use Canvas for the main heatmap rendering (performance), not `@visx/heatmap`, but visx provides axes, scales, and side graphs.

## Development Workflow

### Monorepo Structure

```
packages/
  data-loading/          # Core types, schemas, DataLoader interface
  hubmap-data-loading/   # HuBMAP-specific data loading with Zarr
  scellop/               # Main visualization library
sites/
  demo/                  # Demo site (not part of library build)
python/                  # Python widget for Jupyter notebooks
```

### Setup & Commands

```bash
pnpm install         # Install all workspace dependencies
pnpm run dev         # Build packages + start demo with watch mode
pnpm run build       # Build all packages for distribution
pnpm run test        # Run vitest unit tests across all packages
pnpm run lint        # Biome check across entire monorepo
pnpm run lint:fix    # Auto-fix with Biome
```

**Development mode**: `pnpm run dev` performs an initial build of all packages, then runs them in watch mode alongside the demo site. Changes to any package will automatically rebuild and hot-reload in the demo.

### Demo Site

The demo ([sites/demo/src/demo.tsx](sites/demo/src/demo.tsx)) loads HuBMAP data via `loadHuBMAPData()` from `@scellop/hubmap-data-loading`. Test data is available in [sites/demo/src/testData.ts](sites/demo/src/testData.ts).

### Python Widget Development

The Python package ([python/](python/)) uses **anywidget** to embed the React app in Jupyter notebooks:

```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pnpm install && pnpm run build  # Build widget
# Open example.ipynb in JupyterLab or VS Code
```

Changes in [python/js/widget.tsx](python/js/widget.tsx) require rebuilding with `pnpm run build`. The widget imports from `@scellop/scellop` and `@scellop/data-loading`.

### Build Configuration

Each package has its own Vite config:
- **packages/*/vite.config.ts**: Library builds (ES + UMD) with TypeScript declarations
- **sites/demo/vite.config.ts**: Demo site with sourcemaps for debugging

TypeScript path mappings in `tsconfig.json` files resolve workspace dependencies during development.

## Testing

Tests use **vitest** with jsdom. Each package has its own test setup.

**Key tests**:

- [packages/scellop/src/test/rendering-utils.test.ts](packages/scellop/src/test/rendering-utils.test.ts): Export calculations
- [packages/scellop/src/test/side-graph-utils.test.ts](packages/scellop/src/test/side-graph-utils.test.ts): Bar/violin rendering

**Pattern**: Test data-driven calculations, not React components. Mock Zustand stores when needed.

## Code Conventions

### Formatting & Linting

- **Biome** for linting and formatting ([biome.json](biome.json)): double quotes, semicolons, unix line endings
- Run `pnpm run lint:fix` before committing to auto-fix issues
- VS Code integration via Biome extension (recommended in `.vscode/extensions.json`)

### TypeScript Strictness

- Strict mode enabled in [tsconfig.base.json](tsconfig.base.json) (shared across all packages)
- Use explicit types for props, state, and function returns
- Avoid `any`; use `unknown` and type guards
- JSX transform: `react-jsx` (no need to import React in JSX files)

### Naming Conventions

- **Contexts**: `MyContext`, hooks are `useMyContext()`
- **Components**: PascalCase, colocate related components in directories (e.g., `visx-visualization/`)
- **Utilities**: camelCase functions, kebab-case filenames (e.g., `array-reordering.ts`)

### File Organization

- **packages/scellop/src/contexts/**: Zustand stores + providers
- **packages/scellop/src/visx-visualization/**: Canvas-based interactive visualization
- **packages/scellop/src/export/**: High-quality export system
- **packages/data-loading/src/**: Core types and utilities
- **packages/hubmap-data-loading/src/**: HuBMAP-specific loaders
- **packages/scellop/src/utils/**: Pure functions (colors, normalizations, graph types)
- **packages/scellop/src/hooks/**: Reusable React hooks

## Integration Points

### Data Loading

Two primary loaders in separate packages:

1. **HuBMAP Loader** ([packages/hubmap-data-loading/src/HuBMAPDataLoader.ts](packages/hubmap-data-loading/src/HuBMAPDataLoader.ts)): Fetches Zarr arrays from HuBMAP portal using `@vitessce/zarr`
2. **Generic Loader** ([packages/data-loading/src/dataWrangling.ts](packages/data-loading/src/dataWrangling.ts)): `loadDataWithCounts()` utility for converting counts dictionaries to `ScellopData`

**DataLoader Interface**: Create custom loaders by implementing `DataLoader<TParams>` from `@scellop/data-loading`:

```tsx
import { BaseDataLoader, type ScellopData } from '@scellop/data-loading';

interface MyLoaderParams {
  url: string;
  // ... custom params
}

class MyDataLoader extends BaseDataLoader<MyLoaderParams> {
  async load(params: MyLoaderParams): Promise<ScellopData | undefined> {
    // Implement loading logic
    return data;
  }
}
```

**Pattern**: Users pass `ScellopData` to `<Scellop data={...} />`:

```tsx
import { Scellop } from '@scellop/scellop';
import { loadHuBMAPData } from '@scellop/hubmap-data-loading';

const data = await loadHuBMAPData(['uuid1', 'uuid2']);
<Scellop data={data} />
```

### External Dependencies

- **@visx**: Scales, axes, shapes for D3-like visualizations
- **@mui/material**: UI components (buttons, icons, switches)
- **@dnd-kit**: Drag-and-drop for reordering axes
- **@vitessce/zarr**: Zarr array loading (isolated to `@scellop/hubmap-data-loading`)
- **d3**: Used sparingly (e.g., color scales, violin KDE)
- **zustand**: Global state management

## Common Gotchas

1. **Context Nesting Order**: Providers must be nested in specific order (see [packages/scellop/src/contexts/Providers.tsx](packages/scellop/src/contexts/Providers.tsx)). If a context depends on another, it must be nested inside.

2. **Canvas vs SVG**: The main heatmap uses Canvas for performance. Export generates both Canvas (PNG) and SVG (vector) versions. Don't confuse the two rendering paths.

3. **Reactive Providers**: Some contexts have `reactive` prop to reset state when props change. Use cautiously (causes re-renders).

4. **Memoization**: Use `useMemo` for expensive calculations (e.g., scales, data maps). Use `proxy-memoize` for derived state in Zustand selectors.

5. **Browser Canvas Limits**: PNG export checks browser-specific canvas size limits (65535px in Chrome, 32767px in Firefox). See [packages/scellop/src/export/README.md](packages/scellop/src/export/README.md).

6. **Workspace Dependencies**: TypeScript path mappings in `tsconfig.json` resolve `@scellop/*` imports to source files during development. Changes to `@scellop/data-loading` or `@scellop/hubmap-data-loading` require rebuilding (automatic in watch mode).

## Useful Files as References

- **Example Usage**: [sites/demo/src/demo.tsx](sites/demo/src/demo.tsx) - Shows full API with HuBMAP data
- **Component API**: [packages/scellop/src/ScellopComponent.tsx](packages/scellop/src/ScellopComponent.tsx) - Main entry point
- **State Patterns**: [packages/scellop/src/contexts/DataContext.tsx](packages/scellop/src/contexts/DataContext.tsx) - Complex Zustand with temporal state
- **Custom Hooks**: [packages/scellop/src/utils/zustand.tsx](packages/scellop/src/utils/zustand.tsx) - Context + Zustand factory functions
- **Rendering Logic**: [packages/scellop/src/export/rendering-utils.ts](packages/scellop/src/export/rendering-utils.ts) - Data-to-pixels calculations
- **Data Loading Interface**: [packages/data-loading/src/DataLoader.ts](packages/data-loading/src/DataLoader.ts) - Generic DataLoader with typed generics
- **HuBMAP Implementation**: [packages/hubmap-data-loading/src/HuBMAPDataLoader.ts](packages/hubmap-data-loading/src/HuBMAPDataLoader.ts) - Example DataLoader implementation
