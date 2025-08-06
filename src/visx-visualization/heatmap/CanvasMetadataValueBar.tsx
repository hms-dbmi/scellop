import { useTheme } from "@mui/material/styles";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import {
  interpolatePlasma,
  schemePaired,
  schemePastel1,
  schemePastel2,
} from "d3";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useColumns, useData, useRows } from "../../contexts/DataContext";
import {
  EXPANDED_ROW_PADDING,
  useXScale,
  useYScale,
} from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import { useMetadataValueBarDragHandler } from "./MetadataValueBarDragHandler";

interface CanvasMetadataValueBarProps {
  axis: "X" | "Y";
  width: number;
  height: number;
}

interface BarHelper {
  value: string | number;
  height: number;
  width: number;
  color: string;
  x: number;
  y: number;
  keys: string[];
  sortKey: string; // Add sortKey to identify which sort this bar belongs to
}

const useFilteredSortOrder = (axis: "X" | "Y") => {
  const rowSort = useData((s) => s.rowSortOrder);
  const columnSort = useData((s) => s.columnSortOrder);
  // Remove filtering - allow multiple sorts to be displayed
  return (axis === "X" ? columnSort : rowSort).filter(
    (s) => s.key !== "count" && s.key !== "alphabetical",
  );
};

// Helper function to get text metrics (kept for potential future use)
// const getTextWidth = (
//   text: string,
//   font: string,
//   ctx: CanvasRenderingContext2D,
// ): number => {
//   const previousFont = ctx.font;
//   ctx.font = font;
//   const width = ctx.measureText(text).width;
//   ctx.font = previousFont;
//   return width;
// };

export default function CanvasMetadataValueBar({
  axis,
  width,
  height,
}: CanvasMetadataValueBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    data: { metadata: md },
    setRowOrder,
    setColumnOrder,
  } = useData();
  const metadata = axis === "X" ? md.cols : md.rows;
  const {
    scale: y,
    scroll: yScroll,
    isZoomed: yIsZoomed,
    setScroll: setYScroll,
  } = useYScale();
  const {
    scale: x,
    scroll: xScroll,
    isZoomed: xIsZoomed,
    setScroll: setXScroll,
  } = useXScale();
  const rows = useRows();
  const columns = useColumns();

  const keys = axis === "X" ? columns : rows;
  const theme = useTheme();

  const { openTooltip, closeTooltip } = useSetTooltipData();

  const sortOrder = useFilteredSortOrder(axis);

  const cellWidth = x.bandwidth();
  const axisLabelPaddingX = Math.max(32, y.bandwidth() * 1.5, x.bandwidth());
  const axisLabelPaddingY = Math.max(8, y.bandwidth());

  const axisLabelX = axis === "X" ? width / 2 : axisLabelPaddingX;
  const axisLabelY = axis === "X" ? axisLabelPaddingY : height / 2;

  // Generate bars data - now create separate bars for each sort
  const bars: BarHelper[] = useMemo(() => {
    if (!metadata || !keys || sortOrder.length === 0) {
      return [];
    }

    const allBars: BarHelper[] = [];

    // Create bars for each sort order
    sortOrder.forEach((sort, sortIndex) => {
      const values = keys.map(
        (key) => metadata[key]?.[sort.key] || "[No Value]",
      );
      const isNumeric = keys.every((key) => {
        const value = metadata[key]?.[sort.key];
        return value && !isNaN(parseInt(value as string, 10));
      });

      // Create color scale for this sort with separate color ranges
      let colorScale:
        | ReturnType<typeof scaleLinear<string>>
        | ReturnType<typeof scaleOrdinal<string, string>>
        | null = null;
      if (isNumeric) {
        const numericValues = values.map((v) =>
          v === "[No Value]" ? 0 : parseInt(v as string, 10),
        );
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);

        // Use different color schemes for each sort to distinguish them
        const colorSchemes = [
          [interpolatePlasma(0), interpolatePlasma(1)],
          ["#f7fcfd", "#00441b"], // Blue to dark green
          ["#fff7ec", "#7f0000"], // Light orange to dark red
          ["#f7f4f9", "#49006a"], // Light purple to dark purple
          ["#fff7fb", "#023858"], // Light pink to dark blue
        ];
        const schemeIndex = sortIndex % colorSchemes.length;

        colorScale = scaleLinear<string>({
          domain: [min, max],
          range: colorSchemes[schemeIndex],
        });
      } else {
        // Use different categorical color schemes for each sort
        const categoricalSchemes = [
          [...schemePaired],
          [...schemePastel1],
          [...schemePastel2],
          ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
          ["#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#aec7e8", "#ffbb78"],
        ];
        const schemeIndex = sortIndex % categoricalSchemes.length;

        colorScale = scaleOrdinal<string, string>({
          range: categoricalSchemes[schemeIndex],
          domain: Array.from(new Set(values.map(String))),
        });
      }

      // Calculate positioning for multiple bars
      const barSpacing = 4;
      const totalBars = sortOrder.length;
      const barThickness =
        axis === "X"
          ? Math.max(
              12,
              (axisLabelPaddingY - barSpacing * (totalBars - 1)) / totalBars,
            )
          : Math.max(
              16,
              (axisLabelPaddingX / 3 - barSpacing * (totalBars - 1)) /
                totalBars,
            );

      keys.reduce<BarHelper[]>((acc: BarHelper[], key: string): BarHelper[] => {
        if (!(key in metadata)) {
          return acc;
        }

        const value = metadata[key]?.[sort.key] || "[No Value]";
        const processedValue =
          isNumeric && value !== "[No Value]"
            ? parseInt(value as string, 10)
            : value;

        const color =
          value === "[No Value]"
            ? theme.palette.grey[400]
            : isNumeric
              ? (colorScale as (value: number) => string)(
                  processedValue as number,
                )
              : (colorScale as (value: string) => string)(
                  processedValue as string,
                );

        if (axis === "Y") {
          let height = y.bandwidth(key);
          let yVal = Math.ceil(y(key) as number);

          // Add padding around expanded bars
          if (height > y.bandwidth()) {
            height += EXPANDED_ROW_PADDING * 2;
            yVal -= EXPANDED_ROW_PADDING;
          }
          height = Math.ceil(height);

          const xVal =
            axisLabelPaddingX * 1.5 + sortIndex * (barThickness + barSpacing);

          const newBar: BarHelper = {
            value: processedValue,
            height,
            width: barThickness,
            color,
            x: xVal,
            y: yVal,
            keys: [key],
            sortKey: sort.key,
          };

          // Check if we can combine with previous bar (same value, same sort, consecutive keys)
          if (acc.length > 0) {
            const lastBar = acc[acc.length - 1];
            if (
              lastBar.value === processedValue &&
              lastBar.sortKey === sort.key
            ) {
              const editedBar: BarHelper = {
                ...lastBar,
                y: Math.min(lastBar.y, yVal),
                height: lastBar.height + height,
                keys: [...lastBar.keys, key],
              };
              acc[acc.length - 1] = editedBar;
              return acc;
            }
          }
          acc.push(newBar);
        } else if (axis === "X") {
          const width = x.bandwidth();
          const yVal =
            2 * axisLabelPaddingY + sortIndex * (barThickness + barSpacing);
          const xVal = x(key)!;

          const newBar: BarHelper = {
            value: processedValue,
            width,
            height: barThickness,
            color,
            x: xVal,
            y: yVal,
            keys: [key],
            sortKey: sort.key,
          };

          // Check if we can combine with previous bar (same value, same sort, consecutive keys)
          if (acc.length > 0) {
            const lastBar = acc[acc.length - 1];
            if (
              lastBar.value === processedValue &&
              lastBar.sortKey === sort.key
            ) {
              const editedBar = {
                ...lastBar,
                x: Math.min(lastBar.x, xVal),
                width: lastBar.width + width,
                keys: [...lastBar.keys, key],
              } as BarHelper;
              acc[acc.length - 1] = editedBar;
              return acc;
            }
          }
          acc.push(newBar);
        }
        return acc;
      }, allBars);
    });

    return allBars;
  }, [
    metadata,
    keys,
    sortOrder,
    y,
    x,
    axisLabelPaddingX,
    axisLabelPaddingY,
    axis,
    theme.palette.grey,
  ]);

  // Handle segment reordering
  const handleSegmentReorder = useCallback(
    (draggedKeys: string[], targetKeys: string[]) => {
      if (!keys || draggedKeys.length === 0 || targetKeys.length === 0) return;

      const currentOrder = axis === "X" ? columns : rows;
      if (!currentOrder) return;

      // Create a new order array
      const newOrder = [...currentOrder];

      // Remove dragged keys from their current positions
      const filteredOrder = newOrder.filter(
        (key) => !draggedKeys.includes(key),
      );

      // Find the insertion point (before the first target key)
      const insertionIndex = filteredOrder.findIndex((key) =>
        targetKeys.includes(key),
      );

      // Insert dragged keys at the insertion point
      if (insertionIndex !== -1) {
        filteredOrder.splice(insertionIndex, 0, ...draggedKeys);
      } else {
        // If target not found, append at the end
        filteredOrder.push(...draggedKeys);
      }

      // Update the order
      if (axis === "X") {
        setColumnOrder(filteredOrder);
      } else {
        setRowOrder(filteredOrder);
      }
    },
    [axis, keys, columns, rows, setColumnOrder, setRowOrder],
  );

  // Set up drag handling
  const { isDragging, draggedSegment, targetSegment } =
    useMetadataValueBarDragHandler({
      canvasRef,
      bars,
      axis,
      onSegmentReorder: handleSegmentReorder, // Only called on drop
      // No onDragMove - keep dragging smooth by avoiding constant reordering
      scrollOffset: axis === "X" ? xScroll : yScroll,
      isZoomed: axis === "X" ? xIsZoomed : yIsZoomed,
    });

  // Canvas drawing function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match CSS size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply scroll transform
    ctx.save();
    if (axis === "Y" && yIsZoomed) {
      ctx.translate(0, -yScroll);
    } else if (axis === "X" && xIsZoomed) {
      ctx.translate(-xScroll, 0);
    }

    const font = `${theme.typography.fontSize}px ${theme.typography.fontFamily}`;

    // Draw bars and text
    bars.forEach((bar) => {
      const {
        value,
        height: barHeight,
        width: barWidth,
        color,
        x: xVal,
        y: yVal,
      } = bar;

      // Check if this bar is being dragged or is a target
      const isDraggedBar = isDragging && draggedSegment === bar;
      const isTargetBar = isDragging && targetSegment === bar;

      // Draw bar with drag/target highlighting
      if (isDraggedBar) {
        ctx.fillStyle = theme.palette.primary.light;
      } else if (isTargetBar) {
        // Make target more visible with a stronger highlight
        ctx.fillStyle = theme.palette.secondary.main;
        ctx.globalAlpha = 0.3; // Semi-transparent highlight
      } else {
        ctx.fillStyle = color;
      }

      ctx.fillRect(xVal, yVal, barWidth, Math.ceil(barHeight));

      // Reset alpha for subsequent draws
      if (isTargetBar) {
        ctx.globalAlpha = 1.0;
      }

      // Draw borders around dragged and target bars
      if (isDraggedBar) {
        ctx.strokeStyle = theme.palette.primary.main;
        ctx.lineWidth = 2;
        ctx.strokeRect(xVal, yVal, barWidth, Math.ceil(barHeight));
      } else if (isTargetBar) {
        // Draw a more prominent target indicator
        ctx.strokeStyle = theme.palette.secondary.main;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]); // More prominent dashed line
        ctx.strokeRect(xVal, yVal, barWidth, Math.ceil(barHeight));
        ctx.setLineDash([]); // Reset line dash

        // Add an additional inner border for extra visibility
        ctx.strokeStyle = theme.palette.secondary.dark;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);
        const inset = 2;
        ctx.strokeRect(
          xVal + inset,
          yVal + inset,
          barWidth - inset * 2,
          Math.ceil(barHeight) - inset * 2,
        );
        ctx.setLineDash([]); // Reset line dash
      }

      // Draw text only if there's a single sort order (single bar type)
      if (sortOrder.length === 1) {
        const shortenedValue =
          value.toString().length > 20
            ? value.toString().slice(0, 10) + "..."
            : value;

        ctx.fillStyle = theme.palette.text.primary;
        ctx.font = font;

        const textY = (() => {
          if (axis === "X") {
            return yVal + barHeight / 2;
          }
          if (bars.length === 1) {
            // Handle single-bar case by purposely un-centering the text
            // otherwise the label can overlap the metadata name
            return yVal + barHeight / 1.5;
          } else {
            return yVal + barHeight / 2;
          }
        })();

        if (axis === "X") {
          // Rotated text for X axis
          ctx.save();
          ctx.translate(xVal, textY + cellWidth + 8);
          ctx.rotate(Math.PI / 2);
          ctx.textAlign = "start";
          ctx.textBaseline = "middle";
          ctx.fillText(String(shortenedValue), 0, 0);
          ctx.restore();
        } else {
          // Horizontal text for Y axis
          ctx.textAlign = "start";
          ctx.textBaseline = "middle";
          ctx.fillText(String(shortenedValue), xVal + cellWidth + 8, textY);
        }
      }
    });

    // Draw insertion line indicator when dragging
    if (isDragging && targetSegment) {
      ctx.save();
      ctx.strokeStyle = theme.palette.secondary.main;
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.8;

      if (axis === "Y") {
        // Draw horizontal line above the target segment
        const lineY = targetSegment.y - 2;
        ctx.beginPath();
        ctx.moveTo(targetSegment.x - 10, lineY);
        ctx.lineTo(targetSegment.x + targetSegment.width + 10, lineY);
        ctx.stroke();

        // Draw small arrows on the ends
        const arrowSize = 4;
        ctx.beginPath();
        ctx.moveTo(targetSegment.x - 10, lineY);
        ctx.lineTo(targetSegment.x - 10 + arrowSize, lineY - arrowSize);
        ctx.moveTo(targetSegment.x - 10, lineY);
        ctx.lineTo(targetSegment.x - 10 + arrowSize, lineY + arrowSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(targetSegment.x + targetSegment.width + 10, lineY);
        ctx.lineTo(
          targetSegment.x + targetSegment.width + 10 - arrowSize,
          lineY - arrowSize,
        );
        ctx.moveTo(targetSegment.x + targetSegment.width + 10, lineY);
        ctx.lineTo(
          targetSegment.x + targetSegment.width + 10 - arrowSize,
          lineY + arrowSize,
        );
        ctx.stroke();
      } else {
        // Draw vertical line before the target segment
        const lineX = targetSegment.x - 2;
        ctx.beginPath();
        ctx.moveTo(lineX, targetSegment.y - 10);
        ctx.lineTo(lineX, targetSegment.y + targetSegment.height + 10);
        ctx.stroke();

        // Draw small arrows on the ends
        const arrowSize = 4;
        ctx.beginPath();
        ctx.moveTo(lineX, targetSegment.y - 10);
        ctx.lineTo(lineX - arrowSize, targetSegment.y - 10 + arrowSize);
        ctx.moveTo(lineX, targetSegment.y - 10);
        ctx.lineTo(lineX + arrowSize, targetSegment.y - 10 + arrowSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(lineX, targetSegment.y + targetSegment.height + 10);
        ctx.lineTo(
          lineX - arrowSize,
          targetSegment.y + targetSegment.height + 10 - arrowSize,
        );
        ctx.moveTo(lineX, targetSegment.y + targetSegment.height + 10);
        ctx.lineTo(
          lineX + arrowSize,
          targetSegment.y + targetSegment.height + 10 - arrowSize,
        );
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();

    // Draw axis label if single sort order
    if (sortOrder.length === 1) {
      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const labelText = sortOrder
        .map((s) => s.key.split("_").join(" "))
        .join(", ");

      if (axis === "Y") {
        ctx.save();
        ctx.translate(axisLabelX, axisLabelY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(labelText, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(labelText, axisLabelX, axisLabelY);
      }
    }
  }, [
    width,
    height,
    axis,
    yIsZoomed,
    xIsZoomed,
    yScroll,
    xScroll,
    bars,
    theme,
    cellWidth,
    sortOrder,
    axisLabelX,
    axisLabelY,
    isDragging,
    draggedSegment,
    targetSegment,
  ]);

  // Draw canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle wheel scrolling for zoomed axes
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (axis === "Y" && yIsZoomed) {
        e.preventDefault();
        setYScroll((prev: number) => {
          const maxScrollY = Math.max(0, y.range()[0] - height);
          return Math.max(0, Math.min(maxScrollY, prev + e.deltaY));
        });
      } else if (axis === "X" && xIsZoomed) {
        e.preventDefault();
        setXScroll((prev: number) => {
          const maxScrollX = Math.max(0, x.range()[1] - width);
          return Math.max(0, Math.min(maxScrollX, prev + e.deltaX));
        });
      }
    },
    [axis, yIsZoomed, xIsZoomed, setYScroll, setXScroll, y, x, height, width],
  );

  // Handle mouse events for tooltips
  const getBarAtPosition = useCallback(
    (clientX: number, clientY: number): BarHelper | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Adjust for scroll offset
      const adjustedX = axis === "X" && xIsZoomed ? x + xScroll : x;
      const adjustedY = axis === "Y" && yIsZoomed ? y + yScroll : y;

      // Find bar at position
      for (const bar of bars) {
        if (
          adjustedX >= bar.x &&
          adjustedX <= bar.x + bar.width &&
          adjustedY >= bar.y &&
          adjustedY <= bar.y + bar.height
        ) {
          return bar;
        }
      }
      return null;
    },
    [bars, axis, xIsZoomed, yIsZoomed, xScroll, yScroll],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Don't show tooltip while dragging
      if (isDragging) {
        closeTooltip();
        return;
      }

      const bar = getBarAtPosition(e.clientX, e.clientY);
      if (!bar) {
        closeTooltip();
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Determine which key to show in tooltip for combined bars
      let title = String(bar.value);
      if (bar.keys.length > 1) {
        const keysReverse = bar.keys.slice().reverse();
        if (axis === "Y") {
          const keyHeight = bar.height / bar.keys.length;
          const adjustedY = axis === "Y" && yIsZoomed ? y + yScroll : y;
          const relativeY = adjustedY - bar.y;
          const keyIndex = Math.floor(relativeY / keyHeight);
          title =
            keysReverse[
              Math.max(0, Math.min(keyIndex, keysReverse.length - 1))
            ];
        } else if (axis === "X") {
          const keyWidth = bar.width / bar.keys.length;
          const adjustedX = axis === "X" && xIsZoomed ? x + xScroll : x;
          const relativeX = adjustedX - bar.x;
          const keyIndex = Math.floor(relativeX / keyWidth);
          title =
            keysReverse[
              Math.max(0, Math.min(keyIndex, keysReverse.length - 1))
            ];
        }
      }

      openTooltip(
        {
          title,
          data: {
            ["field"]: bar.sortKey.split("_").join(" "),
            ["value"]: bar.value,
          },
        },
        e.clientX,
        e.clientY,
      );
    },
    [
      getBarAtPosition,
      closeTooltip,
      openTooltip,
      axis,
      yIsZoomed,
      xIsZoomed,
      yScroll,
      xScroll,
      isDragging,
    ],
  );

  // Determine cursor style based on drag state
  const getCursorStyle = useCallback(() => {
    if (isDragging) {
      return targetSegment ? "copy" : "grabbing";
    }
    return "grab";
  }, [isDragging, targetSegment]);

  const handleMouseLeave = useCallback(() => {
    closeTooltip();
  }, [closeTooltip]);

  if (!metadata || !keys || sortOrder.length === 0) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, cursor: getCursorStyle() }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
