/**
 * Export Performance Benchmarks
 * Tests high-resolution PNG and SVG export generation
 */

import { scaleBand } from "@visx/scale";
import { bench, describe } from "vitest";
import { calculateHeatmapCells } from "../utils/calculations/heatmap-cells";
import { renderCellsToCanvas } from "../utils/rendering/canvas-utils";
import {
  generateAllDatasets,
  getDatasetStats,
} from "./fixtures/synthetic-datasets";

describe("Export Performance Benchmarks", () => {
  const datasets = generateAllDatasets();

  describe("High-Resolution Canvas Export", () => {
    const exportSizes = ["tiny", "small", "medium"];

    for (const name of exportSizes) {
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

      // Test different resolution multipliers
      const resolutions = [1, 2, 4];

      for (const resolution of resolutions) {
        bench(
          `${name} @${resolution}x resolution (${stats.rows}×${stats.cols})`,
          () => {
            const canvas = document.createElement("canvas");
            canvas.width = data.colNames.length * cellWidth * resolution;
            canvas.height = data.rowNames.length * cellHeight * resolution;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Scale context for high-DPI
            ctx.scale(resolution, resolution);

            // Calculate cells at base resolution
            const cells = calculateHeatmapCells({
              rows: data.rowNames,
              columns: data.colNames,
              dataMap,
              xScale,
              yScale,
              colorScale,
              backgroundColor: "white",
            });

            // Render to canvas
            renderCellsToCanvas(ctx, cells);
          },
        );
      }
    }
  });

  describe("Canvas Size Limits", () => {
    const small = datasets.get("small");
    if (!small) return;

    const stats = getDatasetStats(small);

    // Test increasing cell sizes to approach browser limits
    const cellSizes = [10, 20, 50, 100];

    for (const cellSize of cellSizes) {
      const width = small.colNames.length * cellSize;
      const height = small.rowNames.length * cellSize;

      bench(
        `${stats.rows}×${stats.cols} @ ${cellSize}px cells (${width}×${height}px canvas)`,
        () => {
          const xScale = scaleBand<string>()
            .domain(small.colNames)
            .range([0, width])
            .padding(0);
          const yScale = scaleBand<string>()
            .domain(small.rowNames)
            .range([0, height])
            .padding(0);

          const dataMap: Record<string, number> = {};
          small.countsMatrix.forEach(([row, col, value]) => {
            dataMap[`${row}-${col}`] = value;
          });

          const colorScale = (value: number) =>
            `rgb(${Math.min(255, value)}, 0, 0)`;

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const cells = calculateHeatmapCells({
            rows: small.rowNames,
            columns: small.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });

          renderCellsToCanvas(ctx, cells);
        },
      );
    }
  });

  describe("Export Memory Efficiency", () => {
    // Test memory impact of creating multiple canvases
    const medium = datasets.get("medium");
    if (!medium) return;

    const stats = getDatasetStats(medium);
    const cellWidth = 10;
    const cellHeight = 10;

    bench(`Create single canvas (${stats.rows}×${stats.cols})`, () => {
      const canvas = document.createElement("canvas");
      canvas.width = medium.colNames.length * cellWidth;
      canvas.height = medium.rowNames.length * cellHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

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

      const colorScale = (value: number) =>
        `rgb(${Math.min(255, value)}, 0, 0)`;

      const cells = calculateHeatmapCells({
        rows: medium.rowNames,
        columns: medium.colNames,
        dataMap,
        xScale,
        yScale,
        colorScale,
        backgroundColor: "white",
      });

      renderCellsToCanvas(ctx, cells);
    });
  });

  describe("Complete Export Pipeline", () => {
    // Simulate the full export workflow
    const benchmarkSizes = ["tiny", "small", "medium"];

    for (const name of benchmarkSizes) {
      const data = datasets.get(name);
      if (!data) continue;

      const stats = getDatasetStats(data);

      bench(
        `Full export pipeline - ${name} (${stats.rows}×${stats.cols})`,
        () => {
          const resolution = 2;
          const cellWidth = 10;
          const cellHeight = 10;

          // Step 1: Create scales
          const xScale = scaleBand<string>()
            .domain(data.colNames)
            .range([0, data.colNames.length * cellWidth])
            .padding(0);
          const yScale = scaleBand<string>()
            .domain(data.rowNames)
            .range([0, data.rowNames.length * cellHeight])
            .padding(0);

          // Step 2: Prepare data
          const dataMap: Record<string, number> = {};
          data.countsMatrix.forEach(([row, col, value]) => {
            dataMap[`${row}-${col}`] = value;
          });

          const colorScale = (value: number) =>
            `rgb(${Math.min(255, value)}, 0, 0)`;

          // Step 3: Calculate cells
          const cells = calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });

          // Step 4: Create canvas
          const canvas = document.createElement("canvas");
          canvas.width = data.colNames.length * cellWidth * resolution;
          canvas.height = data.rowNames.length * cellHeight * resolution;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.scale(resolution, resolution);

          // Step 5: Render
          renderCellsToCanvas(ctx, cells);

          // Step 6: Generate blob (simulated - would normally convert to PNG)
          // canvas.toDataURL('image/png') would be called here
        },
      );
    }
  });
});
