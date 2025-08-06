import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { scaleLinear } from "@visx/scale";
import { ScaleBand, ScaleLinear } from "d3";
import React, { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import {
  useColumnCounts,
  useColumnMaxes,
  useData,
  useRowCounts,
  useRowMaxes,
} from "../../contexts/DataContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import { EXPANDED_ROW_PADDING } from "../../hooks/useYScaleCreator";
import { useBarsDragHandler } from "./BarsDragHandler";
import ExpandedAxes from "./ExpandedAxes";

interface BarsProps {
  orientation: "rows" | "columns";
  categoricalScale: ScaleBand<string>;
  numericalScale: ScaleLinear<number, number>;
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
  numericalScale,
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

  const bars = useMemo(() => {
    const entries = Object.entries(data);
    return entries
      .map(([key, value]) => {
        if (orientation === "rows" && selectedValues?.has(key)) {
          return null;
        }

        const scaledKey = categoricalScale(key);
        const scaledValue = numericalScale(value);
        const isVertical = orientation === "columns";
        // Use the actual bandwidth from the scale to match heatmap cells exactly
        const barSize = categoricalScale.bandwidth();

        const scaledPosition = scaledKey ?? 0;
        const barLength = scaledValue;
        const [rangeStart, rangeEnd] = numericalScale.range();

        // Bar dimensions and position
        const x = isVertical ? scaledPosition : domainLimit - scaledValue;
        const y = isVertical ? domainLimit - scaledValue : scaledPosition;
        const barWidth = isVertical ? barSize : barLength;
        const barHeight = isVertical ? barLength : barSize;

        // Background dimensions and position
        const backgroundX = isVertical ? x : domainLimit - rangeEnd;
        const backgroundY = isVertical ? domainLimit - rangeStart : y;
        const backgroundWidth = isVertical ? barSize : rangeEnd;
        const backgroundHeight = isVertical ? rangeStart : barSize;

        return {
          x,
          y,
          width: barWidth,
          height: barHeight,
          value: key,
          backgroundX,
          backgroundY,
          backgroundHeight,
          backgroundWidth,
          key,
        };
      })
      .filter((bar) => bar !== null);
  }, [
    orientation,
    data,
    categoricalScale,
    numericalScale,
    domainLimit,
    selectedValues,
  ]);

  // Create axes for expanded values
  const expandedAxes = useMemo(() => {
    if (orientation !== "rows" || selectedValues.size === 0) {
      return [];
    }

    return Array.from(selectedValues)
      .map((key) => {
        const max = maxes[key];
        const scaledPosition = categoricalScale(key);
        const bandwidth = categoricalScale.bandwidth();

        if (scaledPosition == null || bandwidth == null) return null;

        const normalizationIsNotNone = normalization !== "None";
        const domain = normalizationIsNotNone ? [1, 0] : [max, 0];
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
          normalizationIsNotNone,
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

    // Draw bars
    bars.forEach((bar) => {
      // Get the position of this bar in the ordered data for consistent striping
      const barIndex = orderedValues.indexOf(bar.value);

      // Highlight dragged bar
      const isDraggedBar = isDragging && draggedValue === bar.value;

      // Draw background stripe pattern (simplified - you may want to implement stripes)
      ctx.fillStyle =
        barIndex % 2 === 0
          ? theme.palette.action.hover
          : theme.palette.background.default;
      ctx.fillRect(
        bar.backgroundX,
        bar.backgroundY,
        bar.backgroundWidth,
        bar.backgroundHeight,
      );

      // Draw bar with drag highlight
      ctx.fillStyle = isDraggedBar
        ? theme.palette.primary.main
        : theme.palette.text.primary;
      ctx.strokeStyle = theme.palette.background.default;
      ctx.lineWidth = isDraggedBar ? 2 : 1;

      ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
      ctx.strokeRect(bar.x, bar.y, bar.width, bar.height);
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
        const metadataValues = metadata?.[hitBar.value];
        openTooltip(
          {
            title: hitBar.value,
            data: {
              "Cell Count": data[hitBar.value],
              [label]: hitBar.value,
              ...metadataValues,
            },
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
        marginBottom: -5,
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
