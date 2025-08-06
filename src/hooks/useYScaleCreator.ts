import { scaleBand } from "@visx/scale";
import { useMemo } from "react";
import { ScaleBand } from "../contexts/types";

// Add 8px between the expanded row and the next row
export const EXPANDED_ROW_PADDING = 8;

/**
 * Custom hook that creates a Y-scale for the heatmap with support for expanded rows.
 * Returns a tuple of [scale, expandedSize, collapsedSize].
 */
export function useYScaleCreator(
  height: number,
  rows: string[],
  expandedRows: Set<string>,
  colsZoomed?: boolean,
  colZoomBandwidth?: number,
): [ScaleBand<string>, number, number] {
  return useMemo(() => {
    // If columns are zoomed, use fixed bandwidth for each row
    const effectiveHeight =
      colsZoomed && typeof colZoomBandwidth === "number"
        ? colZoomBandwidth * rows.length
        : height;

    // Base case: use regular band scale
    if (
      // if no rows are selected/all rows are selected
      [0, rows.length].includes(expandedRows.size) ||
      // if there are very few rows
      rows.length < 5
    ) {
      const scale = scaleBand<string>({
        range: [effectiveHeight, 0],
        domain: [...rows].reverse(),
        padding: 0.01,
      }) as ScaleBand<string>;
      const expandedHeight = scale.bandwidth();
      const collapsedHeight = scale.bandwidth();
      scale.lookup = (num: number) => {
        const eachBand = scale.bandwidth();
        const index = Math.floor((effectiveHeight - num) / eachBand);
        return scale.domain()[index];
      };
      return [scale, expandedHeight, collapsedHeight];
    }

    // Otherwise, we need to adjust the scale to account for the expanded rows
    // First, we need to determine the height of the selected rows
    // When zoomed, give more space to expanded rows to ensure visibility
    const expansionRatio = colsZoomed ? 3 : 5; // Use smaller ratio when zoomed
    const expandedRowHeight =
      effectiveHeight / (expansionRatio + expandedRows.size);
    const totalExpandedHeight = expandedRows.size * expandedRowHeight;
    const totalCollapsedHeight = effectiveHeight - totalExpandedHeight;
    const numberOfUnselectedRows = rows.length - expandedRows.size;
    const collapsedRowHeight = colsZoomed
      ? Math.max(
          colZoomBandwidth! * 0.5,
          totalCollapsedHeight / numberOfUnselectedRows,
        )
      : totalCollapsedHeight / numberOfUnselectedRows;
    // Then, we need to split the domain up, keeping the order of the existing rows
    // and creating separate domains for each subsection
    const domains = rows
      .reduce(
        (acc, curr) => {
          // If the current value is one of the selected rows,
          // close the current domain and add a new one consisting of just the selected row
          if (expandedRows.has(curr)) {
            acc.push([curr]);
            // Add an empty domain to start the next section
            acc.push([]);
          } else {
            // Otherwise, add the current value to the current domain
            acc[acc.length - 1].push(curr);
          }
          return acc;
        },
        [[]] as string[][],
      )
      .filter((domain) => domain.length > 0)
      .reverse();
    // Calculate heights allotted to each domain
    const heights: number[] = [];
    for (const domain of domains) {
      if (expandedRows.has(domain[0])) {
        heights.push(expandedRowHeight);
      } else {
        const height = domain.length * collapsedRowHeight;
        heights.push(height);
      }
    }
    // Create the scales for each domain
    let cumulativeHeight = effectiveHeight;

    // When zoomed and rows are expanded, try to position expanded rows
    // in a more visible range by adjusting the starting position
    let startHeight = effectiveHeight;
    if (colsZoomed && expandedRows.size > 0) {
      // Position content to be more centered in the virtual space
      // This helps ensure expanded rows are more likely to be visible
      const totalContentHeight = heights.reduce((sum, h) => sum + h, 0);
      const padding = Math.max(0, (effectiveHeight - totalContentHeight) * 0.3);
      startHeight = effectiveHeight - padding;
    }

    cumulativeHeight = startHeight;
    const scales = domains
      .map((domain, index) => {
        const domainHeight = heights[index];
        const initialHeight = cumulativeHeight;
        cumulativeHeight -= domainHeight;
        const isExpanded = domain.some((row) => expandedRows.has(row));
        const rangeTop =
          cumulativeHeight + (isExpanded ? EXPANDED_ROW_PADDING : 0);
        const rangeBottom =
          initialHeight - (isExpanded ? EXPANDED_ROW_PADDING : 0);
        return scaleBand<string>({
          range: [rangeTop, rangeBottom],
          domain,
          padding: 0.01,
        });
      })
      .reverse();
    // Create a custom scale that uses the correct scale for each ordinal value
    const customScale = (value: string) => {
      for (const scale of scales) {
        if (scale.domain().includes(value)) {
          return scale(value);
        }
      }
      return 0;
    };
    customScale.bandwidth = () => collapsedRowHeight;
    customScale.bandwidth = (item?: string) => {
      if (item === undefined) {
        return collapsedRowHeight;
      } else {
        for (const scale of scales) {
          if (scale.domain().includes(item)) {
            return scale.bandwidth();
          }
        }
        return collapsedRowHeight;
      }
    };
    customScale.domain = (newDomain?: string[]) =>
      newDomain ? customScale : rows;
    customScale.range = (newRange?: [number, number]) =>
      newRange ? customScale : ([startHeight, 0] as [number, number]);
    customScale.rangeRound = (newRange?: [number, number]) =>
      newRange ? customScale : [startHeight, 0];
    customScale.round = (arg?: boolean) => {
      if (arg === undefined) {
        return false;
      }
      scales.forEach((scale) => scale.round(arg));
      return customScale;
    };
    customScale.padding = (arg?: number) => {
      if (arg === undefined) {
        return 0.01;
      }
      scales.forEach((scale) => scale.padding(arg));
      return customScale;
    };
    customScale.paddingInner = (arg?: number) => {
      if (arg === undefined) {
        return 0.01;
      }
      scales.forEach((scale) => scale.paddingInner(arg));
      return customScale;
    };
    customScale.paddingOuter = (arg?: number) => {
      if (arg === undefined) {
        return 0.0;
      }
      scales.forEach((scale) => scale.paddingOuter(arg));
      return customScale;
    };
    customScale.align = (arg?: number) => {
      if (arg === undefined) {
        return 0.5 as number;
      }
      scales.forEach((scale) => scale.align(arg));
      return customScale as ScaleBand<string>;
    };
    customScale.copy = () => customScale;
    customScale.step = () => collapsedRowHeight;
    customScale.lookup = (num: number) => {
      for (const scale of scales) {
        const [bottom, top] = scale.range();
        if (num >= bottom && num <= top) {
          const eachBand = scale.bandwidth();
          const diff = num - bottom;

          const index = Math.floor(diff / eachBand);
          return scale.domain()[index];
        }
      }
      return "";
    };
    return [
      customScale as ScaleBand<string>,
      expandedRowHeight,
      collapsedRowHeight,
    ];
  }, [height, rows, expandedRows.size, colsZoomed, colZoomBandwidth]);
}
