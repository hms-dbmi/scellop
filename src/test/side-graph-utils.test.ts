import { scaleBand } from "@visx/scale";
import { describe, expect, it } from "vitest";
import { calculateBars, calculateViolins } from "../export/side-graph-utils";

describe("side-graph-utils", () => {
  describe("calculateBars", () => {
    it("should calculate simple bar chart data", () => {
      const counts = { row1: 100, row2: 200, row3: 50 };
      const orderedValues = ["row1", "row2", "row3"];
      const categoricalScale = scaleBand<string>()
        .domain(orderedValues)
        .range([0, 300])
        .padding(0);

      const bars = calculateBars({
        orientation: "rows",
        counts,
        orderedValues,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        graphType: "Bars",
        normalization: "None",
        defaultColor: "steelblue",
      });

      expect(bars).toHaveLength(3);
      expect(bars[0].segments).toHaveLength(1);
      expect(bars[1].segments[0].width).toBeGreaterThan(
        bars[0].segments[0].width,
      ); // row2 (200) > row1 (100)
    });

    it("should skip removed values", () => {
      const counts = { row1: 100, row2: 200, row3: 50 };
      const orderedValues = ["row1", "row2", "row3"];
      const categoricalScale = scaleBand<string>()
        .domain(orderedValues)
        .range([0, 300])
        .padding(0);

      const bars = calculateBars({
        orientation: "rows",
        counts,
        orderedValues,
        removedValues: new Set(["row2"]),
        categoricalScale,
        domainLimit: 400,
        graphType: "Bars",
        normalization: "None",
        defaultColor: "steelblue",
      });

      expect(bars).toHaveLength(2);
      expect(bars.some((b) => b.key === "row2")).toBe(false);
    });

    it("should skip selected values for rows orientation", () => {
      const counts = { row1: 100, row2: 200, row3: 50 };
      const orderedValues = ["row1", "row2", "row3"];
      const categoricalScale = scaleBand<string>()
        .domain(orderedValues)
        .range([0, 300])
        .padding(0);

      const bars = calculateBars({
        orientation: "rows",
        counts,
        orderedValues,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        graphType: "Bars",
        normalization: "None",
        defaultColor: "steelblue",
        selectedValues: new Set(["row1"]), // row1 is expanded
      });

      expect(bars).toHaveLength(2);
      expect(bars.some((b) => b.key === "row1")).toBe(false);
    });

    it("should handle column orientation correctly", () => {
      const counts = { col1: 100, col2: 200 };
      const orderedValues = ["col1", "col2"];
      const categoricalScale = scaleBand<string>()
        .domain(orderedValues)
        .range([0, 200])
        .padding(0);

      const bars = calculateBars({
        orientation: "columns",
        counts,
        orderedValues,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        graphType: "Bars",
        normalization: "None",
        defaultColor: "steelblue",
      });

      expect(bars).toHaveLength(2);
      // Vertical bars should have different orientation
      const bar1 = bars[0];
      expect(bar1.backgroundY).toBeGreaterThan(0);
    });

    it("should create stacked bar segments", () => {
      const counts = { row1: 100, row2: 200 };
      const orderedValues = ["row1", "row2"];
      const stackValues = ["type1", "type2", "type3"];
      const rawDataMap = {
        "row1-type1": 40,
        "row1-type2": 30,
        "row1-type3": 30,
        "row2-type1": 100,
        "row2-type2": 50,
        "row2-type3": 50,
      };

      const categoricalScale = scaleBand<string>()
        .domain(orderedValues)
        .range([0, 200])
        .padding(0);

      const bars = calculateBars({
        orientation: "rows",
        counts,
        orderedValues,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        graphType: "Stacked Bars (Categorical)",
        normalization: "None",
        stackValues,
        removedStackValues: new Set(),
        rawDataMap,
        defaultColor: "steelblue",
      });

      expect(bars).toHaveLength(2);
      // Each bar should have 3 segments (one for each type)
      expect(bars[0].segments).toHaveLength(3);
      expect(bars[1].segments).toHaveLength(3);
    });

    it("should use axis colors when provided for non-stacked bars", () => {
      const counts = { row1: 100, row2: 200 };
      const orderedValues = ["row1", "row2"];
      const axisColors = {
        row1: "red",
        row2: "blue",
      };

      const categoricalScale = scaleBand<string>()
        .domain(orderedValues)
        .range([0, 200])
        .padding(0);

      const bars = calculateBars({
        orientation: "rows",
        counts,
        orderedValues,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        graphType: "Bars",
        normalization: "None",
        axisColors,
        defaultColor: "gray",
      });

      expect(bars[0].segments[0].color).toBe("red");
      expect(bars[1].segments[0].color).toBe("blue");
    });
  });

  describe("calculateViolins", () => {
    it("should calculate violin plot data", () => {
      const rows = ["row1", "row2"];
      const columns = ["type1", "type2"];
      const fractionDataMap = {
        "row1-type1": 0.3,
        "row1-type2": 0.7,
        "row2-type1": 0.4,
        "row2-type2": 0.6,
      };

      const categoricalScale = scaleBand<string>()
        .domain(rows)
        .range([0, 200])
        .padding(0);

      const violins = calculateViolins({
        orientation: "rows",
        orderedValues: rows,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        tickLabelSize: 0,
        rows,
        columns,
        fractionDataMap,
        color: "steelblue",
        width: 300,
        height: 400,
      });

      expect(violins).toHaveLength(2);
      expect(violins[0].key).toBe("row1");
      expect(violins[1].key).toBe("row2");
      expect(violins[0].path).toBeTruthy();
      expect(violins[1].path).toBeTruthy();
    });

    it("should skip removed categorical values", () => {
      const rows = ["row1", "row2", "row3"];
      const columns = ["type1"];
      const fractionDataMap = {
        "row1-type1": 0.5,
        "row2-type1": 0.5,
        "row3-type1": 0.5,
      };

      const categoricalScale = scaleBand<string>()
        .domain(rows)
        .range([0, 300])
        .padding(0);

      const violins = calculateViolins({
        orientation: "rows",
        orderedValues: rows,
        removedValues: new Set(["row2"]),
        categoricalScale,
        domainLimit: 400,
        tickLabelSize: 0,
        rows,
        columns,
        fractionDataMap,
        color: "steelblue",
        width: 300,
        height: 400,
      });

      expect(violins).toHaveLength(2);
      expect(violins.some((v) => v.key === "row2")).toBe(false);
    });

    it("should skip selected values for rows orientation", () => {
      const rows = ["row1", "row2"];
      const columns = ["type1"];
      const fractionDataMap = {
        "row1-type1": 0.5,
        "row2-type1": 0.5,
      };

      const categoricalScale = scaleBand<string>()
        .domain(rows)
        .range([0, 200])
        .padding(0);

      const violins = calculateViolins({
        orientation: "rows",
        orderedValues: rows,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        tickLabelSize: 0,
        rows,
        columns,
        fractionDataMap,
        color: "steelblue",
        selectedValues: new Set(["row1"]), // row1 is expanded
        width: 300,
        height: 400,
      });

      expect(violins).toHaveLength(1);
      expect(violins[0].key).toBe("row2");
    });

    it("should handle column orientation", () => {
      const rows = ["type1"];
      const columns = ["col1", "col2"];
      const fractionDataMap = {
        "type1-col1": 0.3,
        "type1-col2": 0.7,
      };

      const categoricalScale = scaleBand<string>()
        .domain(columns)
        .range([0, 200])
        .padding(0);

      const violins = calculateViolins({
        orientation: "columns",
        orderedValues: columns,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        tickLabelSize: 0,
        rows,
        columns,
        fractionDataMap,
        color: "steelblue",
        width: 200,
        height: 400,
      });

      expect(violins).toHaveLength(2);
      // Violins in column orientation should have y: 0
      expect(violins[0].y).toBe(0);
      expect(violins[1].y).toBe(0);
    });

    it("should use specified color", () => {
      const rows = ["row1", "row2"];
      const columns = ["type1"];
      const fractionDataMap = {
        "row1-type1": 0.5,
        "row2-type1": 0.5,
      };

      const categoricalScale = scaleBand<string>()
        .domain(rows)
        .range([0, 200])
        .padding(0);

      const violins = calculateViolins({
        orientation: "rows",
        orderedValues: rows,
        removedValues: new Set(),
        categoricalScale,
        domainLimit: 400,
        tickLabelSize: 0,
        rows,
        columns,
        fractionDataMap,
        color: "red",
        width: 300,
        height: 400,
      });

      expect(violins[0].color).toBe("red");
      expect(violins[1].color).toBe("red");
    });
  });
});
