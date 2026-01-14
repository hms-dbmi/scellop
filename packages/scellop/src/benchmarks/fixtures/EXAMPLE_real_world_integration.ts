/**
 * Example: How to add your real-world datasets to benchmarks
 *
 * This file demonstrates how to register your HuBMAP/HCA datasets
 * for performance benchmarking.
 */

// import type { ScellopData } from "@scellop/data-loading";
// import { registerRealWorldDataset } from "./real-world-datasets";

/**
 * STEP 1: Import or define your datasets
 *
 * Option A: Import pre-loaded data
 * import { hubmapKidney, hubmapLung, hcaData } from '../path/to/your/datasets';
 *
 * Option B: Load dynamically
 * import { loadHuBMAPData } from '@scellop/hubmap-data-loading';
 */

/**
 * STEP 2: Register datasets using registerRealWorldDataset()
 *
 * For pre-loaded data:
 */

// Example: If you have hubmapKidney already loaded
// registerRealWorldDataset({
//   name: "hubmap-kidney",
//   description: "HuBMAP Kidney cell type composition - real patient data",
//   loader: () => hubmapKidney, // Return synchronously
// });

/**
 * For dynamic loading:
 */

// Example: Load HuBMAP data on-demand
// registerRealWorldDataset({
//   name: "hubmap-lung",
//   description: "HuBMAP Lung cell type composition",
//   loader: async () => {
//     const { loadHuBMAPData } = await import("@scellop/hubmap-data-loading");
//     return await loadHuBMAPData(["uuid1", "uuid2", "uuid3"]);
//   },
// });

/**
 * For HCA data:
 */

// registerRealWorldDataset({
//   name: "hca-pancreas",
//   description: "Human Cell Atlas pancreas dataset",
//   loader: () => hcaData,
// });

/**
 * STEP 3: Create a dedicated benchmark file for real-world data
 *
 * Create: src/benchmarks/real-world-data.bench.ts
 */

/**
 * Example benchmark file content:
 *
 * ```typescript
 * import { bench, describe } from "vitest";
 * import { scaleBand } from "@visx/scale";
 * import { calculateHeatmapCells } from "../utils/calculations/heatmap-cells";
 * import { loadRealWorldDataset } from "./fixtures/real-world-datasets";
 * import { getDatasetStats } from "./fixtures/synthetic-datasets";
 *
 * describe("Real-World Dataset Benchmarks", () => {
 *   describe("HuBMAP Kidney", async () => {
 *     const data = await loadRealWorldDataset("hubmap-kidney");
 *     if (!data) return;
 *
 *     const stats = getDatasetStats(data);
 *     console.log(`Benchmarking: ${stats.rows} rows × ${stats.cols} cols = ${stats.nonZeroCells} cells`);
 *
 *     bench("Calculate heatmap cells", () => {
 *       const cellWidth = 10;
 *       const xScale = scaleBand<string>()
 *         .domain(data.colNames)
 *         .range([0, data.colNames.length * cellWidth])
 *         .padding(0);
 *       const yScale = scaleBand<string>()
 *         .domain(data.rowNames)
 *         .range([0, data.rowNames.length * cellWidth])
 *         .padding(0);
 *
 *       const dataMap: Record<string, number> = {};
 *       data.countsMatrix.forEach(([row, col, value]) => {
 *         dataMap[`${row}-${col}`] = value;
 *       });
 *
 *       calculateHeatmapCells({
 *         rows: data.rowNames,
 *         columns: data.colNames,
 *         dataMap,
 *         xScale,
 *         yScale,
 *         colorScale: (v) => `rgb(${Math.min(255, v)}, 0, 0)`,
 *         backgroundColor: "white",
 *       });
 *     });
 *   });
 * });
 * ```
 */

/**
 * STEP 4: Run benchmarks
 *
 * pnpm run bench -- real-world-data
 */

/**
 * Quick setup example for your case:
 */

// Assuming you have hubmapKidney, hubmapLung, hcaData available:

/*
import { hubmapKidney, hubmapLung, hcaData } from './my-real-datasets';

registerRealWorldDataset({
  name: "hubmap-kidney",
  description: "HuBMAP Kidney dataset",
  loader: () => hubmapKidney,
});

registerRealWorldDataset({
  name: "hubmap-lung",
  description: "HuBMAP Lung dataset",
  loader: () => hubmapLung,
});

registerRealWorldDataset({
  name: "hca-data",
  description: "Human Cell Atlas dataset",
  loader: () => hcaData,
});
*/

/**
 * Then create benchmarks that use these datasets!
 */
