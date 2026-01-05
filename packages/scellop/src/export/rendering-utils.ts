// Re-export calculation functions from shared utilities
export {
  calculateHeatmapCells,
  calculateInlineBars,
} from "../utils/calculations/heatmap-cells";

// Re-export rendering functions from shared utilities
export {
  renderBarsToCanvas,
  renderCellsToCanvas as renderHeatmapToCanvas,
  renderViolinsToCanvas,
} from "../utils/rendering/canvas-utils";

/**
 * Shared rendering utilities for both Canvas and SVG export
 *
 * Note: Most functionality has been moved to shared modules:
 * - Calculations: src/utils/calculations/
 * - Canvas rendering: src/utils/rendering/canvas-utils.ts
 *
 * This file now primarily re-exports for backward compatibility.
 */
