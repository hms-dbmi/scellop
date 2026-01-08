/**
 * Heatmap Rendering Benchmarks
 * Tests performance of cell calculations and canvas rendering
 */

import { scaleBand } from "@visx/scale";
import { bench, describe } from "vitest";
import { calculateHeatmapCells } from "../utils/calculations/heatmap-cells";
import { renderCellsToCanvas } from "../utils/rendering/canvas-utils";
import {
  generateAllDatasets,
  generateSyntheticData,
  getDatasetStats,
} from "./fixtures/synthetic-datasets";

describe("Heatmap Rendering Benchmarks", () => {
  const datasets = generateAllDatasets();

  describe("Calculate Heatmap Cells", () => {
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);

      // Create scales for benchmarking
      const cellWidth = 10;
      const cellHeight = 10;
      const xScale = scaleBand<string>()
        .domain(data.colNames)
        .range([0, data.colNames.length * cellWidth])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(data.rowNames)
        .range([0, data.rowNames.length * cellHeight])
        .padding(0);

      // Create dataMap
      const dataMap: Record<string, number> = {};
      data.countsMatrix.forEach(([row, col, value]) => {
        dataMap[`${row}-${col}`] = value;
      });

      const colorScale = (value: number) =>
        `rgb(${Math.min(255, value)}, 0, 0)`;

      bench(
        `${name} (${stats.rows}×${stats.cols}, ${stats.nonZeroCells} cells)`,
        () => {
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });
        },
      );
    }
  });

  describe("Calculate Heatmap Cells with Expanded Rows", () => {
    const medium = datasets.get("medium");
    if (!medium) return;
    const cellWidth = 10;
    const cellHeight = 10;
    const xScale = scaleBand<string>()
      .domain(medium.colNames)
      .range([0, medium.colNames.length * cellWidth])
      .padding(0);
    const yScale = scaleBand<string>()
      .domain(medium.rowNames)
      .range([0, medium.rowNames.length * cellHeight])
      .padding(0);

    const dataMap: Record<string, number> = {};
    medium.countsMatrix.forEach(([row, col, value]) => {
      dataMap[`${row}-${col}`] = value;
    });

    const colorScale = (value: number) => `rgb(${Math.min(255, value)}, 0, 0)`;

    bench("No expanded rows", () => {
      calculateHeatmapCells({
        rows: medium.rowNames,
        columns: medium.colNames,
        dataMap,
        xScale,
        yScale,
        colorScale,
        backgroundColor: "white",
      });
    });

    bench("10% expanded rows", () => {
      const expandedCount = Math.floor(medium.rowNames.length * 0.1);
      const selectedValues = new Set(medium.rowNames.slice(0, expandedCount));
      calculateHeatmapCells({
        rows: medium.rowNames,
        columns: medium.colNames,
        dataMap,
        xScale,
        yScale,
        colorScale,
        backgroundColor: "white",
        selectedValues,
      });
    });

    bench("50% expanded rows", () => {
      const expandedCount = Math.floor(medium.rowNames.length * 0.5);
      const selectedValues = new Set(medium.rowNames.slice(0, expandedCount));
      calculateHeatmapCells({
        rows: medium.rowNames,
        columns: medium.colNames,
        dataMap,
        xScale,
        yScale,
        colorScale,
        backgroundColor: "white",
        selectedValues,
      });
    });
  });

  describe("Render Cells to Canvas", () => {
    for (const [name, data] of datasets) {
      // Skip huge datasets for canvas rendering (too slow)
      if (name === "xlarge") continue;

      const stats = getDatasetStats(data);
      const cellWidth = 10;
      const cellHeight = 10;

      const xScale = scaleBand<string>()
        .domain(data.colNames)
        .range([0, data.colNames.length * cellWidth])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(data.rowNames)
        .range([0, data.rowNames.length * cellHeight])
        .padding(0);

      const dataMap: Record<string, number> = {};
      data.countsMatrix.forEach(([row, col, value]) => {
        dataMap[`${row}-${col}`] = value;
      });

      const colorScale = (value: number) =>
        `rgb(${Math.min(255, value)}, 0, 0)`;

      const cells = calculateHeatmapCells({
        rows: data.rowNames,
        columns: data.colNames,
        dataMap,
        xScale,
        yScale,
        colorScale,
        backgroundColor: "white",
      });

      // Create canvas (jsdom provides basic canvas support)
      const canvas = document.createElement("canvas");
      canvas.width = data.colNames.length * cellWidth;
      canvas.height = data.rowNames.length * cellHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      bench(
        `${name} (${stats.rows}×${stats.cols}, ${cells.length} rendered cells)`,
        () => {
          renderCellsToCanvas(ctx, cells);
        },
      );
    }
  });

  describe("End-to-End: Calculate + Render", () => {
    const benchmarkSizes = ["tiny", "small", "medium", "large"];

    for (const name of benchmarkSizes) {
      const data = datasets.get(name);
      if (!data) continue;

      const stats = getDatasetStats(data);
      const cellWidth = 10;
      const cellHeight = 10;

      const xScale = scaleBand<string>()
        .domain(data.colNames)
        .range([0, data.colNames.length * cellWidth])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(data.rowNames)
        .range([0, data.rowNames.length * cellHeight])
        .padding(0);

      const dataMap: Record<string, number> = {};
      data.countsMatrix.forEach(([row, col, value]) => {
        dataMap[`${row}-${col}`] = value;
      });

      const colorScale = (value: number) =>
        `rgb(${Math.min(255, value)}, 0, 0)`;

      const canvas = document.createElement("canvas");
      canvas.width = data.colNames.length * cellWidth;
      canvas.height = data.rowNames.length * cellHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      bench(`${name} (${stats.rows}×${stats.cols} complete render)`, () => {
        const cells = calculateHeatmapCells({
          rows: data.rowNames,
          columns: data.colNames,
          dataMap,
          xScale,
          yScale,
          colorScale,
          backgroundColor: "white",
        });
        renderCellsToCanvas(ctx, cells);
      });
    }
  });

  describe("Scalability: Cell Calculation Complexity", () => {
    const scaleTests = [
      { rows: 10, cols: 10 },
      { rows: 50, cols: 50 },
      { rows: 100, cols: 100 },
      { rows: 200, cols: 200 },
      { rows: 500, cols: 500 },
      { rows: 1000, cols: 1000 },
    ];

    for (const { rows, cols } of scaleTests) {
      const data = generateSyntheticData({
        name: `scale-${rows}x${cols}`,
        rowCount: rows,
        colCount: cols,
        density: 0.3,
        withMetadata: false,
      });

      const stats = getDatasetStats(data);
      const cellWidth = 10;
      const cellHeight = 10;

      const xScale = scaleBand<string>()
        .domain(data.colNames)
        .range([0, data.colNames.length * cellWidth])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(data.rowNames)
        .range([0, data.rowNames.length * cellHeight])
        .padding(0);

      const dataMap: Record<string, number> = {};
      data.countsMatrix.forEach(([row, col, value]) => {
        dataMap[`${row}-${col}`] = value;
      });

      const colorScale = (value: number) =>
        `rgb(${Math.min(255, value)}, 0, 0)`;

      bench(
        `${rows}×${cols} = ${stats.nonZeroCells}/${rows * cols} non zero cells`,
        () => {
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });
        },
      );
    }
  });

  describe("Asymmetrical Dataset Rendering", () => {
    const asymmetricalTests = [
      { name: "square-50x50", rows: 50, cols: 50 },
      { name: "wide-50x500", rows: 50, cols: 500 },
      { name: "tall-500x50", rows: 500, cols: 50 },
      { name: "extraWide-20x1000", rows: 20, cols: 1000 },
      { name: "extraTall-1000x20", rows: 1000, cols: 20 },
    ];

    for (const { name, rows, cols } of asymmetricalTests) {
      const data = generateSyntheticData({
        name,
        rowCount: rows,
        colCount: cols,
        density: 0.3,
        withMetadata: false,
      });

      const stats = getDatasetStats(data);
      const cellWidth = 10;
      const cellHeight = 10;

      const xScale = scaleBand<string>()
        .domain(data.colNames)
        .range([0, data.colNames.length * cellWidth])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(data.rowNames)
        .range([0, data.rowNames.length * cellHeight])
        .padding(0);

      const dataMap: Record<string, number> = {};
      data.countsMatrix.forEach(([row, col, value]) => {
        dataMap[`${row}-${col}`] = value;
      });

      const colorScale = (value: number) =>
        `rgb(${Math.min(255, value)}, 0, 0)`;

      bench(
        `${name}: ${stats.rows}×${stats.cols} (${stats.nonZeroCells} cells)`,
        () => {
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });
        },
      );
    }
  });
});
