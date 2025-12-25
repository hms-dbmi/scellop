# Scellop Developer Instructions

## Project Overview

**Scellop** (formerly CellPop) is a React-based interactive visualization library for exploring cell type compositions from single-cell RNA-seq data. It provides flexible heatmaps with side views (bar charts, violin plots) and supports both NPM/PyPI distribution. Built with TypeScript, React 18+, Vite, and visx.

## Architecture & Key Patterns

### Context-Driven State Management

State is managed via **Zustand stores wrapped in React Context** (see [src/utils/zustand.tsx](src/utils/zustand.tsx)). The entire app wraps in 15+ nested context providers via [src/contexts/Providers.tsx](src/contexts/Providers.tsx). This enables:

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

Core type is `ScellopData` (see [src/scellop-schema.ts](src/scellop-schema.ts)):

- `rowNames`/`colNames`: Dataset IDs and cell type identifiers
- `countsMatrix`: Array of `[rowKey, colKey, count]` tuples
- `metadata`: Nested object for rows/cols with arbitrary key-value pairs

**Critical**: The `DataContext` ([src/contexts/DataContext.tsx](src/contexts/DataContext.tsx)) manages:

- Filtering (hiding rows/cols based on metadata)
- Sorting (by count, alphabetically, or metadata fields)
- Removal (transient hide without data mutation)
- Transposition (swap X/Y axes)

### Dual Export Pipeline

The export system ([src/export/](src/export/)) provides **high-quality PNG and SVG exports**:

- **PNG**: Offscreen canvas rendering at 4x+ resolution (not html2canvas screenshots)
- **SVG**: React components generate `<svg>` with data-driven `<rect>` elements

Both use shared utilities in [src/export/rendering-utils.ts](src/export/rendering-utils.ts) for calculating cell positions/colors from the same data as the interactive view. See [src/export/README.md](src/export/README.md) for details.

**Pattern**: When adding visualizations, create:

1. `calculateMyGraph()` in `rendering-utils.ts`
2. `renderMyGraphToCanvas()` for PNG
3. `SvgMyGraph.tsx` component for SVG
4. Update `canvas-export.ts` and `svg-export.tsx`

### Responsive Sizing with visx

The root component uses `withParentSize` HOC from `@visx/responsive` to get container dimensions. Scales are created via `@visx/scale` (e.g., `scaleBand`, `scaleLinear`) and passed through context providers.

**Note**: We use Canvas for the main heatmap rendering (performance), not `@visx/heatmap`, but visx provides axes, scales, and side graphs.

## Development Workflow

### Setup & Commands

```bash
pnpm install         # Install dependencies (uses pnpm, not npm/yarn)
pnpm run dev         # Start demo at http://localhost:5173
pnpm run build       # Build library for distribution
pnpm run test        # Run vitest unit tests
pnpm run test:ui     # Interactive test UI
pnpm run lint        # ESLint check
pnpm run lint:fix    # Auto-fix linting issues
```

**Demo mode**: The demo ([demo/demo.tsx](demo/demo.tsx)) loads HuBMAP data via `loadHuBMAPData()` to test with real datasets. Test data is also available in [demo/testData.ts](demo/testData.ts).

### Python Widget Development

The Python package ([python/](python/)) uses **anywidget** to embed the React app in Jupyter notebooks:

```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pnpm install && pnpm run widget  # Watch mode for JS changes
pnpm run dev  # Start Python dev server
# Open example.ipynb in JupyterLab or VS Code
```

Changes in [python/js/widget.tsx](python/js/widget.tsx) reflect live in notebooks. See [python/CONTRIBUTING.md](python/CONTRIBUTING.md).

### Build Configuration

- **Library build** (default): Exports ES module and UMD via Vite, defined in [vite.config.ts](vite.config.ts)
- **Demo build**: `pnpm run build-demo` creates static site with demo
- **Modes**: Controlled via `--mode demo` flag

## Testing

Tests use **vitest** with jsdom ([vitest.config.ts](vitest.config.ts)). Setup in [src/test/setup.ts](src/test/setup.ts) adds `@testing-library/jest-dom` matchers.

**Key tests**:

- [src/test/rendering-utils.test.ts](src/test/rendering-utils.test.ts): Export calculations
- [src/test/side-graph-utils.test.ts](src/test/side-graph-utils.test.ts): Bar/violin rendering

**Pattern**: Test data-driven calculations, not React components. Mock Zustand stores when needed.

## Code Conventions

### Formatting & Linting

- **ESLint** with TypeScript rules ([eslint.config.js](eslint.config.js)): double quotes, semicolons, no trailing spaces
- **Prettier** integration via `eslint-plugin-prettier`
- Run `pnpm run lint:fix` before committing

### TypeScript Strictness

- Strict mode enabled in [tsconfig.json](tsconfig.json)
- Use explicit types for props, state, and function returns
- Avoid `any`; use `unknown` and type guards

### Naming Conventions

- **Contexts**: `MyContext`, hooks are `useMyContext()`
- **Components**: PascalCase, colocate related components in directories (e.g., `visx-visualization/`)
- **Utilities**: camelCase functions, kebab-case filenames (e.g., `array-reordering.ts`)

### File Organization

- **src/contexts/**: Zustand stores + providers
- **src/visx-visualization/**: Canvas-based interactive visualization
- **src/export/**: High-quality export system
- **src/dataLoading/**: Data fetching and transformation
- **src/utils/**: Pure functions (colors, normalizations, graph types)
- **src/hooks/**: Reusable React hooks

## Integration Points

### Data Loading

Two primary loaders in [src/dataLoading/](src/dataLoading/):

1. **HuBMAP Loader** ([dataHuBMAP.ts](src/dataLoading/dataHuBMAP.ts)): Fetches Zarr arrays from HuBMAP portal
2. **Generic Loader** ([dataLoaders.ts](src/dataLoading/dataLoaders.ts)): Converts ObsSets (AnnData format) to `ScellopData`

**Pattern**: Users pass `ScellopData` to `<Scellop data={...} />` or use `<ScellopHuBMAPLoader uuids={[...]} />` for HuBMAP data.

### External Dependencies

- **@visx**: Scales, axes, shapes for D3-like visualizations
- **@mui/material**: UI components (buttons, icons, switches)
- **@dnd-kit**: Drag-and-drop for reordering axes
- **@vitessce/zarr**: Zarr array loading for HuBMAP data
- **d3**: Used sparingly (e.g., color scales, violin KDE)
- **zustand**: Global state management

## Common Gotchas

1. **Context Nesting Order**: Providers must be nested in specific order (see [Providers.tsx](src/contexts/Providers.tsx)). If a context depends on another, it must be nested inside.

2. **Canvas vs SVG**: The main heatmap uses Canvas for performance. Export generates both Canvas (PNG) and SVG (vector) versions. Don't confuse the two rendering paths.

3. **Reactive Providers**: Some contexts have `reactive` prop to reset state when props change. Use cautiously (causes re-renders).

4. **Memoization**: Use `useMemo` for expensive calculations (e.g., scales, data maps). Use `proxy-memoize` for derived state in Zustand selectors.

5. **Browser Canvas Limits**: PNG export checks browser-specific canvas size limits (65535px in Chrome, 32767px in Firefox). See [src/export/README.md](src/export/README.md).

## Useful Files as References

- **Example Usage**: [demo/demo.tsx](demo/demo.tsx) - Shows full API with HuBMAP data
- **Component API**: [src/ScellopComponent.tsx](src/ScellopComponent.tsx) - Main entry point
- **State Patterns**: [src/contexts/DataContext.tsx](src/contexts/DataContext.tsx) - Complex Zustand with temporal state
- **Custom Hooks**: [src/utils/zustand.tsx](src/utils/zustand.tsx) - Context + Zustand factory functions
- **Rendering Logic**: [src/export/rendering-utils.ts](src/export/rendering-utils.ts) - Data-to-pixels calculations
