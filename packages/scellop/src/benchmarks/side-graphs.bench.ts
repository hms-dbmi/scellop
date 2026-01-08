/**
 * Side Graph Benchmarks
 * Tests performance of data preparation and aggregation for violin plots and bar charts
 *
 * Note: Full violin/bar rendering functions require complex parameters from the app context.
 * These benchmarks focus on the data processing steps which are the performance bottlenecks.
 */

import { scaleBand, scaleLinear } from "@visx/scale";
import { bench, describe } from "vitest";
import {
  generateAllDatasets,
  generateSyntheticData,
  getDatasetStats,
} from "./fixtures/synthetic-datasets";

describe("Side Graph Benchmarks", () => {
  const datasets = generateAllDatasets();

  describe("Data Preparation for Side Graphs", () => {
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);

      bench(
        `${name} - Calculate fraction dataMap (${stats.rows}×${stats.cols})`,
        () => {
          // Calculate row counts
          const rowCounts: Record<string, number> = {};
          data.countsMatrix.forEach(([row, _, value]) => {
            rowCounts[row] = (rowCounts[row] || 0) + value;
          });

          // Calculate fraction dataMap (required for violins)
          const fractionDataMap: Record<string, number> = {};
          data.countsMatrix.forEach(([row, col, value]) => {
            fractionDataMap[`${row}-${col}`] = value / rowCounts[row];
          });
        },
      );
    }
  });

  describe("Scale Creation for Side Graphs", () => {
    const medium = datasets.get("medium");
    if (!medium) return;

    const cellWidth = 100;

    bench("Create categorical scale (100 items)", () => {
      scaleBand<string>()
        .domain(medium.colNames)
        .range([0, medium.colNames.length * cellWidth])
        .padding(0.1);
    });

    bench("Create continuous scale for bars", () => {
      scaleLinear({
        domain: [0, 1000],
        range: [500, 100],
      });
    });
  });

  describe("Data Aggregation for Violins (O(n×m) Complexity)", () => {
    // This tests the core data aggregation that violins perform
    // The KDE calculation happens on top of this aggregated data
    const scaleTests = [
      { cols: 10, rows: 10, name: "10 violins × 10 categories" },
      { cols: 20, rows: 50, name: "20 violins × 50 categories" },
      { cols: 50, rows: 100, name: "50 violins × 100 categories" },
      { cols: 100, rows: 100, name: "100 violins × 100 categories" },
      { cols: 200, rows: 100, name: "200 violins × 100 categories" },
    ];

    for (const { cols, rows, name: testName } of scaleTests) {
      const data = generateSyntheticData({
        name: `scale-${cols}x${rows}`,
        rowCount: rows,
        colCount: cols,
        density: 0.5,
        withMetadata: false,
      });

      bench(testName, () => {
        // Calculate row counts (needed for normalization)
        const rowCounts: Record<string, number> = {};
        data.countsMatrix.forEach(([row, _, value]) => {
          rowCounts[row] = (rowCounts[row] || 0) + value;
        });

        // Calculate fraction dataMap (core data structure for violins)
        const fractionDataMap: Record<string, number> = {};
        data.countsMatrix.forEach(([row, col, value]) => {
          fractionDataMap[`${row}-${col}`] = value / rowCounts[row];
        });

        // Aggregate data per column (what violins do internally)
        for (const col of data.colNames) {
          const violinData: [string, number][] = data.rowNames.map((row) => {
            const cellKey = `${row}-${col}`;
            return [row, fractionDataMap[cellKey] || 0];
          });
          // In real violin calculation, this would go through KDE
          // which is O(n²) for each violin
          void violinData; // Demonstrate calculation overhead
        }
      });
    }
  });

  describe("Fraction Normalization (Violin Prep)", () => {
    const sizes = ["tiny", "small", "medium", "large", "huge"];

    for (const name of sizes) {
      const data = datasets.get(name);
      if (!data) continue;

      const stats = getDatasetStats(data);

      bench(
        `${name} (${stats.rows}×${stats.cols}, ${stats.nonZeroCells} cells)`,
        () => {
          const rowCounts: Record<string, number> = {};
          data.countsMatrix.forEach(([row, _, value]) => {
            rowCounts[row] = (rowCounts[row] || 0) + value;
          });

          const fractionDataMap: Record<string, number> = {};
          data.countsMatrix.forEach(([row, col, value]) => {
            fractionDataMap[`${row}-${col}`] = value / rowCounts[row];
          });
        },
      );
    }
  });

  describe("Bar Stacking Calculations", () => {
    // Test stacking multiple segments for bar charts
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);

      bench(
        `${name} - Stack ${stats.rows} segments × ${stats.cols} bars`,
        () => {
          // For each column, calculate stacked values
          for (const col of data.colNames) {
            let cumulativeHeight = 0;
            const segments: Array<{ row: string; y: number; height: number }> =
              [];

            for (const row of data.rowNames) {
              const value =
                data.countsMatrix.find(
                  ([r, c]) => r === row && c === col,
                )?.[2] || 0;

              segments.push({
                row,
                y: cumulativeHeight,
                height: value,
              });

              cumulativeHeight += value;
            }
            void segments; // Demonstrate stacking calculation
          }
        },
      );
    }
  });

  describe("Scalability Analysis", () => {
    // Demonstrate O(n×m) scaling for side graphs
    const sizes = [
      { rows: 10, cols: 10 },
      { rows: 50, cols: 50 },
      { rows: 100, cols: 100 },
      { rows: 200, cols: 200 },
    ];

    for (const { rows, cols } of sizes) {
      const data = generateSyntheticData({
        name: `scale-${rows}x${cols}`,
        rowCount: rows,
        colCount: cols,
        density: 0.4,
        withMetadata: false,
      });

      const stats = getDatasetStats(data);

      bench(
        `${rows}×${cols} data aggregation (${stats.nonZeroCells} cells)`,
        () => {
          const rowCounts: Record<string, number> = {};
          data.countsMatrix.forEach(([row, _, value]) => {
            rowCounts[row] = (rowCounts[row] || 0) + value;
          });

          const fractionDataMap: Record<string, number> = {};
          data.countsMatrix.forEach(([row, col, value]) => {
            fractionDataMap[`${row}-${col}`] = value / rowCounts[row];
          });

          // Aggregate per column (violin prep)
          for (const col of data.colNames) {
            const violinData: number[] = data.rowNames.map((row) => {
              const cellKey = `${row}-${col}`;
              return fractionDataMap[cellKey] || 0;
            });
            void violinData; // Demonstrate aggregation overhead
          }
        },
      );
    }
  });
});
