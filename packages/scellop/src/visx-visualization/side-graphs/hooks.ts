import { scaleLinear } from "@visx/scale";
import { useMemo } from "react";
import type { ScaleLinear } from "../../contexts/types";

/**
 * Generates a linear scale for the counts bars with the provided domain and range.
 * @param domain
 * @param range
 * @returns
 */
export function useCountsScale(
  domain: number[],
  range: number[],
): ScaleLinear<number> {
  return useMemo(() => {
    return scaleLinear<number>({
      domain,
      range,
      nice: true,
    });
  }, [domain, range]);
}
