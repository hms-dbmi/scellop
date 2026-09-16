/**
 * Export utilities for high-quality PNG and SVG visualization exports
 */

export type { CategoricalAxisParams, NumericAxisParams } from "./axis-utils";
export {
  calculateNumericAxisTicks,
  renderCategoricalAxisToCanvas,
  renderNumericAxisToCanvas,
} from "./axis-utils";
export type { HighResHeatmapParams } from "./canvas-export";
export { renderHeatmapHighRes } from "./canvas-export";
export type { LegendParams } from "./legend-utils";
export {
  calculateLegendDimensions,
  renderLegendToCanvas,
} from "./legend-utils";
export type { MultiPanelExportParams } from "./multi-panel-export";
export { renderMultiPanelToCanvas } from "./multi-panel-export";
export {
  calculateHeatmapCells,
  calculateInlineBars,
  renderBarsToCanvas,
  renderHeatmapToCanvas,
  renderViolinsToCanvas,
} from "./rendering-utils";
export { SvgNumericAxis } from "./SvgAxis";
export { SvgBars } from "./SvgBars";
export {
  calculateCategoricalColorLegendDimensions,
  SvgCategoricalColorLegend,
} from "./SvgCategoricalColorLegend";
export {
  calculateCategoricalLegendsPanelDimensions,
  SvgCategoricalLegendsPanel,
} from "./SvgCategoricalLegendsPanel";
export { SvgHeatmap } from "./SvgHeatmap";
export { SvgLegend } from "./SvgLegend";
export { SvgViolins } from "./SvgViolins";
export { calculateBars } from "./side-graph-utils";
export type {
  SvgCategoricalLegendsPanelConfig,
  SvgExportConfig,
} from "./svg-export";
export {
  exportAsSvg,
  exportCategoricalLegendsAsSvg,
  getCategoricalLegendsPanelMarkup,
  getSvgMarkup,
} from "./svg-export";

export type {
  BarData,
  BarSegmentData,
  HeatmapCellData,
  ViolinPathData,
} from "./types";
