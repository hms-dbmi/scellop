import React, { useCallback, useLayoutEffect, useMemo, useRef } from "react";

import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { scaleBand, scaleLinear } from "@visx/scale";
import { area } from "@visx/shape";
import { curveNatural } from "d3";
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
import { LEFT_MARGIN, TOP_MARGIN } from "./constants";
import { useViolinDragHandler } from "./ViolinDragHandler";

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
 * Casts NaN and Undefined to 0
 * @param value The value to handle
 * @returns The value if it is not NaN or undefined, 0 otherwise
 */
function handleNaN(value?: number) {
  return !value || isNaN(value) ? 0 : value;
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

/**
 * Returns the domain categories for the given side
 * The domain for the top violins is the rows (since they show the proportion of each cell as a fraction of the row total)
 * The domain for the left violins is the columns (since they show the proportion of each cell as a fraction of the column total)
 */
const useDomainCategories = (side: Side) => {
  const rows = useRows();
  const columns = useColumns();
  switch (side) {
    case "top":
      return rows;
    case "left":
      return columns;
    default:
      console.error("Invalid side in Violin.useDomainCategories: ", side);
      return columns;
  }
};

/**
 * Returns the scale for the violin's height axis.
 * @param side The side to get the scale for.
 * @returns The scale for the violin's height axis.
 */
function useViolinScale(side: Side) {
  const { width, height } = useViolinPanelDimensions(side);
  const { tickLabelSize } = useCategoricalScale(side);

  const categories = useDomainCategories(side);

  return useMemo(() => {
    const topViolins = side === "top";
    const rangeEnd = topViolins ? height : width;
    const rangeStart = tickLabelSize;
    const margin = topViolins ? TOP_MARGIN : LEFT_MARGIN;
    const range: [number, number] = [rangeStart, rangeEnd + margin];
    return scaleBand({
      range,
      domain: categories,
    });
  }, [side, categories, width, height, tickLabelSize]);
}

/**
 * Returns the violin fraction entries for the given side.
 * Each entry is an array of fractions for the corresponding category.
 * @param side The side to get the entries for.
 * @returns The fraction entry order for the given side as a map of keys to fractions.
 */
const useEntries = (side: Side) => {
  const rows = useRows();
  const columns = useColumns();
  // Top violins show the proportion of each cell as a fraction of the row total
  // Left violins show the proportion of each cell as a fraction of the column total
  const normalization = side === "top" ? "Row" : "Column";
  const dataMap = useFractionDataMap(normalization);
  return useMemo(() => {
    if (side === "top") {
      return columns.reduce((acc, col) => {
        const colData = rows.map((row) => {
          const key: `${string}-${string}` = `${row}-${col}`;
          return [row, dataMap[key]];
        });
        return {
          ...acc,
          [col]: colData,
        };
      }, {});
    } else {
      return rows.reduce((acc, row) => {
        const rowData = columns.map((col) => {
          const key: `${string}-${string}` = `${row}-${col}`;
          return [col, dataMap[key]];
        });
        return {
          ...acc,
          [row]: rowData,
        };
      }, {});
    }
  }, [dataMap, columns, rows]) as Record<string, [string, number][]>;
};

function useViolinPanelDimensions(side: Side) {
  return usePanelDimensions(side === "top" ? "center_top" : "left_middle");
}

export default function RevisedViolins({ side = "top" }: ViolinsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topViolins = side === "top";
  const entries = useEntries(side);
  const { scale: categoricalScale, tickLabelSize } = useCategoricalScale(side);
  const { width, height } = useViolinPanelDimensions(side);
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const theme = useTheme();
  const { openTooltip, closeTooltip } = useSetTooltipData();
  const orderedValues = useViolinPositionValues(side); // Values that position the violins
  const { setRowOrder, setColumnOrder } = useData();

  // Handle drag and drop reordering
  const handleReorder = useCallback(
    (draggedValue: string, targetValue: string) => {
      if (draggedValue === targetValue) return;

      if (side === "top") {
        // Reordering columns (top violins are positioned by columns)
        const newOrder = [...orderedValues];
        const draggedIndex = newOrder.indexOf(draggedValue);
        const targetIndex = newOrder.indexOf(targetValue);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = newOrder.splice(draggedIndex, 1);
          newOrder.splice(targetIndex, 0, removed);
          setColumnOrder(newOrder);
        }
      } else {
        // Reordering rows (left violins are positioned by rows)
        const newOrder = [...orderedValues];
        console.log("Left violins - current order:", newOrder);
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
    onReorder: handleReorder, // Final reordering on drop (fallback)
    onDragMove: handleReorder, // Real-time reordering during drag
  });

  const violinScale = useViolinScale(side);
  const densityScale = scaleLinear({
    domain: [0, 1], // Fractions are between 0 and 1
    range: [0, categoricalScale.bandwidth() / 2], // Total violin width is equal to the categorical scale bandwidth
  });

  const violinAreaGenerator = useMemo(() => {
    if (side === "top") {
      return area<[string, number]>()
        .y((d) => handleNaN(violinScale(d[0]) as number))
        .x0(
          (d) =>
            handleNaN(densityScale(-d[1])) + categoricalScale.bandwidth() / 2,
        )
        .x1(
          (d) =>
            handleNaN(densityScale(d[1])) + categoricalScale.bandwidth() / 2,
        )
        .curve(curveNatural);
    } else {
      return area<[string, number]>()
        .x((d) => handleNaN(violinScale(d[0])) as number)
        .y0(
          (d) =>
            handleNaN(densityScale(-d[1])) + categoricalScale.bandwidth() / 2,
        )
        .y1(
          (d) =>
            handleNaN(densityScale(d[1])) + categoricalScale.bandwidth() / 2,
        )
        .curve(curveNatural);
    }
  }, [densityScale, violinScale, side, categoricalScale]);

  const violinData = useMemo(() => {
    return Object.entries(entries)
      .filter(([key]) => !selectedValues.has(key))
      .map(([key, entry]) => {
        const transformCoordinate = categoricalScale(key) ?? 0;
        const pathData = violinAreaGenerator(entry) ?? "";

        // Calculate background dimensions
        const rangeStart = topViolins ? height : width;
        const rangeEnd = tickLabelSize;
        const y = topViolins ? rangeEnd : 0;
        const x = topViolins ? 0 : rangeEnd;
        const w = topViolins
          ? categoricalScale.bandwidth()
          : rangeStart + LEFT_MARGIN;
        const h = topViolins
          ? rangeStart + TOP_MARGIN
          : categoricalScale.bandwidth();

        return {
          key,
          entry,
          transformCoordinate,
          pathData,
          backgroundDimensions: { x, y, width: w, height: h },
        };
      });
  }, [
    entries,
    categoricalScale,
    violinAreaGenerator,
    selectedValues,
    topViolins,
    height,
    width,
    tickLabelSize,
  ]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    violinData.forEach((violin) => {
      ctx.save();

      // Apply transform
      if (topViolins) {
        ctx.translate(violin.transformCoordinate, 0);
      } else {
        ctx.translate(0, violin.transformCoordinate);
      }

      // Highlight dragged violin
      const isDraggedViolin = isDragging && draggedValue === violin.key;

      // Draw background stripe
      const violinIndex = orderedValues.indexOf(violin.key);
      const stripeColor =
        violinIndex % 2 === 0
          ? theme.palette.background.default
          : theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[50];

      ctx.fillStyle = stripeColor;
      ctx.fillRect(
        violin.backgroundDimensions.x,
        violin.backgroundDimensions.y,
        violin.backgroundDimensions.width,
        violin.backgroundDimensions.height,
      );

      // Draw violin path with drag highlight
      if (violin.pathData) {
        const path = new Path2D(violin.pathData);
        ctx.fillStyle = isDraggedViolin
          ? theme.palette.primary.main
          : theme.palette.text.primary;
        ctx.globalAlpha = isDraggedViolin ? 0.8 : 0.6;
        ctx.fill(path);

        // Add stroke highlight for dragged violin
        if (isDraggedViolin) {
          ctx.strokeStyle = theme.palette.primary.main;
          ctx.lineWidth = 2;
          ctx.stroke(path);
        }

        ctx.globalAlpha = 1;
      }

      ctx.restore();
    });
  }, [
    violinData,
    width,
    height,
    theme,
    topViolins,
    orderedValues,
    isDragging,
    draggedValue,
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

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
            .reduce((acc, [key, value]) => {
              if (value === 0) {
                return acc;
              }
              return { ...acc, [key]: (value * 100).toFixed(2) + "%" };
            }, {}),
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
    />
  );
}
