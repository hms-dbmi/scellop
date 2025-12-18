/**
 * Export utilities for high-quality PNG and SVG visualization exports
 */

export { renderHeatmapHighRes } from "./canvas-export";
export type { HighResHeatmapParams } from "./canvas-export";

export { renderMultiPanelToCanvas } from "./multi-panel-export";
export type { MultiPanelExportParams } from "./multi-panel-export";

export { exportAsSvg, getSvgMarkup } from "./svg-export";
export type { SvgExportConfig } from "./svg-export";

export { SvgNumericAxis } from "./SvgAxis";
export { SvgBars } from "./SvgBars";
export { SvgHeatmap } from "./SvgHeatmap";
export { SvgLegend } from "./SvgLegend";
export { SvgViolins } from "./SvgViolins";

export {
  calculateHeatmapCells,
  calculateInlineBars,
  renderBarsToCanvas,
  renderHeatmapToCanvas,
  renderViolinsToCanvas,
} from "./rendering-utils";

export { calculateBars } from "./side-graph-utils";

export {
  calculateNumericAxisTicks,
  renderCategoricalAxisToCanvas,
  renderNumericAxisToCanvas,
} from "./axis-utils";
export type { CategoricalAxisParams, NumericAxisParams } from "./axis-utils";

export {
  calculateLegendDimensions,
  renderLegendToCanvas,
} from "./legend-utils";
export type { LegendParams } from "./legend-utils";

export type {
  BarData,
  BarSegmentData,
  CanvasRenderingContext,
  HeatmapCellData,
  RenderingScales,
  ViolinPathData,
} from "./types";
