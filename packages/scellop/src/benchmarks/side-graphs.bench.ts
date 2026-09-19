/**
 * Side Graph Benchmarks
 * Tests performance of data preparation and aggregation for violin plots and bar charts
 *
 * Note: Full violin/bar rendering functions require complex parameters from the app context.
 * These benchmarks focus on the data processing steps which are the performance bottlenecks.
 */

import { scaleBand, scaleLinear } from "@visx/scale";
import { describe, test } from "vitest";
import { benchGroup, getBenchmarkDatasets } from "./setup-benchmarks";

describe("Side Graph Benchmarks", async () => {
  // BENCHMARK_DATASETS is populated by setup-benchmarks.ts beforeAll hook
  const datasets = await getBenchmarkDatasets();
  test("Data Preparation for Side Graphs", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
        add(`${name}`, () => {
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
        });
      }
    }));

  test("Scale Creation for Side Graphs", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
        const cellWidth = 100;

        add(`${name}`, () => {
          scaleBand<string>()
            .domain(data.colNames)
            .range([0, data.colNames.length * cellWidth])
            .padding(0.1);
        });

        add(`${name} - continuous scale for bars`, () => {
          scaleLinear({
            domain: [0, 1000],
            range: [500, 100],
          });
        });
      }
    }));

  test("Data Aggregation for Violins (O(n×m) Complexity)", ({ bench }) =>
    benchGroup(bench, (add) => {
      // This tests the core data aggregation that violins perform
      // The KDE calculation happens on top of this aggregated data
      for (const [name, data] of datasets) {
        add(`${name}`, () => {
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
    }));

  test("Fraction Normalization (Violin Prep)", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
        add(`${name}`, () => {
          const rowCounts: Record<string, number> = {};
          data.countsMatrix.forEach(([row, _, value]) => {
            rowCounts[row] = (rowCounts[row] || 0) + value;
          });

          const fractionDataMap: Record<string, number> = {};
          data.countsMatrix.forEach(([row, col, value]) => {
            fractionDataMap[`${row}-${col}`] = value / rowCounts[row];
          });
        });
      }
    }));

  test("Bar Stacking Calculations", ({ bench }) =>
    benchGroup(bench, (add) => {
      // Test stacking multiple segments for bar charts
      for (const [name, data] of datasets) {
        add(`${name} `, () => {
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
        });
      }
    }));

  test("Scalability Analysis", ({ bench }) =>
    benchGroup(bench, (add) => {
      // Demonstrate O(n×m) scaling for side graphs
      for (const [name, data] of datasets) {
        add(`${name}`, () => {
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
        });
      }
    }));
});
