import { mean, type ScaleLinear } from "d3";
import { useMemo } from "react";

// Kernel Density Estimation
export function kde<T extends number>(
  kernel: (input: number) => number,
  thresholds: number[],
) {
  return (V: Iterable<T>) =>
    thresholds.map((t) => [t, mean(V, (d: T) => kernel(t - d))]);
}

// Epanechnikov kernel
export function epanechnikov(bandwidth: number) {
  return (x: number) => {
    const normalized = x / bandwidth;
    return Math.abs(normalized) <= 1
      ? (0.75 * (1 - normalized * normalized)) / bandwidth
      : 0;
  };
}

export function useDensityFunction(
  scale: ScaleLinear<number, number>,
  bandwidth: number,
  ticks: number,
) {
  return useMemo(
    () => kde(epanechnikov(bandwidth), scale.ticks(ticks)),
    [bandwidth, scale, ticks],
  );
}
