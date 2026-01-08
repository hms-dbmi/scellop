import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { scaleLinear } from "@visx/scale";
import type { ScaleBand } from "d3";
import type React from "react";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useColorScale } from "../../contexts/ColorScaleContext";
import {
  useColumnCounts,
  useColumnMaxes,
  useData,
  useFractionDataMap,
  useRowCounts,
  useRowMaxes,
} from "../../contexts/DataContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import {
  useLeftGraphType,
  useTopGraphType,
} from "../../contexts/IndividualGraphTypeContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import { useBarsDragHandler } from "../../hooks/useDragHandler";
import { EXPANDED_ROW_PADDING } from "../../hooks/useYScaleCreator";
import { calculateBars } from "../../utils/calculations";
import { renderBarsToCanvas } from "../../utils/rendering";
import ExpandedAxes from "./ExpandedAxes";

interface BarsProps {
  orientation: "rows" | "columns";
  categoricalScale: ScaleBand<string>;
  domainLimit: number;
  selectedValues?: Set<string>;
  width: number;
  height: number;
}

function useCurrentCounts(orientation: string) {
  const rowCounts = useRowCounts();
  const columnCounts = useColumnCounts();
  return orientation === "columns" ? columnCounts : rowCounts;
}

function useCurrentMetadata(orientation: string) {
  return useData((s) =>
    orientation === "columns" ? s.data.metadata.cols : s.data.metadata.rows,
  );
}

function useCurrentLabel(orientation: string) {
  const columnLabel = useColumnConfig((store) => store.label);
  const rowLabel = useRowConfig((store) => store.label);
  return orientation === "columns" ? columnLabel : rowLabel;
}

function useCurrentValues(orientation: string) {
  const rows = useData((s) => s.rowOrder);
  const columns = useData((s) => s.columnOrder);
  return orientation === "columns" ? columns : rows;
}

function useCurrentMaxes(orientation: string) {
  const rowMaxes = useRowMaxes();
  const columnMaxes = useColumnMaxes();
  return orientation === "columns" ? columnMaxes : rowMaxes;
}

function useExpandedSize(orientation: string) {
  const yScale = useYScale();
  const xScale = useXScale();
  return orientation === "columns" ? xScale.expandedSize : yScale.expandedSize;
}

export default function Bars({
  orientation,
  categoricalScale,
  domainLimit,
  width,
  height,
}: BarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = useCurrentCounts(orientation);
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const theme = useTheme();
  const metadata = useCurrentMetadata(orientation);
  const { openTooltip, closeTooltip } = useSetTooltipData();
  const label = useCurrentLabel(orientation);
  const orderedValues = useCurrentValues(orientation);
  const maxes = useCurrentMaxes(orientation);
  const expandedSize = useExpandedSize(orientation);
  const { setRowOrder, setColumnOrder } = useData();
  const normalization = useNormalization((s) => s.normalization);
  const colorScale = useColorScale();
  const leftGraphType = useLeftGraphType();
  const topGraphType = useTopGraphType();

  // Use the appropriate graph type based on orientation
  const currentGraphType =
    orientation === "rows" ? leftGraphType : topGraphType;

  // Get axis configurations for colors
  const rowConfig = useRowConfig();
  const columnConfig = useColumnConfig();
  const axisConfig = orientation === "rows" ? rowConfig : columnConfig;

  // Get data for stacked bars - always use raw counts regardless of normalization
  const rawDataMap = useFractionDataMap("None"); // Always use raw counts for stacked bars
  const normalizedDataMap = useFractionDataMap(normalization); // For color scaling when needed

  // Get the opposite dimension values for stacking
  const stackValues = useData((s) =>
    orientation === "columns" ? s.rowOrder : s.columnOrder,
  );
  const removedStackValues = useData((s) =>
    orientation === "columns" ? s.removedRows : s.removedColumns,
  );

  // Get the appropriate scale context based on orientation
  const xScale = useXScale();
  const yScale = useYScale();
  const scaleContext = orientation === "columns" ? xScale : yScale;

  // Handle drag and drop reordering
  const handleReorder = useCallback(
    (draggedValue: string, targetValue: string) => {
      if (draggedValue === targetValue) return;

      if (orientation === "columns") {
        // Reordering columns
        const newColumnOrder = [...orderedValues];
        const draggedIndex = newColumnOrder.indexOf(draggedValue);
        const targetIndex = newColumnOrder.indexOf(targetValue);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = newColumnOrder.splice(draggedIndex, 1);
          newColumnOrder.splice(targetIndex, 0, removed);
          setColumnOrder(newColumnOrder);
        }
      } else {
        // Reordering rows
        const newRowOrder = [...orderedValues];
        const draggedIndex = newRowOrder.indexOf(draggedValue);
        const targetIndex = newRowOrder.indexOf(targetValue);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = newRowOrder.splice(draggedIndex, 1);
          newRowOrder.splice(targetIndex, 0, removed);
          setRowOrder(newRowOrder);
        }
      }
    },
    [orientation, orderedValues, setColumnOrder, setRowOrder],
  );

  // Set up drag handling - use the scale from context to ensure lookup method is available
  const { isDragging, draggedValue } = useBarsDragHandler({
    canvasRef,
    scale: scaleContext.scale,
    orientation,
    onReorder: handleReorder, // Final reordering on drop (fallback)
    onDragMove: handleReorder, // Real-time reordering during drag
    scrollOffset: scaleContext.scroll,
    isZoomed: scaleContext.isZoomed,
  });

  const removedRows = useData((s) => s.removedRows);
  const removedColumns = useData((s) => s.removedColumns);

  const bars = useMemo(() => {
    return calculateBars({
      orientation,
      counts: data,
      orderedValues,
      removedValues: orientation === "columns" ? removedColumns : removedRows,
      categoricalScale,
      domainLimit,
      graphType: currentGraphType,
      normalization,
      stackValues,
      removedStackValues,
      rawDataMap,
      normalizedDataMap,
      colorScale,
      axisColors: axisConfig.colors,
      oppositeAxisColors:
        orientation === "columns" ? rowConfig.colors : columnConfig.colors,
      defaultColor: theme.palette.text.primary,
      selectedValues,
    });
  }, [
    orientation,
    data,
    orderedValues,
    removedRows,
    removedColumns,
    categoricalScale,
    domainLimit,
    currentGraphType,
    normalization,
    stackValues,
    removedStackValues,
    rawDataMap,
    normalizedDataMap,
    colorScale,
    axisConfig.colors,
    rowConfig.colors,
    columnConfig.colors,
    theme.palette.text.primary,
    selectedValues,
  ]);

  // Create axes for expanded values
  const expandedAxes = useMemo(() => {
    if (orientation !== "rows" || selectedValues.size === 0) {
      return [];
    }

    return Array.from(selectedValues)
      .map((key) => {
        const max =
          normalization === "Log" ? Math.log(maxes[key] + 1) : maxes[key];
        const scaledPosition = categoricalScale(key);
        const bandwidth = categoricalScale.bandwidth();

        if (scaledPosition == null || bandwidth == null) return null;

        const isPercentNormalized =
          normalization === "Row" || normalization === "Column";
        const domain = isPercentNormalized ? [1, 0] : [max, 0];
        const range = [0, expandedSize - EXPANDED_ROW_PADDING * 3];

        const axisScale = scaleLinear({
          domain,
          range,
          nice: true,
        });

        return {
          key,
          scale: axisScale,
          position: scaledPosition,
          bandwidth,
          max,
          normalizationIsNotNone: isPercentNormalized,
        };
      })
      .filter((axis) => axis !== null);
  }, [
    orientation,
    selectedValues,
    maxes,
    categoricalScale,
    expandedSize,
    normalization,
  ]);

  useLayoutEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Save the current transformation matrix
    ctx.save();

    // Apply scroll offset for zoomed axes
    if (scaleContext.isZoomed) {
      if (orientation === "columns") {
        ctx.translate(-scaleContext.scroll, 0);
      } else {
        ctx.translate(0, -scaleContext.scroll);
      }
    }

    // Clear canvas with scroll offset
    const clearX =
      scaleContext.isZoomed && orientation === "columns"
        ? scaleContext.scroll
        : 0;
    const clearY =
      scaleContext.isZoomed && orientation === "rows" ? scaleContext.scroll : 0;
    ctx.clearRect(clearX, clearY, width, height);

    // Draw bars using shared rendering function
    renderBarsToCanvas(ctx, bars, {
      drawBackground: true,
      orderedValues,
      stripeEvenColor: theme.palette.action.hover,
      stripeOddColor: theme.palette.background.default,
      highlightedKey: isDragging && draggedValue ? draggedValue : undefined,
      highlightColor: theme.palette.primary.main,
      strokeColor: theme.palette.background.default,
      strokeWidth: 1,
    });

    // Restore the transformation matrix
    ctx.restore();
  }, [
    bars,
    width,
    height,
    theme,
    orderedValues,
    isDragging,
    draggedValue,
    scaleContext.isZoomed,
    scaleContext.scroll,
    orientation,
  ]);

  // Hit detection for tooltips
  const handleMouseMove = useEventCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      // Don't show tooltip while dragging
      if (isDragging) {
        closeTooltip();
        return;
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      // Adjust for scroll offset
      if (scaleContext.isZoomed) {
        if (orientation === "columns") {
          x += scaleContext.scroll;
        } else {
          y += scaleContext.scroll;
        }
      }

      // Find which bar was hit (check background area first, then actual bar)
      const hitBar = bars.find((bar) => {
        return (
          x >= bar.backgroundX &&
          x <= bar.backgroundX + bar.backgroundWidth &&
          y >= bar.backgroundY &&
          y <= bar.backgroundY + bar.backgroundHeight
        );
      });

      if (hitBar) {
        const metadataValues = metadata?.[hitBar.key];

        // Find which segment was hit for more detailed tooltip
        let hitSegment = null;
        for (const segment of hitBar.segments) {
          if (
            x >= segment.x &&
            x <= segment.x + segment.width &&
            y >= segment.y &&
            y <= segment.y + segment.height
          ) {
            hitSegment = segment;
            break;
          }
        }

        const tooltipData: Record<string, string | number | undefined> = {
          "Total Count": data[hitBar.key],
          [label]: hitBar.key,
          ...metadataValues,
        };

        if (
          hitSegment &&
          (currentGraphType === "Stacked Bars (Continuous)" ||
            currentGraphType === "Stacked Bars (Categorical)")
        ) {
          const segmentLabel = orientation === "columns" ? "Row" : "Column";
          tooltipData[`${segmentLabel} Value`] = hitSegment.key;
          tooltipData["Segment Count"] = hitSegment.value;
        }

        openTooltip(
          {
            title: hitBar.key,
            data: tooltipData,
          },
          e.clientX,
          e.clientY,
        );
      } else {
        closeTooltip();
      }
    },
  );

  const handleMouseLeave = useEventCallback(() => {
    closeTooltip();
  });

  // Handle wheel scrolling for zoomed axes
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!scaleContext.isZoomed) return;

      e.preventDefault();

      scaleContext.setScroll((prev: number) => {
        const maxScroll = Math.max(
          0,
          categoricalScale.range()[orientation === "rows" ? 0 : 1] -
            (orientation === "columns" ? width : height),
        );
        const delta = orientation === "columns" ? e.deltaX : e.deltaY;
        return Math.max(0, Math.min(maxScroll, prev + delta));
      });
    },
    [scaleContext, categoricalScale, orientation, width, height],
  );

  const style = useMemo(() => {
    if (orientation === "rows") {
      return {
        marginLeft: -1,
      };
    } else
      return {
        marginBottom: -4,
      };
  }, [orientation]);

  return (
    <div
      style={{ position: "relative", pointerEvents: "auto" }}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          ...style,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Render axes for expanded rows */}
      <ExpandedAxes
        expandedAxes={expandedAxes}
        orientation={orientation}
        width={width}
        height={height}
        scrollOffset={scaleContext.scroll}
        isZoomed={scaleContext.isZoomed}
        isDragging={isDragging}
        draggedValue={draggedValue}
      />
    </div>
  );
}
