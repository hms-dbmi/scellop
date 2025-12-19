import { scaleBand, scaleLinear } from "@visx/scale";
import { area } from "@visx/shape";
import { curveNatural, ScaleBand } from "d3";
import { ScaleBand as CustomScaleBand } from "../contexts/types";
import { getColorForValue } from "../utils/categorical-colors";
import { BarData, ViolinPathData } from "./types";

// Re-export calculation functions from shared utilities
export { calculateBars } from "../utils/calculations/bars";
export { calculateViolins } from "../utils/calculations/violins";

// Note: The implementations have been moved to src/utils/calculations/
// This file now just re-exports them for backward compatibility
