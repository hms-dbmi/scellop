import { scaleBand, scaleLinear } from "@visx/scale";
import { area } from "@visx/shape";
import { curveNatural, ScaleBand } from "d3";
import { ScaleBand as CustomScaleBand } from "../contexts/types";
import { getColorForValue } from "../utils/categorical-colors";
import { BarData, ViolinPathData } from "./types";

/**
 * Calculate bar chart data for top or left side graphs
 */
export function calculateBars(params: {
  orientation: "rows" | "columns";
  counts: Record<string, number>;
  orderedValues: string[];
  removedValues: Set<string>;
  categoricalScale: ScaleBand<string> | CustomScaleBand<string>;
  domainLimit: number;
  graphType: string;
  normalization: string;
  // For stacked bars
  stackValues?: string[];
  removedStackValues?: Set<string>;
  rawDataMap?: Record<string, number>;
  normalizedDataMap?: Record<string, number>;
  colorScale?: {
    countsScale: (value: number) => string;
    percentageScale: (value: number) => string;
    logScale: (value: number) => string;
  };
  axisColors?: Record<string, string>;
  oppositeAxisColors?: Record<string, string>;
  defaultColor?: string;
  selectedValues?: Set<string>;
}): BarData[] {
  const {
    orientation,
    counts,
    orderedValues,
    removedValues,
    categoricalScale,
    domainLimit,
    graphType,
    normalization,
    stackValues = [],
    removedStackValues = new Set(),
    rawDataMap = {},
    normalizedDataMap = {},
    colorScale,
    axisColors,
    oppositeAxisColors,
    defaultColor = "#000",
    selectedValues = new Set(),
  } = params;

  const entries = Object.entries(counts);
  const result: BarData[] = [];

  // Create numerical scale
  const maxValue = Math.max(...Object.values(counts), 0);
  const numericalScale = scaleLinear({
    domain: [0, maxValue],
    range: [0, domainLimit],
    nice: true,
  });

  for (const [key, totalValue] of entries) {
    if (removedValues.has(key)) continue;
    if (orientation === "rows" && selectedValues.has(key)) continue;

    const scaledKey = categoricalScale(key);
    if (scaledKey === undefined) continue;

    const isVertical = orientation === "columns";
    const barSize = categoricalScale.bandwidth
      ? typeof categoricalScale.bandwidth === "function"
        ? (categoricalScale.bandwidth as (item?: string) => number)(key)
        : categoricalScale.bandwidth
      : 20;
    const scaledPosition = scaledKey;
    const [rangeStart, rangeEnd] = numericalScale.range();

    // Background dimensions and position
    const backgroundX = isVertical ? scaledPosition : domainLimit - rangeEnd;
    const backgroundY = isVertical ? domainLimit - rangeStart : scaledPosition;
    const backgroundWidth = isVertical ? barSize : rangeEnd;
    const backgroundHeight = isVertical ? rangeStart : barSize;

    // Create segments based on graph type
    const segments = [];

    if (
      graphType === "Stacked Bars (Categorical)" ||
      graphType === "Stacked Bars (Continuous)"
    ) {
      // Create stacked segments
      let currentOffset = 0;

      const activeStackValues = stackValues.filter(
        (stackValue) => !removedStackValues.has(stackValue),
      );

      for (const stackValue of activeStackValues) {
        const cellKey =
          orientation === "columns"
            ? `${stackValue}-${key}`
            : `${key}-${stackValue}`;
        const cellValue = rawDataMap[cellKey as keyof typeof rawDataMap] || 0;

        if (cellValue > 0) {
          const scaledSegmentValue = numericalScale(currentOffset + cellValue);
          const scaledCurrentOffset = numericalScale(currentOffset);
          const segmentLength = scaledSegmentValue - scaledCurrentOffset;

          const segmentX = isVertical
            ? scaledPosition
            : domainLimit - scaledSegmentValue;
          const segmentY = isVertical
            ? domainLimit - scaledSegmentValue
            : scaledPosition;
          const segmentWidth = isVertical ? barSize : segmentLength;
          const segmentHeight = isVertical ? segmentLength : barSize;

          let color: string;
          if (graphType === "Stacked Bars (Categorical)") {
            color = getColorForValue(
              stackValue,
              stackValues,
              oppositeAxisColors,
            );
          } else if (colorScale) {
            if (normalization === "None") {
              color = colorScale.countsScale(cellValue);
            } else if (normalization === "Log") {
              const normalizedValue =
                normalizedDataMap[cellKey as keyof typeof normalizedDataMap] ||
                0;
              color = colorScale.logScale(normalizedValue);
            } else {
              const normalizedValue =
                normalizedDataMap[cellKey as keyof typeof normalizedDataMap] ||
                0;
              color = colorScale.percentageScale(normalizedValue);
            }
          } else {
            color = defaultColor;
          }

          segments.push({
            x: segmentX,
            y: segmentY,
            width: segmentWidth,
            height: segmentHeight,
            value: cellValue,
            stackValue,
            color,
          });

          currentOffset += cellValue;
        }
      }
    } else {
      // Create a single unsegmented bar for "Bars" mode
      const scaledValue = numericalScale(totalValue);
      const barLength = scaledValue;

      const x = isVertical ? scaledPosition : domainLimit - scaledValue;
      const y = isVertical ? domainLimit - scaledValue : scaledPosition;
      const barWidth = isVertical ? barSize : barLength;
      const barHeight = isVertical ? barLength : barSize;

      const color = axisColors
        ? getColorForValue(key, orderedValues, axisColors)
        : defaultColor;

      segments.push({
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: totalValue,
        stackValue: key,
        color,
      });
    }

    result.push({
      key,
      totalValue,
      segments,
      backgroundX,
      backgroundY,
      backgroundWidth,
      backgroundHeight,
    });
  }

  return result;
}

/**
 * Calculate violin plot data for top or left side graphs
 */
export function calculateViolins(params: {
  orientation: "rows" | "columns";
  orderedValues: string[];
  removedValues: Set<string>;
  categoricalScale: ScaleBand<string> | CustomScaleBand<string>;
  domainLimit: number;
  tickLabelSize: number;
  rows: string[];
  columns: string[];
  fractionDataMap: Record<string, number>;
  color: string;
  selectedValues?: Set<string>;
}): ViolinPathData[] {
  const {
    orientation,
    orderedValues,
    removedValues,
    categoricalScale,
    domainLimit,
    tickLabelSize,
    rows,
    columns,
    fractionDataMap,
    color,
    selectedValues = new Set(),
  } = params;

  const result: ViolinPathData[] = [];
  const isTopViolins = orientation === "columns";

  // Determine which values to iterate over and which are the domain categories
  const positionValues = isTopViolins ? columns : rows;
  const domainCategories = isTopViolins ? rows : columns;

  // Create scale for violin internal height/width
  const violinRange: [number, number] = [tickLabelSize, domainLimit];
  const violinScale = scaleBand({
    range: violinRange,
    domain: domainCategories,
  });

  // Create scale for violin width (density)
  const densityScale = scaleLinear({
    domain: [0, 1],
    range: [0, categoricalScale.bandwidth() / 2],
  });

  // Create area generator (mirrored on both sides using -d[1] and d[1])
  const violinAreaGenerator = isTopViolins
    ? area<[string, number]>()
        .y((d) => (violinScale(d[0]) as number) || 0)
        .x0((d) => densityScale(-d[1]) + categoricalScale.bandwidth() / 2)
        .x1((d) => densityScale(d[1]) + categoricalScale.bandwidth() / 2)
        .curve(curveNatural)
    : area<[string, number]>()
        .x((d) => (violinScale(d[0]) as number) || 0)
        .y0((d) => densityScale(-d[1]) + categoricalScale.bandwidth() / 2)
        .y1((d) => densityScale(d[1]) + categoricalScale.bandwidth() / 2)
        .curve(curveNatural);

  // Calculate violin data for each position value
  for (const key of positionValues) {
    if (removedValues.has(key)) continue;
    if (orientation === "rows" && selectedValues.has(key)) continue;

    const scaledKey = categoricalScale(key);
    if (scaledKey === undefined) continue;

    // Get fraction data for this violin
    const violinEntry: [string, number][] = domainCategories.map((category) => {
      const cellKey = isTopViolins
        ? `${category}-${key}`
        : `${key}-${category}`;
      return [category, fractionDataMap[cellKey] || 0];
    });

    // Generate path
    const path = violinAreaGenerator(violinEntry) || "";

    result.push({
      key,
      path,
      x: isTopViolins ? scaledKey : 0,
      y: isTopViolins ? 0 : scaledKey,
      color,
    });
  }

  return result;
}
