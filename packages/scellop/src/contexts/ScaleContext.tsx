import { scaleBand } from "@visx/scale";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useYScaleCreator } from "../hooks/useYScaleCreator";
import { createContext, useContext } from "../utils/context";
import { useColumnZoomed, useRowZoomed } from "./AxisConfigContext";
import { useColumns, useRows } from "./DataContext";
import { useHeatmapDimensions } from "./DimensionsContext";
import { useSelectedValues } from "./ExpandedValuesContext";
import type { ScaleBand } from "./types";

const SCALES = ["X", "Y"] as const;

interface DimensionScaleContext {
  scale: ScaleBand<string>;
  tickLabelSize: number;
  setTickLabelSize: (size: number) => void;
  nonExpandedSize: number;
  expandedSize: number;
  scroll: number;
  setScroll: (scroll: number | ((prev: number) => number)) => void;
  resetScroll: () => void;
  isZoomed: boolean;
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

  const expandedRows = useSelectedValues((s) => s.selectedValues);
  const rows = useRows();
  const columns = useColumns();

  const [rowsZoomed, rowZoomBandwidth] = useRowZoomed();
  const [colsZoomed, colZoomBandwidth] = useColumnZoomed();

  const [x, xExpanded, xCollapsed] = useMemo(() => {
    const scale = scaleBand<string>({
      range: [
        0,
        rowsZoomed && typeof rowZoomBandwidth === "number"
          ? rowZoomBandwidth * columns.length
          : width,
      ],
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
  }, [width, columns, rowsZoomed, rowZoomBandwidth]);

  const [y, expandedSize, collapsedSize] = useYScaleCreator(
    height,
    rows,
    expandedRows,
    colsZoomed,
    colZoomBandwidth,
  );

  const [xTickLabelSize, setXTickLabelSize] = useState(0);
  const [yTickLabelSize, setYTickLabelSize] = useState(0);

  // Scroll state for zoomed axes
  const [xScroll, setXScroll] = useState(0);
  const [yScroll, setYScroll] = useState(0);

  // Reset Y scroll when rows are expanded/collapsed while columns are zoomed
  // to ensure expanded rows remain visible
  useEffect(() => {
    if (colsZoomed && expandedRows.size > 0) {
      // When rows are expanded while zoomed, ensure scroll position allows visibility
      const maxScroll = Math.max(0, y.range()[0] - height);
      if (yScroll > maxScroll) {
        setYScroll(Math.max(0, maxScroll * 0.5)); // Scroll to middle range
      }
    }
  }, [colsZoomed, expandedRows.size, y, height, yScroll]);

  const xScaleContext = useMemo(
    () => ({
      scale: x,
      tickLabelSize: xTickLabelSize,
      setTickLabelSize: setXTickLabelSize,
      expandedSize: xExpanded,
      nonExpandedSize: xCollapsed,
      scroll: xScroll,
      setScroll: setXScroll,
      resetScroll: () => setXScroll(0),
      isZoomed: !!rowsZoomed,
    }),
    [x, xTickLabelSize, xExpanded, xCollapsed, xScroll, rowsZoomed],
  );
  const yScaleContext = useMemo(
    () => ({
      scale: y,
      selectedValues: expandedRows,
      tickLabelSize: yTickLabelSize,
      setTickLabelSize: setYTickLabelSize,
      expandedSize,
      nonExpandedSize: collapsedSize,
      scroll: yScroll,
      setScroll: setYScroll,
      resetScroll: () => setYScroll(0),
      isZoomed: !!colsZoomed,
    }),
    [
      y,
      expandedRows,
      yTickLabelSize,
      expandedSize,
      collapsedSize,
      yScroll,
      colsZoomed,
    ],
  );

  return (
    <XScaleContext.Provider value={xScaleContext}>
      <YScaleContext.Provider value={yScaleContext}>
        {children}
      </YScaleContext.Provider>
    </XScaleContext.Provider>
  );
}
