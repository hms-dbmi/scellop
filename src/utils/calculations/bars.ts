/**
 * Bar chart calculation utilities
 * Used by both live visualization and export
 */

import { scaleLinear } from "@visx/scale";
import { getColorForValue } from "../categorical-colors";
import { BarData, CalculateBarsParams } from "./types";

/**
 * Calculate bar chart data for top or left side graphs
 * This is the single source of truth for bar chart positioning and stacking logic
 */
export function calculateBars(params: CalculateBarsParams): BarData[] {
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

    // Background dimensions and position - full stripe across domain
    const backgroundX = isVertical ? scaledPosition : 0;
    const backgroundY = isVertical ? 0 : scaledPosition;
    const backgroundWidth = isVertical ? barSize : domainLimit;
    const backgroundHeight = isVertical ? domainLimit : barSize;

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
            key: stackValue,
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
        key,
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
