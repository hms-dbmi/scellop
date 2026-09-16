#!/usr/bin/env tsx
/**
 * Display statistics for all synthetic benchmark datasets,
 * including row sums for each dataset
 *
 * Usage:
 *   tsx show-dataset-stats.ts           # Formatted output
 *   tsx show-dataset-stats.ts --json    # JSON output
 */

import {
  DATASET_CONFIGS,
  generateSyntheticData,
  getDatasetStats,
  printRowSums,
} from "../src/benchmarks/fixtures/synthetic-datasets";

const isJsonMode = process.argv.includes("--json");

if (isJsonMode) {
  // JSON output mode
  const allStats = DATASET_CONFIGS.map((config) => {
    const data = generateSyntheticData(config);
    const stats = getDatasetStats(data);

    // Calculate row sum statistics
    const rowSumsArray = Object.values(stats.rowSums);
    const totalSum = rowSumsArray.reduce((acc, sum) => acc + sum, 0);
    const avgSum = totalSum / rowSumsArray.length;
    const minSum = Math.min(...rowSumsArray);
    const maxSum = Math.max(...rowSumsArray);

    return {
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
  });

  console.log(JSON.stringify(allStats, null, 2));
} else {
  // Formatted output mode
  console.log("=".repeat(80));
  console.log("Synthetic Dataset Statistics");
  console.log("=".repeat(80));

  for (const config of DATASET_CONFIGS) {
    const data = generateSyntheticData(config);
    const stats = getDatasetStats(data);

    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `Dataset: ${config.name.toUpperCase()} (${stats.rows}×${stats.cols})`,
    );
    console.log(`${"=".repeat(80)}`);
    console.log(`Dimensions: ${stats.rows} rows × ${stats.cols} columns`);
    console.log(`Total cells: ${stats.totalCells.toLocaleString()}`);
    console.log(`Non-zero cells: ${stats.nonZeroCells.toLocaleString()}`);
    console.log(`Density: ${stats.density}`);
    console.log(`Metadata: ${stats.hasMetadata ? "Yes" : "No"}`);

    printRowSums(data, config.name);
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("End of Dataset Statistics");
  console.log("=".repeat(80));
}
