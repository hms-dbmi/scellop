/**
 * Benchmark setup - runs before all benchmarks
 * Outputs dataset statistics for the fixtures used in benchmarks
 */

import type { ScellopData } from "@scellop/data-loading";
import { beforeAll } from "vitest";
import {
  DATASET_CONFIGS,
  generateSyntheticData,
  getDatasetStats,
} from "./fixtures/synthetic-datasets";

interface DatasetInfo {
  name: string;
  config: {
    rowCount: number;
    colCount: number;
    density: number;
    withMetadata?: boolean;
  };
  stats: {
    rows: number;
    cols: number;
    totalCells: number;
    nonZeroCells: number;
    density: string;
    hasMetadata: boolean;
  };
  rowSums: {
    total: number;
    average: number;
    min: number;
    max: number;
    range: number;
    values: Record<string, number>;
  };
}

// Store generated datasets and their stats globally
export const BENCHMARK_DATASETS = new Map<string, ScellopData>();
export const BENCHMARK_DATASET_STATS: DatasetInfo[] = [];

beforeAll(() => {
  console.log("\n" + "=".repeat(80));
  console.log("BENCHMARK DATASET STATISTICS");
  console.log("=".repeat(80));
  console.log(
    "Note: These are the actual datasets used in the following benchmarks\n",
  );

  // Generate all datasets and collect stats
  for (const config of DATASET_CONFIGS) {
    const data = generateSyntheticData(config);
    const stats = getDatasetStats(data);

    // Store for use in benchmarks
    BENCHMARK_DATASETS.set(config.name, data);

    // Calculate row sum statistics
    const rowSumsArray = Object.values(stats.rowSums);
    const totalSum = rowSumsArray.reduce((acc, sum) => acc + sum, 0);
    const avgSum = totalSum / rowSumsArray.length;
    const minSum = Math.min(...rowSumsArray);
    const maxSum = Math.max(...rowSumsArray);

    const datasetInfo = {
      name: config.name,
      config: {
        rowCount: config.rowCount,
        colCount: config.colCount,
        density: config.density,
        withMetadata: config.withMetadata,
      },
      stats: {
        rows: stats.rows,
        cols: stats.cols,
        totalCells: stats.totalCells,
        nonZeroCells: stats.nonZeroCells,
        density: stats.density,
        hasMetadata: stats.hasMetadata,
      },
      rowSums: {
        total: totalSum,
        average: avgSum,
        min: minSum,
        max: maxSum,
        range: maxSum - minSum,
        values: stats.rowSums,
      },
    };

    BENCHMARK_DATASET_STATS.push(datasetInfo);

    // Print formatted output
    console.log(
      `${config.name.toUpperCase()}: ${stats.rows}×${stats.cols} (${stats.nonZeroCells} cells)`,
    );
    console.log(
      `  Row sums: total=${totalSum}, avg=${avgSum.toFixed(2)}, min=${minSum}, max=${maxSum}`,
    );
  }

  console.log("\n" + "=".repeat(80));
  console.log("BENCHMARK DATASET STATISTICS (JSON)");
  console.log("=".repeat(80));
  console.log(JSON.stringify(BENCHMARK_DATASET_STATS, null, 2));
  console.log("=".repeat(80) + "\n");
});
