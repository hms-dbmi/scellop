import { scaleBand, scaleLinear, StringLike } from "@visx/scale";
import React, { PropsWithChildren, useMemo } from "react";
import { useSet } from "../hooks/useSet";
import { createContext, useContext } from "../utils/context";
import { useColumns, useRows } from "./DataContext";
import { useHeatmapDimensions } from "./DimensionsContext";
import { useSelectedValues } from "./ExpandedValuesContext";

const SCALES = ["X", "Y"] as const;

export type ScaleLinear<T> = ReturnType<typeof scaleLinear<T>>;
export type ScaleBand<T extends StringLike> = ReturnType<
  typeof scaleBand<T>
> & {
  lookup: (num: number) => string;
  bandwidth: (item?: string) => number;
};

interface DimensionScaleContext {
  scale: ScaleBand<string>;
  tickLabelSize: number;
  setTickLabelSize: (size: number) => void;
  nonExpandedSize: number;
  expandedSize: number;
}
const [XScaleContext, YScaleContext] = SCALES.map((dimension: string) => {
  return createContext<DimensionScaleContext>(`${dimension}ScaleContext`);
});
export const useXScale = () => useContext(XScaleContext);
export const useYScale = () => useContext(YScaleContext);

// Add 8px between the expanded row and the next row
export const EXPANDED_ROW_PADDING = 8;

/**
 * Provider which instantiates and manages the scales used for the heatmap.
 */
export function ScaleProvider({ children }: PropsWithChildren) {
  const { width, height } = useHeatmapDimensions();
  const { set: selectedX, toggle: toggleX, reset: resetX } = useSet<string>();

  const expandedRows = useSelectedValues((s) => s.selectedValues);
  const rows = useRows();
  const columns = useColumns();

  const [x, xExpanded, xCollapsed] = useMemo(() => {
    const scale = scaleBand<string>({
      range: [0, width],
      domain: columns,
      padding: 0,
    }) as ScaleBand<string>;
    const expandedSize = scale.bandwidth();
    const collapsedSize = scale.bandwidth();
    scale.lookup = (num: number) => {
      const eachBand = scale.bandwidth();
      const index = Math.floor(num / eachBand);
      return scale.domain()[index];
    };
    return [scale, expandedSize, collapsedSize];
  }, [width, columns]);

  // TODO: The custom axis logic should ideally be moved to a separate file
  const [y, expandedSize, collapsedSize] = useMemo(() => {
    // Base case: use regular band scale
    if (
      // if no rows are selected/all rows are selected
      [0, rows.length].includes(expandedRows.size) ||
      // if there are very few rows
      rows.length < 5
    ) {
      const scale = scaleBand<string>({
        range: [height, 0],
        domain: [...rows].reverse(),
        padding: 0.01,
      }) as ScaleBand<string>;
      const expandedHeight = scale.bandwidth();
      const collapsedHeight = scale.bandwidth();
      scale.lookup = (num: number) => {
        const eachBand = scale.bandwidth();
        const index = Math.floor((height - num) / eachBand);
        return scale.domain()[index];
      };
      return [scale, expandedHeight, collapsedHeight];
    }

    // Otherwise, we need to adjust the scale to account for the expanded rows
    // First, we need to determine the height of the selected rows
    const expandedRowHeight = height / (2 + expandedRows.size);
    const totalExpandedHeight = expandedRows.size * expandedRowHeight;
    const totalCollapsedHeight = height - totalExpandedHeight;
    const numberOfUnselectedRows = rows.length - expandedRows.size;
    const collapsedRowHeight = totalCollapsedHeight / numberOfUnselectedRows;
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
    let cumulativeHeight = height;
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
      newRange ? customScale : ([height, 0] as [number, number]);
    customScale.rangeRound = (newRange?: [number, number]) =>
      newRange ? customScale : [height, 0];
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
  }, [height, rows, expandedRows.size]);

  const [xTickLabelSize, setXTickLabelSize] = React.useState(0);
  const [yTickLabelSize, setYTickLabelSize] = React.useState(0);

  const xScaleContext = useMemo(
    () => ({
      scale: x,
      tickLabelSize: xTickLabelSize,
      setTickLabelSize: setXTickLabelSize,
      expandedSize: xExpanded,
      nonExpandedSize: xCollapsed,
    }),
    [x, selectedX, toggleX, xTickLabelSize, resetX, xExpanded, xCollapsed],
  );
  const yScaleContext = useMemo(
    () => ({
      scale: y,
      selectedValues: expandedRows,
      tickLabelSize: yTickLabelSize,
      setTickLabelSize: setYTickLabelSize,
      expandedSize,
      nonExpandedSize: collapsedSize,
    }),
    [y, expandedRows, yTickLabelSize, expandedSize, collapsedSize],
  );

  return (
    <XScaleContext.Provider value={xScaleContext}>
      <YScaleContext.Provider value={yScaleContext}>
        {children}
      </YScaleContext.Provider>
    </XScaleContext.Provider>
  );
}
