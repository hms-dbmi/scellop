/**
 * Violin plot calculation utilities
 * Used by both live visualization and export
 */

import { scaleBand, scaleLinear } from "@visx/scale";
import { area } from "@visx/shape";
import { curveNatural } from "d3";
import { CalculateViolinsParams, ViolinPathData } from "./types";

/**
 * Calculate violin plot data for top or left side graphs
 * This is the single source of truth for violin plot path generation
 */
export function calculateViolins(
  params: CalculateViolinsParams,
): ViolinPathData[] {
  const {
    orientation,
    // orderedValues,
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

  // Create scale for violin internal height/width - full extent from 0 to domainLimit
  const violinRange: [number, number] = [0, domainLimit];
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
