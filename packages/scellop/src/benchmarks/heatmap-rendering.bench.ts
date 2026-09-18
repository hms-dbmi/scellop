/**
 * Heatmap Rendering Benchmarks
 * Tests performance of cell calculations and canvas rendering
 */

import { scaleBand } from "@visx/scale";
import { describe, test } from "vitest";
import { calculateHeatmapCells } from "../utils/calculations/heatmap-cells";
import { renderCellsToCanvas } from "../utils/rendering/canvas-utils";
import { benchGroup, getBenchmarkDatasets } from "./setup-benchmarks";

describe("Heatmap Rendering Benchmarks", async () => {
  const datasets = await getBenchmarkDatasets();

  test("Calculate Heatmap Cells", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
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

        add(`${name}`, () => {
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });
        });
      }
    }));

  test("Calculate Heatmap Cells with Expanded Rows", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
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

        add(`${name} - no expanded rows`, () => {
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });
        });

        add(`${name} - 10% expanded rows`, () => {
          const expandedCount = Math.floor(data.rowNames.length * 0.1);
          const selectedValues = new Set(data.rowNames.slice(0, expandedCount));
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
            selectedValues,
          });
        });

        add(`${name} - 50% expanded rows`, () => {
          const expandedCount = Math.floor(data.rowNames.length * 0.5);
          const selectedValues = new Set(data.rowNames.slice(0, expandedCount));
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
            selectedValues,
          });
        });
      }
    }));

  test("Render Cells to Canvas", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
        // Skip huge datasets for canvas rendering (too slow)
        if (name === "xlarge") continue;

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

        add(`${name}`, () => {
          renderCellsToCanvas(ctx, cells);
        });
      }
    }));

  test("End-to-End: Calculate + Render", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
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

        add(`${name}`, () => {
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
    }));

  test("Scalability: Cell Calculation Complexity", ({ bench }) =>
    benchGroup(bench, (add) => {
      for (const [name, data] of datasets) {
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

        add(`${name}`, () => {
          calculateHeatmapCells({
            rows: data.rowNames,
            columns: data.colNames,
            dataMap,
            xScale,
            yScale,
            colorScale,
            backgroundColor: "white",
          });
        });
      }
    }));
});
