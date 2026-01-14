/**
 * Export Performance Benchmarks
 * Tests high-resolution PNG and SVG export generation
 */

import { scaleBand } from "@visx/scale";
import { bench, describe } from "vitest";
import { calculateHeatmapCells } from "../utils/calculations/heatmap-cells";
import { renderCellsToCanvas } from "../utils/rendering/canvas-utils";
import {
  getDatasetStats,
} from "./fixtures/synthetic-datasets";
import { getBenchmarkDatasets } from "./setup-benchmarks";

describe("Export Performance Benchmarks", async () => {
  const datasets = await getBenchmarkDatasets();

  describe("High-Resolution Canvas Export", () => {
    for (const [name, data] of datasets) {
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
          `${name} @${resolution}x resolution`,
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
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);

      // Test increasing cell sizes to approach browser limits
      const cellSizes = [10, 20, 50, 100];

      for (const cellSize of cellSizes) {
        const width = data.colNames.length * cellSize;
        const height = data.rowNames.length * cellSize;

        bench(
          `${name} - ${cellSize}px cells (${width}×${height}px canvas)`,
          () => {
            const xScale = scaleBand<string>()
              .domain(data.colNames)
              .range([0, width])
              .padding(0);
            const yScale = scaleBand<string>()
              .domain(data.rowNames)
              .range([0, height])
              .padding(0);

            const dataMap: Record<string, number> = {};
            data.countsMatrix.forEach(([row, col, value]) => {
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
              rows: data.rowNames,
              columns: data.colNames,
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
    }
  });

  describe("Export Memory Efficiency", () => {
    // Test memory impact of creating canvases for different dataset sizes
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);
      const cellWidth = 10;
      const cellHeight = 10;

      bench(`${name}`, () => {
        const canvas = document.createElement("canvas");
        canvas.width = data.colNames.length * cellWidth;
        canvas.height = data.rowNames.length * cellHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

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

        renderCellsToCanvas(ctx, cells);
      });
    }
  });

  describe("Complete Export Pipeline", () => {
    // Simulate the full export workflow
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);

      bench(
        `${name} - full pipeline`,
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
          // canvas.toDataURL('image/png') would be called here, but jsdom doesn't support it fully
        },
      );
    }
  });
});
