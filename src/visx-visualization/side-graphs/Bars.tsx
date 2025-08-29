import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { scaleLinear } from "@visx/scale";
import { ScaleBand, ScaleLinear } from "d3";
import React, { useCallback, useLayoutEffect, useMemo, useRef } from "react";
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
import { EXPANDED_ROW_PADDING } from "../../hooks/useYScaleCreator";
import { getColorForValue } from "../../utils/categorical-colors";
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

  // Get data for stacked bars - use appropriate data map based on normalization
  const dataMap = useFractionDataMap(normalization);

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

  const bars = useMemo(() => {
    const entries = Object.entries(data);
    const result = [];

    for (const [key, totalValue] of entries) {
      if (orientation === "rows" && selectedValues?.has(key)) {
        continue;
      }

      const scaledKey = categoricalScale(key);
      const isVertical = orientation === "columns";
      const barSize = categoricalScale.bandwidth();
      const scaledPosition = scaledKey ?? 0;
      const [rangeStart, rangeEnd] = numericalScale.range();

      // Background dimensions and position
      const backgroundX = isVertical ? scaledPosition : domainLimit - rangeEnd;
      const backgroundY = isVertical
        ? domainLimit - rangeStart
        : scaledPosition;
      const backgroundWidth = isVertical ? barSize : rangeEnd;
      const backgroundHeight = isVertical ? rangeStart : barSize;

      // Create segments based on graph type
      const segments = [];

      if (
        currentGraphType === "Stacked Bars (Categorical)" ||
        currentGraphType === "Stacked Bars (Continuous)"
      ) {
        // Create stacked segments
        let currentOffset = 0;

        // Filter out removed stack values
        const activeStackValues = stackValues.filter(
          (stackValue) => !removedStackValues.has(stackValue),
        );

        for (const stackValue of activeStackValues) {
          // Get the cell value for this combination
          const cellKey =
            orientation === "columns"
              ? `${stackValue}-${key}`
              : `${key}-${stackValue}`;
          const cellValue = dataMap[cellKey as keyof typeof dataMap] || 0;

          if (cellValue > 0) {
            // Scale the segment value
            const scaledSegmentValue = numericalScale(
              currentOffset + cellValue,
            );
            const scaledCurrentOffset = numericalScale(currentOffset);

            // Calculate segment dimensions
            const segmentLength = scaledSegmentValue - scaledCurrentOffset;

            const segmentX = isVertical
              ? scaledPosition
              : domainLimit - scaledSegmentValue;
            const segmentY = isVertical
              ? domainLimit - scaledSegmentValue
              : scaledPosition;
            const segmentWidth = isVertical ? barSize : segmentLength;
            const segmentHeight = isVertical ? segmentLength : barSize;

            // Get color based on graph type and normalization
            let color: string;
            if (currentGraphType === "Stacked Bars (Categorical)") {
              // Use individual colors for categorical stacked bars
              const oppositeAxisConfig =
                orientation === "columns" ? rowConfig : columnConfig;
              color = getColorForValue(
                stackValue,
                stackValues,
                oppositeAxisConfig.colors,
              );
            } else {
              // Use heatmap color scale for continuous stacked bars
              if (normalization === "None") {
                color = colorScale.countsScale(cellValue);
              } else {
                // For normalized data, use percentage scale
                const normalizedValue =
                  normalization === "Row" ? cellValue / totalValue : cellValue;
                color = colorScale.percentageScale(normalizedValue);
              }
            }

            segments.push({
              x: segmentX,
              y: segmentY,
              width: segmentWidth,
              height: segmentHeight,
              value: cellValue,
              stackValue,
              color,
            });

            currentOffset += cellValue;
          }
        }
      } else {
        // Create a single unsegmented bar for "Bars" mode
        const scaledValue = numericalScale(totalValue);
        const barLength = scaledValue;

        // Bar dimensions and position
        const x = isVertical ? scaledPosition : domainLimit - scaledValue;
        const y = isVertical ? domainLimit - scaledValue : scaledPosition;
        const barWidth = isVertical ? barSize : barLength;
        const barHeight = isVertical ? barLength : barSize;

        // Get color for the bar - use axis colors if configured, otherwise default
        const color = axisConfig.colors
          ? getColorForValue(key, orderedValues, axisConfig.colors)
          : theme.palette.text.primary;

        segments.push({
          x,
          y,
          width: barWidth,
          height: barHeight,
          value: totalValue,
          stackValue: key, // Use the bar key as stack value for consistency
          color,
        });
      }

      result.push({
        key,
        totalValue,
        segments,
        backgroundX,
        backgroundY,
        backgroundWidth,
        backgroundHeight,
      });
    }

    return result;
  }, [
    orientation,
    data,
    dataMap,
    categoricalScale,
    numericalScale,
    domainLimit,
    selectedValues,
    stackValues,
    removedStackValues,
    colorScale,
    normalization,
    currentGraphType,
    theme.palette.text.primary,
    axisConfig.colors,
    rowConfig.colors,
    columnConfig.colors,
    orderedValues,
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
      const barIndex = orderedValues.indexOf(bar.key);

      // Highlight dragged bar
      const isDraggedBar = isDragging && draggedValue === bar.key;

      // Draw background stripe pattern
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

      // Draw stacked segments
      bar.segments.forEach((segment) => {
        ctx.fillStyle = isDraggedBar
          ? theme.palette.primary.main
          : segment.color;
        ctx.strokeStyle = theme.palette.background.default;
        ctx.lineWidth = isDraggedBar ? 2 : 1;

        ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
        ctx.strokeRect(segment.x, segment.y, segment.width, segment.height);
      });
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

        const tooltipData: Record<string, string | number> = {
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
          tooltipData[`${segmentLabel} Value`] = hitSegment.stackValue;
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
