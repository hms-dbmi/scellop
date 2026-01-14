/**
 * Common types for export rendering
 *
 * Note: Core calculation types are now in src/utils/calculations/types.ts
 * This file re-exports them for backward compatibility.
 */

// Re-export calculation types
// Legacy type aliases for backward compatibility
export type {
  BarData,
  BarSegment,
  BarSegment as BarSegmentData,
  HeatmapCellData,
  ViolinPathData,
} from "../utils/calculations/types";
