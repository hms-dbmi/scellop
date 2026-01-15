import { scaleBand } from "@visx/scale";
import { describe, expect, it } from "vitest";
import {
  calculateHeatmapCells,
  calculateInlineBars,
} from "../export/rendering-utils";

describe("rendering-utils", () => {
  describe("calculateHeatmapCells", () => {
    it("should calculate basic heatmap cells correctly", () => {
      const rows = ["row1", "row2"];
      const columns = ["col1", "col2"];
      const dataMap = {
        "row1-col1": 10,
        "row1-col2": 20,
        "row2-col1": 30,
        "row2-col2": 0,
      };

      const xScale = scaleBand<string>()
        .domain(columns)
        .range([0, 200])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(rows)
        .range([0, 100])
        .padding(0);

      const colorScale = (value: number) => `rgb(${value}, 0, 0)`;
      const backgroundColor = "white";

      const cells = calculateHeatmapCells({
        rows,
        columns,
        dataMap,
        xScale,
        yScale,
        colorScale,
        backgroundColor,
      });

      expect(cells).toHaveLength(4);
      expect(cells[0]).toMatchObject({
        row: "row1",
        column: "col1",
        value: 10,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        color: "rgb(10, 0, 0)",
      });

      // Zero value should use background color
      expect(cells[3]).toMatchObject({
        row: "row2",
        column: "col2",
        value: 0,
        color: "white",
      });
    });

    it("should skip expanded rows when selectedValues is provided", () => {
      const rows = ["row1", "row2", "row3"];
      const columns = ["col1"];
      const dataMap = {
        "row1-col1": 10,
        "row2-col1": 20,
        "row3-col1": 30,
      };

      const xScale = scaleBand<string>()
        .domain(columns)
        .range([0, 100])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(rows)
        .range([0, 150])
        .padding(0);

      const cells = calculateHeatmapCells({
        rows,
        columns,
        dataMap,
        xScale,
        yScale,
        colorScale: () => "blue",
        backgroundColor: "white",
        selectedValues: new Set(["row2"]), // row2 is expanded
      });

      expect(cells).toHaveLength(2);
      expect(cells.some((c) => c.row === "row2")).toBe(false);
    });

    it("should apply scroll offsets correctly", () => {
      const rows = ["row1"];
      const columns = ["col1"];
      const dataMap = { "row1-col1": 10 };

      const xScale = scaleBand<string>()
        .domain(columns)
        .range([0, 100])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(rows)
        .range([0, 100])
        .padding(0);

      const cells = calculateHeatmapCells({
        rows,
        columns,
        dataMap,
        xScale,
        yScale,
        colorScale: () => "blue",
        backgroundColor: "white",
        xScroll: 50,
        yScroll: 25,
      });

      expect(cells[0].x).toBe(-50);
      expect(cells[0].y).toBe(-25);
    });
  });

  describe("calculateInlineBars", () => {
    it("should calculate inline bar data for expanded rows", () => {
      const rows = ["row1", "row2"];
      const columns = ["col1", "col2"];
      const dataMap = {
        "row1-col1": 10,
        "row1-col2": 20,
        "row2-col1": 5,
        "row2-col2": 15,
      };
      const rowMaxes = { row1: 20, row2: 15 };

      const xScale = scaleBand<string>()
        .domain(columns)
        .range([0, 200])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(rows)
        .range([0, 200])
        .padding(0);

      const cells = calculateInlineBars({
        rows,
        columns,
        dataMap,
        rowMaxes,
        xScale,
        yScale,
        selectedValues: new Set(["row1"]), // Only row1 is expanded
        normalization: "None",
        defaultColor: "steelblue",
        backgroundColor: "white",
      });

      // Should have 2 columns * 2 cells each (background + bar) = 4 cells
      expect(cells).toHaveLength(4);

      // Background cells
      expect(cells[0].color).toBe("white");
      expect(cells[2].color).toBe("white");

      // Bar cells
      expect(cells[1].color).toBe("steelblue");
      expect(cells[3].color).toBe("steelblue");

      // Bar height should be proportional to value
      const bar1Height = cells[1].height;
      const bar2Height = cells[3].height;
      expect(bar2Height).toBeGreaterThan(bar1Height); // 20 > 10
    });

    it("should use column colors when provided", () => {
      const rows = ["row1"];
      const columns = ["col1", "col2"];
      const dataMap = { "row1-col1": 10, "row1-col2": 20 };
      const rowMaxes = { row1: 20 };

      const xScale = scaleBand<string>()
        .domain(columns)
        .range([0, 200])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(rows)
        .range([0, 100])
        .padding(0);

      const columnColors = {
        col1: "red",
        col2: "blue",
      };

      const cells = calculateInlineBars({
        rows,
        columns,
        dataMap,
        rowMaxes,
        xScale,
        yScale,
        selectedValues: new Set(["row1"]),
        normalization: "None",
        columnColors,
        defaultColor: "gray",
        backgroundColor: "white",
      });

      // Find bar cells (non-white)
      const barCells = cells.filter((c) => c.color !== "white");
      expect(barCells[0].color).toBe("red");
      expect(barCells[1].color).toBe("blue");
    });

    it("should handle log normalization correctly", () => {
      const rows = ["row1"];
      const columns = ["col1"];
      const dataMap = { "row1-col1": 99 }; // log(100) ≈ 4.6
      const rowMaxes = { row1: 99 };

      const xScale = scaleBand<string>()
        .domain(columns)
        .range([0, 100])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(rows)
        .range([0, 100])
        .padding(0);

      const cells = calculateInlineBars({
        rows,
        columns,
        dataMap,
        rowMaxes,
        xScale,
        yScale,
        selectedValues: new Set(["row1"]),
        normalization: "Log",
        defaultColor: "blue",
        backgroundColor: "white",
      });

      const barCell = cells.find((c) => c.color === "blue");
      expect(barCell).toBeDefined();
      // With log scale, value 99 should scale based on log(100)
      // Bar height should be close to full height since log(100)/log(100) ≈ 1
      expect(barCell!.height).toBeGreaterThan(90);
    });

    it("should only render bars for selected rows", () => {
      const rows = ["row1", "row2", "row3"];
      const columns = ["col1"];
      const dataMap = {
        "row1-col1": 10,
        "row2-col1": 20,
        "row3-col1": 30,
      };
      const rowMaxes = { row1: 10, row2: 20, row3: 30 };

      const xScale = scaleBand<string>()
        .domain(columns)
        .range([0, 100])
        .padding(0);
      const yScale = scaleBand<string>()
        .domain(rows)
        .range([0, 300])
        .padding(0);

      const cells = calculateInlineBars({
        rows,
        columns,
        dataMap,
        rowMaxes,
        xScale,
        yScale,
        selectedValues: new Set(["row2"]), // Only row2
        normalization: "None",
        defaultColor: "blue",
        backgroundColor: "white",
      });

      // Should only have cells for row2 (2 cells: background + bar)
      expect(cells).toHaveLength(2);
      expect(cells.every((c) => c.row === "row2")).toBe(true);
    });
  });
});
