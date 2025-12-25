import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type React from "react";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import {
  useColumns,
  useData,
  useFractionDataMap,
  useRows,
} from "../../contexts/DataContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import { useViolinDragHandler } from "../../hooks/useDragHandler";
import { calculateViolins } from "../../utils/calculations";
import { renderViolinsToCanvas } from "../../utils/rendering";

type Side = "top" | "left";

interface ViolinsProps {
  side?: Side;
}

// X scale is categorical for the top graph, Y scale is categorical for the left graph
function useCategoricalScale(side: Side) {
  const x = useXScale();
  const y = useYScale();
  switch (side) {
    case "top":
      return x;
    case "left":
      return y;
    default:
      console.error("Invalid side in Violin.useCategoricalScale: ", side);
      return x;
  }
}
/**
 * Returns the values that position the violins (what gets reordered)
 * The top violins are positioned by columns (each violin represents a column)
 * The left violins are positioned by rows (each violin represents a row)
 */
const useViolinPositionValues = (side: Side) => {
  const rows = useRows();
  const columns = useColumns();
  switch (side) {
    case "top":
      return columns; // Top violins are positioned by columns
    case "left":
      return rows; // Left violins are positioned by rows
    default:
      console.error("Invalid side in Violin.useViolinPositionValues: ", side);
      return columns;
  }
};

function useViolinPanelDimensions(side: Side) {
  return usePanelDimensions(side === "top" ? "center_top" : "left_middle");
}

export default function RevisedViolins({ side = "top" }: ViolinsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topViolins = side === "top";
  const { scale: categoricalScale, tickLabelSize } = useCategoricalScale(side);
  const { width, height } = useViolinPanelDimensions(side);
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const theme = useTheme();
  const { openTooltip, closeTooltip } = useSetTooltipData();
  const orderedValues = useViolinPositionValues(side);
  const { setRowOrder, setColumnOrder } = useData();
  const rows = useRows();
  const columns = useColumns();

  // Get fraction data based on side
  const normalization = side === "top" ? "Row" : "Column";
  const fractionDataMap = useFractionDataMap(normalization);

  // Get the appropriate scale context based on side
  const xScale = useXScale();
  const yScale = useYScale();
  const scaleContext = side === "top" ? xScale : yScale;

  // Handle drag and drop reordering
  const handleReorder = useCallback(
    (draggedValue: string, targetValue: string) => {
      if (draggedValue === targetValue) return;

      if (side === "top") {
        const newOrder = [...orderedValues];
        const draggedIndex = newOrder.indexOf(draggedValue);
        const targetIndex = newOrder.indexOf(targetValue);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = newOrder.splice(draggedIndex, 1);
          newOrder.splice(targetIndex, 0, removed);
          setColumnOrder(newOrder);
        }
      } else {
        const newOrder = [...orderedValues];
        const draggedIndex = newOrder.indexOf(draggedValue);
        const targetIndex = newOrder.indexOf(targetValue);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = newOrder.splice(draggedIndex, 1);
          newOrder.splice(targetIndex, 0, removed);
          setRowOrder(newOrder);
        }
      }
    },
    [side, orderedValues, setColumnOrder, setRowOrder],
  );

  // Set up drag handling
  const { isDragging, draggedValue } = useViolinDragHandler({
    canvasRef,
    scale: categoricalScale,
    side,
    onReorder: handleReorder,
    onDragMove: handleReorder,
    scrollOffset: scaleContext.scroll,
  });

  // Calculate violin data using shared calculation utilities
  const violinData = useMemo(() => {
    const rangeStart = topViolins ? height : width;

    return calculateViolins({
      orientation: topViolins ? "columns" : "rows",
      orderedValues,
      removedValues: new Set(),
      categoricalScale,
      domainLimit: rangeStart,
      tickLabelSize,
      rows,
      columns,
      fractionDataMap,
      color: theme.palette.text.primary,
      selectedValues,
      width,
      height,
    });
  }, [
    topViolins,
    orderedValues,
    categoricalScale,
    height,
    width,
    tickLabelSize,
    rows,
    columns,
    fractionDataMap,
    theme.palette.text.primary,
    selectedValues,
  ]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save the current transformation matrix
    ctx.save();

    // Apply scroll offset for zoomed axes
    if (scaleContext.isZoomed) {
      if (topViolins) {
        ctx.translate(-scaleContext.scroll, 0);
      } else {
        ctx.translate(0, -scaleContext.scroll);
      }
    }

    // Clear canvas with scroll offset
    const clearX =
      scaleContext.isZoomed && topViolins ? scaleContext.scroll : 0;
    const clearY =
      scaleContext.isZoomed && !topViolins ? scaleContext.scroll : 0;
    ctx.clearRect(clearX, clearY, width, height);

    // Render violins using shared Canvas rendering function
    renderViolinsToCanvas(ctx, violinData, {
      orderedValues,
      stripeEvenColor: theme.palette.background.default,
      stripeOddColor:
        theme.palette.mode === "dark"
          ? theme.palette.grey[800]
          : theme.palette.grey[50],
      highlightedKey:
        isDragging && draggedValue !== null ? draggedValue : undefined,
      highlightColor: theme.palette.primary.main,
      opacity: 0.6,
      highlightOpacity: 0.8,
      drawStroke:
        isDragging && draggedValue !== undefined && draggedValue !== null,
      strokeColor: theme.palette.primary.main,
      strokeWidth: 2,
    });

    // Restore the transformation matrix
    ctx.restore();
  }, [
    violinData,
    width,
    height,
    theme,
    topViolins,
    orderedValues,
    isDragging,
    draggedValue,
    scaleContext.isZoomed,
    scaleContext.scroll,
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
        if (topViolins) {
          x += scaleContext.scroll;
        } else {
          y += scaleContext.scroll;
        }
      }

      // Find which violin was hit
      const hitViolin = violinData.find((violin) => {
        const adjustedX = topViolins ? x - violin.transformCoordinate : x;
        const adjustedY = topViolins ? y : y - violin.transformCoordinate;

        return (
          adjustedX >= violin.backgroundDimensions.x &&
          adjustedX <=
            violin.backgroundDimensions.x + violin.backgroundDimensions.width &&
          adjustedY >= violin.backgroundDimensions.y &&
          adjustedY <=
            violin.backgroundDimensions.y + violin.backgroundDimensions.height
        );
      });

      if (hitViolin) {
        const tooltip = {
          title: hitViolin.key,
          data: [...hitViolin.entry]
            .sort((a, b) => b[1] - a[1])
            .reduce(
              (acc, [key, value]) => {
                if (value === 0) {
                  return acc;
                }
                acc[key] = `${(value * 100).toFixed(2)}%`;
                return acc;
              },
              {} as Record<string, string>,
            ),
        };
        openTooltip(tooltip, e.clientX, e.clientY);
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
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (!scaleContext.isZoomed) return;

      e.preventDefault();

      scaleContext.setScroll((prev: number) => {
        const maxScroll = Math.max(
          0,
          categoricalScale.range()[1] - (topViolins ? width : height),
        );
        const delta = topViolins ? e.deltaX : e.deltaY;
        return Math.max(0, Math.min(maxScroll, prev + delta));
      });
    },
    [scaleContext, categoricalScale, topViolins, width, height],
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    />
  );
}
