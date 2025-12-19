/**
 * Shared types for visualization calculations
 */

import { ScaleBand } from "d3";
import { ScaleBand as CustomScaleBand } from "../../contexts/types";

/**
 * Union type for scale types used throughout the application
 */
export type AnyScaleBand<T extends string> = ScaleBand<T> | CustomScaleBand<T>;

/**
 * Data representing a single heatmap cell with position and color
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

/**
 * Segment of a stacked bar chart
 */
export interface BarSegment {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  value: number;
  key: string;
}

/**
 * Complete bar chart data including background and segments
 */
export interface BarData {
  key: string;
  totalValue: number;
  backgroundX: number;
  backgroundY: number;
  backgroundWidth: number;
  backgroundHeight: number;
  segments: BarSegment[];
}

/**
 * Violin plot path data with positioning
 */
export interface ViolinPathData {
  key: string;
  path: string;
  x: number;
  y: number;
  color: string;
}

/**
 * Parameters for calculating heatmap cells
 */
export interface CalculateHeatmapCellsParams {
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  xScale: AnyScaleBand<string>;
  yScale: AnyScaleBand<string>;
  colorScale: (value: number) => string;
  backgroundColor: string;
  selectedValues?: Set<string>;
  xScroll?: number;
  yScroll?: number;
}

/**
 * Parameters for calculating inline bar charts
 */
export interface CalculateInlineBarsParams {
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  rowMaxes: Record<string, number>;
  xScale: AnyScaleBand<string>;
  yScale: AnyScaleBand<string>;
  selectedValues: Set<string>;
  normalization: string;
  columnColors?: Record<string, string>;
  defaultColor: string;
  backgroundColor: string;
  xScroll?: number;
  yScroll?: number;
}

/**
 * Parameters for calculating bar charts
 */
export interface CalculateBarsParams {
  orientation: "rows" | "columns";
  counts: Record<string, number>;
  orderedValues: string[];
  removedValues: Set<string>;
  categoricalScale: AnyScaleBand<string>;
  domainLimit: number;
  graphType: string;
  normalization: string;
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
}

/**
 * Parameters for calculating violin plots
 */
export interface CalculateViolinsParams {
  orientation: "rows" | "columns";
  orderedValues: string[];
  removedValues: Set<string>;
  categoricalScale: AnyScaleBand<string>;
  domainLimit: number;
  tickLabelSize: number;
  rows: string[];
  columns: string[];
  fractionDataMap: Record<string, number>;
  color: string;
  selectedValues?: Set<string>;
}
