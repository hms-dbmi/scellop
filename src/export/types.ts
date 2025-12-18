import { ScaleBand } from "d3";

/**
 * Common types for export rendering
 */

export interface HeatmapCellData {
  row: string;
  column: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface BarSegmentData {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  color: string;
  stackValue?: string;
}

export interface BarData {
  key: string;
  totalValue: number;
  segments: BarSegmentData[];
  backgroundX: number;
  backgroundY: number;
  backgroundWidth: number;
  backgroundHeight: number;
}

export interface ViolinPathData {
  key: string;
  path: string;
  x: number;
  y: number;
  color: string;
}

export interface RenderingScales {
  xScale: ScaleBand<string>;
  yScale: ScaleBand<string>;
  xScroll?: number;
  yScroll?: number;
}

export interface CanvasRenderingContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  backgroundColor: string;
}
