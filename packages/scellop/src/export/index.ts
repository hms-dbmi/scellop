/**
 * Export utilities for high-quality PNG and SVG visualization exports
 */

export { renderHeatmapHighRes } from "./canvas-export";
export type { HighResHeatmapParams } from "./canvas-export";

export { renderMultiPanelToCanvas } from "./multi-panel-export";
export type { MultiPanelExportParams } from "./multi-panel-export";

export {
  exportAsSvg,
  exportCategoricalLegendsAsSvg,
  getCategoricalLegendsPanelMarkup,
  getSvgMarkup,
} from "./svg-export";
export type {
  SvgCategoricalLegendsPanelConfig,
  SvgExportConfig,
} from "./svg-export";

export {
  calculateCategoricalLegendsPanelDimensions,
  SvgCategoricalLegendsPanel,
} from "./SvgCategoricalLegendsPanel";

export { SvgNumericAxis } from "./SvgAxis";
export { SvgBars } from "./SvgBars";
export {
  calculateCategoricalColorLegendDimensions,
  SvgCategoricalColorLegend,
} from "./SvgCategoricalColorLegend";
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
  HeatmapCellData,
  ViolinPathData,
} from "./types";
