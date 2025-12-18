import { ScaleBand } from "d3";
import { ScaleBand as CustomScaleBand } from "../contexts/types";
import { BarData, HeatmapCellData } from "./types";

/**
 * Shared rendering utilities for both Canvas and SVG export
 */

/**
 * Calculates heatmap cell data for rendering
 */
export function calculateHeatmapCells(params: {
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  xScale: ScaleBand<string> | CustomScaleBand<string>;
  yScale: ScaleBand<string> | CustomScaleBand<string>;
  colorScale: (value: number) => string;
  backgroundColor: string;
  selectedValues?: Set<string>;
  xScroll?: number;
  yScroll?: number;
}): HeatmapCellData[] {
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
 */
export function calculateInlineBars(params: {
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  rowMaxes: Record<string, number>;
  xScale: ScaleBand<string> | CustomScaleBand<string>;
  yScale: ScaleBand<string> | CustomScaleBand<string>;
  selectedValues: Set<string>;
  normalization: string;
  columnColors?: Record<string, string>;
  defaultColor: string;
  backgroundColor: string;
  xScroll?: number;
  yScroll?: number;
}): HeatmapCellData[] {
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
 * Render heatmap cells to Canvas context
 */
export function renderHeatmapToCanvas(
  ctx: CanvasRenderingContext2D,
  cells: HeatmapCellData[],
  strokeColor?: string,
) {
  for (const cell of cells) {
    ctx.fillStyle = cell.color;
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    }
    ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
  }
}

/**
 * Render bar chart to Canvas context
 */
export function renderBarsToCanvas(
  ctx: CanvasRenderingContext2D,
  bars: BarData[],
  backgroundColor: string,
  drawStripes: boolean = true,
) {
  for (const bar of bars) {
    // Draw background stripe
    if (drawStripes) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(
        bar.backgroundX,
        bar.backgroundY,
        bar.backgroundWidth,
        bar.backgroundHeight,
      );
    }

    // Draw segments
    for (const segment of bar.segments) {
      ctx.fillStyle = segment.color;
      ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
    }
  }
}

/**
 * Render violin plots to Canvas context
 */
export function renderViolinsToCanvas(
  ctx: CanvasRenderingContext2D,
  violins: Array<{ path: string; x: number; y: number; color: string }>,
) {
  for (const violin of violins) {
    const path = new Path2D(violin.path);
    ctx.save();
    ctx.translate(violin.x, violin.y);
    ctx.fillStyle = violin.color;
    ctx.fill(path);
    ctx.strokeStyle = violin.color;
    ctx.stroke(path);
    ctx.restore();
  }
}
