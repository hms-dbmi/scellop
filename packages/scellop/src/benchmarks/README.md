# Scellop Performance Benchmarks

Comprehensive benchmarking suite for evaluating Scellop's performance characteristics across data processing, rendering, and export operations.

## Overview

This benchmark suite measures:

- **Data Processing**: Zustand selector performance, normalization calculations, metadata extraction
- **Heatmap Rendering**: Cell calculation complexity, canvas rendering throughput, scalability
- **Side Graphs**: Violin plot KDE calculations, bar chart rendering
- **Export**: High-resolution PNG generation, memory efficiency

## Running Benchmarks

### Run All Benchmarks

```bash
pnpm run bench
```

### Run Specific Benchmark Suites

```bash
# Data processing only
pnpm run bench -- data-processing

# Heatmap rendering only
pnpm run bench -- heatmap-rendering

# Side graphs only
pnpm run bench -- side-graphs

# Export only
pnpm run bench -- export
```

### Generate JSON Report

```bash
pnpm run bench -- --reporter=json --outputFile=benchmark-results.json
```

## Benchmark Structure

### Synthetic Datasets

Benchmarks use procedurally generated datasets with controlled characteristics:

**Square datasets:**

- **Tiny**: 10×10 (80% density) - Quick sanity checks
- **Small**: 50×50 (60% density) - Small real-world datasets
- **Medium**: 100×100 (40% density) - Typical use case (similar to demo)
- **Large**: 200×300 (30% density) - Large multi-tissue datasets
- **Huge**: 500×500 (20% density) - Stress testing
- **XLarge**: 1000×1000 (10% density) - Extreme scalability tests

**Asymmetrical datasets:**

- **Wide**: 50×500 (30% density) - Few datasets, many cell types
- **Tall**: 500×50 (30% density) - Many datasets, few cell types
- **ExtraWide**: 20×1000 (25% density) - Extreme horizontal asymmetry
- **ExtraTall**: 1000×20 (25% density) - Extreme vertical asymmetry

Datasets include metadata (tissue types, conditions, donors) to test metadata processing performance.

### Real-World Datasets

Add your own datasets to `fixtures/real-world-datasets.ts`:

```typescript
import { registerRealWorldDataset } from "./fixtures/real-world-datasets";
import { hubmapKidney } from "./my-datasets";

registerRealWorldDataset({
  name: "hubmap-kidney",
  description: "HuBMAP Kidney cell type composition",
  loader: () => hubmapKidney,
});
```

## Benchmark Suites

### 1. Data Processing (`data-processing.bench.ts`)

Measures Zustand selector and data transformation performance:

- **DataMap Creation**: Convert countsMatrix to O(1) lookup object
- **Derived States**: Calculate row/column counts, maxes, overall max
- **Normalizations**: Row fraction, column fraction, log transform
- **Metadata Processing**: Extract and organize metadata keys/values
- **Scalability**: Test O(n) vs O(n²) complexity

**Key Metrics**:

- Operations per second
- Time to compute derived state
- Scalability curves (10×10 to 1000×1000)

### 2. Heatmap Rendering (`heatmap-rendering.bench.ts`)

Measures core visualization rendering performance:

- **Calculate Heatmap Cells**: Position/color calculation for all cells
- **Expanded Rows**: Impact of inline bar visualizations (10%, 50%)
- **Canvas Rendering**: Drawing cells to canvas context
- **End-to-End**: Complete calculate + render pipeline
- **Scalability**: Rendering complexity at various sizes

**Key Metrics**:

- Cells calculated per second
- Cells rendered per second
- End-to-end render time
- Scalability (linear vs quadratic)

### 3. Side Graphs (`side-graphs.bench.ts`)

Measures side visualization performance (most computationally expensive):

- **Violin KDE**: Kernel density estimation for distribution plots
- **Bar Charts**: Stacked bar calculations
- **Category Impact**: Effect of row/column count on violin complexity
- **Comparison**: Violins vs Bars performance difference

**Key Metrics**:

- Violins calculated per second
- KDE calculation time
- Impact of category count (10 vs 100 categories)
- Bars vs Violins relative performance

### 4. Export (`export.bench.ts`)

Measures high-resolution export generation:

- **Resolution Scaling**: 1x, 2x, 4x resolution multipliers
- **Canvas Size Limits**: Approach browser limits (65535px)
- **Memory Efficiency**: Canvas allocation overhead
- **Complete Pipeline**: Full export workflow simulation

**Key Metrics**:

- Export generation time
- Memory peak during export
- Resolution scaling impact
- Browser limit proximity

## Interpreting Results

### Performance Targets

Based on typical use cases (100×100 cells, ~4000 non-zero values):

- **Data Processing**: < 10ms for dataMap creation
- **Heatmap Rendering**: < 50ms for calculate + render
- **Violin Plots**: < 200ms for 100 violins with 100 categories each
- **Export (2x)**: < 500ms for medium dataset

### Scalability Expectations

- **DataMap Creation**: O(n) - linear with non-zero cell count
- **Heatmap Calculation**: O(n) - linear with total cells
- **Canvas Rendering**: O(n) - linear with rendered cells
- **Violin KDE**: O(n×m) - quadratic with violins × categories

### Memory Considerations

- **Datasets**: ~1-5MB for typical datasets (64 datasets × 61 cell types)
- **Canvas Buffers**: width × height × 4 bytes (RGBA)
- **High-Res Export**: 4x resolution = 16x memory (e.g., 2000×2000 @ 4x = 256MB)

## Customization

### Add Custom Benchmarks

Create a new `.bench.ts` file in `src/benchmarks/`:

```typescript
import { bench, describe } from "vitest";

describe("My Custom Benchmarks", () => {
  bench("my operation", () => {
    // benchmark code
  });
});
```

### Add Custom Datasets

Edit `fixtures/synthetic-datasets.ts`:

```typescript
export const DATASET_CONFIGS: DatasetConfig[] = [
  // ...existing configs
  {
    name: "my-custom",
    rowCount: 150,
    colCount: 200,
    density: 0.5,
    withMetadata: true,
  },
];
```

### Configure Benchmark Options

Edit `vitest.bench.config.ts`:

```typescript
benchmark: {
  include: ["src/benchmarks/**/*.bench.ts"],
  reporters: ["verbose", "json"],
  outputFile: "./benchmark-results.json",
  // Add iterations, warmup, etc.
}
```

## CI Integration (Future)

To add CI benchmarking:

1. Run benchmarks on every PR
2. Compare against baseline (main branch)
3. Fail if regression > threshold (e.g., 10% slower)
4. Track historical performance over time

Example GitHub Actions workflow:

```yaml
- name: Run benchmarks
  run: pnpm run bench -- --reporter=json --outputFile=bench.json

- name: Compare against baseline
  run: node scripts/compare-benchmarks.js bench.json baseline.json
```

## Performance Profiling

For deep performance analysis:

1. **Chrome DevTools**: Record performance during benchmark
2. **React DevTools Profiler**: Component render times
3. **Memory Profiler**: Heap snapshots before/after operations

### Canvas Rendering Notes

The benchmark suite uses a **mocked Canvas API** (configured in `src/test/setup.ts`) for consistent cross-platform testing without native dependencies. The mock provides minimal Canvas 2D context methods (`fillRect`, `getImageData`, etc.) sufficient for measuring data processing and layout calculations.

**For production-quality Canvas benchmarks**, consider:

- Running benchmarks in actual browsers using Playwright/Puppeteer
- Testing on target platforms (Chrome, Firefox, Safari have different Canvas limits)
- Measuring real rendering quality, not just API call overhead

The current mocked benchmarks focus on **algorithmic complexity** (O(n) scaling) rather than absolute rendering speed.

## Contributing

When adding new features:

1. Add corresponding benchmarks
2. Document expected performance characteristics
3. Run benchmarks before/after to measure impact
4. Update this README with new benchmark suites

## Resources

- [Vitest Benchmark Mode](https://vitest.dev/api/#bench)
- [Canvas Performance Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [React Performance Optimization](https://react.dev/reference/react/memo)
