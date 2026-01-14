# Benchmark Enhancements Summary

## Changes Made (January 14, 2026)

### 1. Integrated Real-World Datasets

**What changed:**

- Removed separate `real-world.bench.ts` file
- Real-world datasets (`hubmap-lung`, `hubmap-kidney`, `hca-data`) are now automatically loaded from `sites/demo/src/` via `@demo` alias
- All existing benchmarks now run on both synthetic AND real-world datasets (12 total)

**Benefits:**

- Comprehensive performance testing with actual data characteristics
- No code duplication - single benchmark suite covers all datasets
- Real-world datasets test edge cases that synthetic data may miss

### 2. Parameterized Single-Dataset Tests

**What changed:**

- Tests that previously ran only on "medium" dataset now loop through all datasets
- Examples:
  - "Calculate Heatmap Cells with Expanded Rows" - now tests 0%, 10%, 50% expansion on all datasets
  - "Scale Creation for Side Graphs" - now tests scale creation for all dataset sizes

**Benefits:**

- More comprehensive testing across different data dimensions
- Identifies performance characteristics across dataset sizes
- Real-world datasets included in expansion/scaling tests

**Performance optimization:**

- Very large datasets (huge, extraWide, extraTall) skipped for expensive tests like expanded rows
- Prevents excessive benchmark runtime while maintaining coverage

### 3. Dataset Metadata in JSON Output

**What changed:**

- `bench:json` script now runs two steps:
  1. Generate benchmark results with `vitest --outputJson`
  2. Add dataset metadata with `add-metadata-to-results.ts`
- Resulting JSON now includes `datasets` array with:
  ```json
  {
    "datasets": [
      {
        "name": "tiny",
        "rows": 10,
        "cols": 10,
        "nonZeroCells": 82,
        "totalCells": 100,
        "density": "82.0%",
        "type": "synthetic"
      },
      {
        "name": "hubmap-lung",
        "rows": 45,
        "cols": 71,
        "nonZeroCells": 3195,
        "totalCells": 3195,
        "density": "100.0%",
        "type": "real-world"
      }
    ]
  }
  ```

**Benefits:**

- Complete reproducibility - know exact dataset characteristics used
- Programmatic access to dataset info for analysis tools
- Distinguish between synthetic and real-world datasets
- Track cell counts across benchmark runs

### 4. Enhanced Performance Report

**What changed:**

- Report now includes Standard Deviation (`SD`) and Relative Margin of Error (`RME`) columns
- Format: `| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |`

**Benefits:**

- Better understanding of measurement variability
- Easier identification of unstable benchmarks (high RME)
- Statistical rigor visible at a glance

## Dataset Summary

**Total datasets**: 12 (9 synthetic + 3 real-world)

**Synthetic datasets:**

1. tiny (10×10, ~80 cells)
2. small (50×50, ~1,500 cells)
3. medium (100×100, ~4,000 cells)
4. large (200×300, ~18,000 cells)
5. huge (500×500, ~50,000 cells)
6. wide (50×500, ~7,500 cells)
7. tall (500×50, ~7,500 cells)
8. extraWide (20×1000, ~5,000 cells)
9. extraTall (1000×20, ~5,000 cells)

**Real-world datasets:**

1. hubmap-lung (45×71, 3,195 cells)
2. hubmap-kidney (108×48, 5,184 cells)
3. hca-data (484×51, 24,684 cells)

## Usage

### Run all benchmarks with metadata

```bash
pnpm run bench:json
```

### Generate markdown report

```bash
pnpm dlx tsx scripts/generate-performance-report.ts
```

### View dataset statistics

```bash
pnpm run bench:stats        # Formatted output
pnpm run bench:stats:json   # JSON output
```

## Files Modified

1. **packages/scellop/src/benchmarks/heatmap-rendering.bench.ts**
   - Parameterized "Calculate Heatmap Cells with Expanded Rows" to run on all datasets
2. **packages/scellop/src/benchmarks/side-graphs.bench.ts**
   - Parameterized "Scale Creation for Side Graphs" to run on all datasets
3. **packages/scellop/src/benchmarks/setup-benchmarks.ts**
   - Added `getDatasetInfo()` helper function
   - Integrated real-world dataset loading
4. **packages/scellop/src/benchmarks/fixtures/real-world-datasets.ts**
   - Updated to use `@demo` alias for imports
5. **packages/scellop/vitest.bench.config.ts**
   - Added `@demo` alias pointing to `sites/demo/src`
6. **packages/scellop/package.json**
   - Updated `bench:json` to add metadata after benchmark run
7. **scripts/generate-performance-report.ts**
   - Added SD and RME columns to output tables
8. **packages/scellop/src/benchmarks/README.md**
   - Updated documentation to reflect integrated datasets
   - Documented metadata enhancement

## Files Created

1. **packages/scellop/src/benchmarks/add-metadata-to-results.ts**
   - Script to parse benchmark names and extract dataset metadata
   - Adds `datasets` array to JSON output
   - Categorizes datasets as synthetic vs real-world

## Files Deleted

1. **packages/scellop/src/benchmarks/real-world.bench.ts**
   - No longer needed - functionality integrated into existing benchmarks

## Next Steps

- Consider adding more real-world datasets as they become available
- Monitor RME values - consider increasing `time` config if many benchmarks have RME > 10%
- Use dataset metadata for longitudinal performance tracking
