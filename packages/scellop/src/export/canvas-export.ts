import type { ScaleBand } from "d3";
import type { ScaleBand as CustomScaleBand } from "../contexts/types";
import {
  calculateHeatmapCells,
  calculateInlineBars,
  renderHeatmapToCanvas,
} from "./rendering-utils";

/**
 * Parameters for rendering heatmap to high-resolution Canvas
 */
export interface HighResHeatmapParams {
  canvas: HTMLCanvasElement;
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  rowMaxes: Record<string, number>;
  xScale: ScaleBand<string> | CustomScaleBand<string>;
  yScale: ScaleBand<string> | CustomScaleBand<string>;
  colorScale: (value: number) => string;
  strokeColor?: string;
  selectedValues?: Set<string>;
  normalization: string;
  columnColors?: Record<string, string>;
  defaultColor: string;
  backgroundColor: string;
  width: number;
  height: number;
  resolution: number;
}

/**
 * Renders heatmap to a high-resolution Canvas for export
 * This function replicates the rendering logic from Heatmap.tsx but at arbitrary resolution
 */
export function renderHeatmapHighRes(params: HighResHeatmapParams): void {
  const {
    canvas,
    rows,
    columns,
    dataMap,
    rowMaxes,
    xScale,
    yScale,
    colorScale,
    strokeColor,
    selectedValues = new Set(),
    normalization,
    columnColors,
    defaultColor,
    backgroundColor,
    width,
    height,
    resolution,
  } = params;

  // Set canvas size to high resolution
  canvas.width = width * resolution;
  canvas.height = height * resolution;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context from canvas");
  }

  // Scale the context to match resolution
  ctx.scale(resolution, resolution);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Render regular heatmap cells
  const cells = calculateHeatmapCells({
    rows,
    columns,
    dataMap,
    xScale,
    yScale,
    colorScale,
    backgroundColor,
    selectedValues,
  });

  renderHeatmapToCanvas(ctx, cells, {
    strokeColor,
    drawStroke: !!strokeColor,
  });

  // Render inline bars for expanded rows
  if (selectedValues.size > 0) {
    const inlineBars = calculateInlineBars({
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
    });

    renderHeatmapToCanvas(ctx, inlineBars, { drawStroke: false });
  }
}
