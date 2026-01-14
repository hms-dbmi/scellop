/**
 * Heatmap cell calculation utilities
 * Used by both live visualization and export
 */

import type { ScaleBand as CustomScaleBand } from "../../contexts/types";
import type {
  CalculateHeatmapCellsParams,
  CalculateInlineBarsParams,
  HeatmapCellData,
} from "./types";

/**
 * Calculates heatmap cell data for rendering
 * This is the single source of truth for cell positioning and coloring
 */
export function calculateHeatmapCells(
  params: CalculateHeatmapCellsParams,
): HeatmapCellData[] {
  const {
    rows,
    columns,
    dataMap,
    xScale,
    yScale,
    colorScale,
    backgroundColor,
    selectedValues,
    xScroll = 0,
    yScroll = 0,
  } = params;

  const cells: HeatmapCellData[] = [];
  const cellWidth = Math.ceil(xScale.bandwidth());

  for (const row of rows) {
    // Skip rows that are expanded (showing inline bars)
    if (selectedValues?.has(row)) {
      continue;
    }

    const cellHeight = Math.ceil(
      (yScale as CustomScaleBand<string>).bandwidth(row),
    );
    const y = yScale(row);
    if (y === undefined) continue;

    for (const column of columns) {
      const key = `${row}-${column}`;
      const value = dataMap[key as keyof typeof dataMap] || 0;
      const x = xScale(column);
      if (x === undefined) continue;

      cells.push({
        row,
        column,
        value,
        x: x - xScroll,
        y: y - yScroll,
        width: cellWidth,
        height: cellHeight,
        color: value !== 0 ? colorScale(value) : backgroundColor,
      });
    }
  }

  return cells;
}

/**
 * Calculates inline bar chart data for expanded rows/columns in the heatmap
 * This is the single source of truth for inline bar positioning and sizing
 */
export function calculateInlineBars(
  params: CalculateInlineBarsParams,
): HeatmapCellData[] {
  const {
    rows,
    columns,
    dataMap,
    rowMaxes,
    xScale,
    yScale,
    selectedValues,
    normalization,
    columnColors,
    defaultColor,
    backgroundColor,
    xScroll = 0,
    yScroll = 0,
  } = params;

  const cells: HeatmapCellData[] = [];
  const cellWidth = Math.ceil(xScale.bandwidth());

  for (const row of rows) {
    if (!selectedValues.has(row)) {
      continue;
    }

    const cellHeight = Math.ceil(
      (yScale as CustomScaleBand<string>).bandwidth(row),
    );
    const yBackground = yScale(row);
    if (yBackground === undefined) continue;

    const max =
      normalization === "Log" ? Math.log(rowMaxes[row] + 1) : rowMaxes[row];
    const domain =
      normalization === "None" || normalization === "Log" ? [0, max] : [0, 1];

    // Create inline scale for bar height
    const maxBarHeight = cellHeight;
    const inlineScale = (value: number) =>
      ((value - domain[0]) / (domain[1] - domain[0])) * maxBarHeight;

    for (const column of columns) {
      const key = `${row}-${column}`;
      const value = dataMap[key as keyof typeof dataMap] || 0;
      const x = xScale(column);
      if (x === undefined) continue;

      const barHeight = inlineScale(value);
      const yBar = yBackground + cellHeight - barHeight;

      // Add background cell
      cells.push({
        row,
        column,
        value: 0,
        x: x - xScroll,
        y: yBackground - yScroll,
        width: cellWidth,
        height: cellHeight,
        color: backgroundColor,
      });

      // Add bar on top
      if (barHeight > 0) {
        cells.push({
          row,
          column,
          value,
          x: x - xScroll,
          y: yBar - yScroll,
          width: cellWidth,
          height: barHeight,
          color: columnColors?.[column] || defaultColor,
        });
      }
    }
  }

  return cells;
}

/**
 * Helper function to get cell bandwidth from a scale
 * Handles both standard ScaleBand and custom ScaleBand with per-item bandwidth
 */
export function getCellBandwidth<T extends string>(
  scale: Parameters<typeof calculateHeatmapCells>[0]["xScale"],
  key?: T,
): number {
  if (typeof scale.bandwidth === "function") {
    return (scale.bandwidth as (item?: T) => number)(key);
  }
  return scale.bandwidth;
}
