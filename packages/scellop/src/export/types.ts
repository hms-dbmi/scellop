import { ScaleBand } from "d3";

/**
 * Common types for export rendering
 *
 * Note: Core calculation types are now in src/utils/calculations/types.ts
 * This file re-exports them for backward compatibility.
 */

// Re-export calculation types
export type {
  BarData,
  BarSegment,
  HeatmapCellData,
  ViolinPathData,
} from "../utils/calculations/types";

// Legacy type aliases for backward compatibility
export type { BarSegment as BarSegmentData } from "../utils/calculations/types";
