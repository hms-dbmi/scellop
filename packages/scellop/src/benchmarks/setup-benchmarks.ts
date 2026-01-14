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
import { loadAllRealWorldDatasets } from "./fixtures/real-world-datasets";

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

/**
 * Get dataset info by name
 */
export function getDatasetInfo(name: string): DatasetInfo | undefined {
  return BENCHMARK_DATASET_STATS.find((info) => info.name === name);
}


// Load or generate benchmark datasets
export async function getBenchmarkDatasets() {
  if (BENCHMARK_DATASETS.size !== 0) {
    return BENCHMARK_DATASETS;
  }
  // otherwise, generate datasets
  for (const config of DATASET_CONFIGS) {
    const data = generateSyntheticData(config);
    BENCHMARK_DATASETS.set(config.name, data);

  }
  // and load real-world datasets
  const realWorldDatasets = await loadAllRealWorldDatasets();
  for (const [name, data] of realWorldDatasets) {
    BENCHMARK_DATASETS.set(name, data);
  }

  // Collect statistics
  for (const [name, data] of BENCHMARK_DATASETS) {
    const stats = getDatasetStats(data);
    // Calculate row sum statistics
    const rowSumsArray = Object.values(stats.rowSums);
    const totalSum = rowSumsArray.reduce((acc, sum) => acc + sum, 0);
    const avgSum = totalSum / rowSumsArray.length;
    const minSum = Math.min(...rowSumsArray);
    const maxSum = Math.max(...rowSumsArray);
    BENCHMARK_DATASET_STATS.push({
      name,
      config: {
        rowCount: data.rowNames.length,
        colCount: data.colNames.length,
        density: data.countsMatrix.reduce(
          (acc, curr) => acc + (curr ? 1 : 0),
          0,
        ) / (data.rowNames.length * data.colNames.length),
        withMetadata: !!data.metadata,
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
    });
  }

  return BENCHMARK_DATASETS;
}

beforeAll(async () => {

  const datasets = await getBenchmarkDatasets();

  console.log("\n" + "-".repeat(80));
  console.log("🌍 REAL-WORLD DATASETS");
  console.log("-".repeat(80));

  // Load real-world datasets
  const realWorldDatasets = await loadAllRealWorldDatasets();
  
  for (const [name, data] of realWorldDatasets) {
    BENCHMARK_DATASETS.set(name, data);
    
    const stats = getDatasetStats(data);
    const rowSumsArray = Object.values(stats.rowSums);
    const totalSum = rowSumsArray.reduce((acc, sum) => acc + sum, 0);
    const avgSum = totalSum / rowSumsArray.length;
    const minSum = Math.min(...rowSumsArray);
    const maxSum = Math.max(...rowSumsArray);

    const datasetInfo = {
      name,
      config: {
        rowCount: stats.rows,
        colCount: stats.cols,
        density: stats.nonZeroCells / stats.totalCells,
        withMetadata: stats.hasMetadata,
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

    console.log(
      `${name.toUpperCase()}: ${stats.rows}×${stats.cols} (${stats.nonZeroCells} cells)`,
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

  // Write stats to file for use by metadata script
  const { writeFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  writeFileSync(
    resolve("benchmark-dataset-stats.json"),
    JSON.stringify(BENCHMARK_DATASET_STATS, null, 2),
  );
});
