import { useTheme } from "@mui/material/styles";
import React, { useLayoutEffect, useRef } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useColorScale } from "../../contexts/ColorScaleContext";
import {
  useColumnMetadataKeys,
  useColumns,
  useData,
  useFractionDataMap,
  useMetadataLookup,
  useRowMaxes,
  useRowMetadataKeys,
  useRows,
} from "../../contexts/DataContext";
import { useHeatmapDimensions } from "../../contexts/DimensionsContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useTooltipFields } from "../../contexts/MetadataConfigContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import { useCanvasDragHandler } from "../../hooks/useDragHandler";
import {
  calculateHeatmapCells,
  calculateInlineBars,
} from "../../utils/calculations";
import { renderCellsToCanvas } from "../../utils/rendering";

const useCurrentNormalizedScale = () => {
  const normalization = useNormalization((s) => s.normalization);
  const {
    countsScale: globalScale,
    percentageScale,
    logScale,
  } = useColorScale();

  switch (normalization) {
    case "None":
      return globalScale;
    case "Log":
      return logScale;
    default:
      return percentageScale;
  }
};

function Heatmap() {
  const { width, height } = useHeatmapDimensions();
  const rows = useRows();
  const columns = useColumns();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const xScale = useXScale();
  const yScale = useYScale();
  const selectedValues = useSelectedValues((s) => s.selectedValues);

  const colors = useCurrentNormalizedScale();
  const normalization = useNormalization((s) => s.normalization);
  const dataMap = useFractionDataMap(normalization);
  const rowMaxes = useRowMaxes();
  const theme = useTheme();

  // Get column colors for bar rendering
  const columnColors = useColumnConfig((s) => s.colors);

  const { openTooltip, closeTooltip } = useSetTooltipData();
  const { setRowOrder, setColumnOrder } = useData();

  // Tooltip-related hooks
  const rowLabel = useRowConfig((store) => store.label);
  const columnLabel = useColumnConfig((store) => store.label);
  const rowMetadataKeys = useRowMetadataKeys();
  const columnMetadataKeys = useColumnMetadataKeys();
  const rowTooltipFields = useTooltipFields(rowMetadataKeys);
  const columnTooltipFields = useTooltipFields(columnMetadataKeys);
  const lookupMetadata = useMetadataLookup();

  // Handle drag and drop reordering
  const handleReorder = React.useCallback(
    (
      draggedCell: { row: string; column: string },
      targetCell: { row: string; column: string },
    ) => {
      const { row: draggedRow, column: draggedColumn } = draggedCell;
      const { row: targetRow, column: targetColumn } = targetCell;

      // Reorder rows if different
      if (draggedRow !== targetRow) {
        const newRowOrder = [...rows];
        const draggedIndex = newRowOrder.indexOf(draggedRow);
        const targetIndex = newRowOrder.indexOf(targetRow);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          // Remove dragged row and insert at target position
          const [removed] = newRowOrder.splice(draggedIndex, 1);
          newRowOrder.splice(targetIndex, 0, removed);
          setRowOrder(newRowOrder);
        }
      }

      // Reorder columns if different
      if (draggedColumn !== targetColumn) {
        const newColumnOrder = [...columns];
        const draggedIndex = newColumnOrder.indexOf(draggedColumn);
        const targetIndex = newColumnOrder.indexOf(targetColumn);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          // Remove dragged column and insert at target position
          const [removed] = newColumnOrder.splice(draggedIndex, 1);
          newColumnOrder.splice(targetIndex, 0, removed);
          setColumnOrder(newColumnOrder);
        }
      }
    },
    [rows, columns, setRowOrder, setColumnOrder],
  );

  // Set up drag handling
  const { isClicking, isDragging, draggedCell, currentPosition } =
    useCanvasDragHandler({
      canvasRef,
      xScale: xScale.scale,
      yScale: yScale.scale,
      onReorder: handleReorder, // Final reordering on drop (fallback)
      onDragMove: handleReorder, // Real-time reordering during drag
      xScrollOffset: xScale.scroll,
      yScrollOffset: yScale.scroll,
      xZoomed: xScale.isZoomed,
      yZoomed: yScale.isZoomed,
    });

  // Handle mouse move for tooltips (when not dragging)
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        closeTooltip(); // Don't show tooltip while dragging
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left + xScale.scroll;
      const y = e.clientY - rect.top + yScale.scroll;

      const columnKey = xScale.scale.lookup(x);
      const rowKey = yScale.scale.lookup(y);

      if (!rowKey || !columnKey) {
        closeTooltip();
        return;
      }

      const key = `${rowKey}-${columnKey}` as keyof typeof dataMap;
      const value = dataMap[key];

      let normalizationInfo: Record<string, string> = {};

      switch (normalization) {
        case "None":
          break;
        case "Log":
          normalizationInfo = {
            "Log count": dataMap[key].toFixed(2),
          };
          break;
        case "Row":
        case "Column":
          normalizationInfo = {
            [`Percentage of total cells in ${normalization}`]: `${(dataMap[key] * 100).toFixed(2)}%`,
          };
          break;
        default:
          console.error(`Unknown normalization type: ${normalization}`);
      }

      const columnMetadata = lookupMetadata(
        columnKey,
        "cols",
        columnTooltipFields,
      );
      const rowMetadata = lookupMetadata(rowKey, "rows", rowTooltipFields);

      openTooltip(
        {
          title: `${rowKey} - ${columnKey}`,
          data: {
            "Cell Count": value,
            [rowLabel]: rowKey,
            [columnLabel]: columnKey,
            ...normalizationInfo,
            ...columnMetadata,
            ...rowMetadata,
          },
        },
        e.clientX,
        e.clientY,
      );
    },
    [
      isDragging,
      xScale.scale,
      yScale.scale,
      dataMap,
      normalization,
      lookupMetadata,
      columnTooltipFields,
      rowTooltipFields,
      openTooltip,
      closeTooltip,
      rowLabel,
      columnLabel,
      xScale.scroll,
      yScale.scroll,
    ],
  );

  // Draw crosshair when dragging
  const drawCrosshair = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if ((!isClicking && !isDragging) || !draggedCell || !currentPosition)
        return;

      const { row, column } = draggedCell;
      const rowY = yScale.scale(row);
      const colX = xScale.scale(column);
      const rowHeight = yScale.scale.bandwidth(row);
      const colWidth = xScale.scale.bandwidth();

      if (rowY == null || colX == null) return;

      ctx.save();

      // Set crosshair style
      ctx.strokeStyle = theme.palette.primary.main;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;

      // Adjust for scroll offset
      const adjustedRowY = rowY - yScale.scroll;
      const adjustedColX = colX - xScale.scroll;

      // Draw horizontal line (row highlight)
      ctx.beginPath();
      ctx.moveTo(0, adjustedRowY + rowHeight / 2);
      ctx.lineTo(width, adjustedRowY + rowHeight / 2);
      ctx.stroke();

      // Draw vertical line (column highlight)
      ctx.beginPath();
      ctx.moveTo(adjustedColX + colWidth / 2, 0);
      ctx.lineTo(adjustedColX + colWidth / 2, height);
      ctx.stroke();

      // Draw highlighted cell border
      ctx.strokeStyle = theme.palette.primary.main;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 1;
      ctx.strokeRect(adjustedColX, adjustedRowY, colWidth, rowHeight);

      ctx.restore();
    },
    [
      isDragging,
      draggedCell,
      currentPosition,
      xScale,
      yScale,
      width,
      height,
      theme,
      xScale.scroll,
      yScale.scroll,
      isClicking,
    ],
  );

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
    if (xScale.isZoomed || yScale.isZoomed) {
      ctx.translate(-xScale.scroll, -yScale.scroll);
    }

    ctx.clearRect(xScale.scroll, yScale.scroll, width, height);

    // Calculate regular heatmap cells (non-expanded rows)
    const regularCells = calculateHeatmapCells({
      rows,
      columns,
      dataMap,
      xScale: xScale.scale,
      yScale: yScale.scale,
      colorScale: colors,
      backgroundColor: theme.palette.background.default,
      selectedValues, // Skip expanded rows
      xScroll: 0, // Don't apply scroll here, we do it via translate
      yScroll: 0,
    });

    // Calculate inline bars for expanded rows
    const inlineCells = calculateInlineBars({
      rows,
      columns,
      dataMap,
      rowMaxes,
      xScale: xScale.scale,
      yScale: yScale.scale,
      selectedValues, // Only render for expanded rows
      normalization,
      columnColors,
      defaultColor: theme.palette.text.primary,
      backgroundColor: theme.palette.background.default,
      xScroll: 0, // Don't apply scroll here, we do it via translate
      yScroll: 0,
    });

    // Render regular cells with strokes
    renderCellsToCanvas(ctx, regularCells, {
      strokeColor: colors(colors.domain()[1] / 2),
      drawStroke: true,
    });

    // Render inline bars (no strokes for bars)
    renderCellsToCanvas(ctx, inlineCells, {
      drawStroke: false,
    });

    // Restore the transformation matrix before drawing crosshair
    ctx.restore();

    // Draw crosshair if dragging (without scroll offset)
    drawCrosshair(ctx);
  }, [
    xScale,
    yScale,
    dataMap,
    rowMaxes,
    selectedValues,
    normalization,
    colors,
    theme,
    drawCrosshair,
    xScale.isZoomed,
    yScale.isZoomed,
    xScale.scroll,
    yScale.scroll,
    width,
    height,
    columnColors,
    rows,
    columns,
  ]);

  // Handle wheel scrolling for zoomed axes
  const handleWheel = React.useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (!xScale.isZoomed && !yScale.isZoomed) return;

      e.preventDefault();

      if (xScale.isZoomed) {
        xScale.setScroll((prev: number) => {
          const maxScrollX = Math.max(0, xScale.scale.range()[1] - width);
          return Math.max(0, Math.min(maxScrollX, prev + e.deltaX));
        });
      }

      if (yScale.isZoomed) {
        yScale.setScroll((prev: number) => {
          const maxScrollY = Math.max(0, yScale.scale.range()[0] - height);
          return Math.max(0, Math.min(maxScrollY, prev + e.deltaY));
        });
      }
    },
    [xScale, yScale, width, height],
  );

  return (
    <canvas
      onMouseMove={handleMouseMove}
      onMouseOut={closeTooltip}
      onBlur={closeTooltip}
      onWheel={handleWheel}
      ref={canvasRef}
      width={width}
      height={height}
      className="heatmap"
      style={{
        cursor: isDragging ? "grabbing" : "default",
        outline: `1px solid ${theme.palette.text.primary}`,
      }}
    />
  );
}

export default Heatmap;
