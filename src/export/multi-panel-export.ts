import { scaleLinear } from "@visx/scale";
import { ScaleBand } from "d3";
import { ScaleBand as CustomScaleBand } from "../contexts/types";
import {
  renderCategoricalAxisToCanvas,
  renderNumericAxisToCanvas,
} from "./axis-utils";
import { renderLegendToCanvas } from "./legend-utils";
import { renderMetadataBarsToCanvas } from "./metadata-utils";
import {
  calculateHeatmapCells,
  calculateInlineBars,
  renderBarsToCanvas,
  renderHeatmapToCanvas,
  renderViolinsToCanvas,
} from "./rendering-utils";
import { BarData } from "./types";

/**
 * Full multi-panel export parameters
 */
export interface MultiPanelExportParams {
  canvas: HTMLCanvasElement;
  resolution: number;

  // Layout dimensions
  totalWidth: number;
  totalHeight: number;
  heatmapX: number;
  heatmapY: number;
  heatmapWidth: number;
  heatmapHeight: number;
  topGraphHeight: number;
  leftGraphWidth: number;
  leftPadding: number;
  topPadding: number;

  // Heatmap data
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  rowMaxes: Record<string, number>;
  columnMaxes: Record<string, number>;
  xScale: ScaleBand<string> | CustomScaleBand<string>;
  yScale: ScaleBand<string> | CustomScaleBand<string>;
  colorScale: (value: number) => string;
  strokeColor?: string;
  selectedValues?: Set<string>;
  normalization: string;
  columnColors?: Record<string, string>;
  rowColors?: Record<string, string>;
  defaultColor: string;
  backgroundColor: string;

  // Side graph data
  topBars?: BarData[];
  leftBars?: BarData[];
  topViolins?: Array<{
    key: string;
    path: string;
    color: string;
    x: number;
    y: number;
  }>;
  leftViolins?: Array<{
    key: string;
    path: string;
    color: string;
    x: number;
    y: number;
  }>;

  // Axes and legend data
  topGraphCounts?: Record<string, number>;
  leftGraphCounts?: Record<string, number>;
  tickLabelSize?: number;
  legendLabel?: string;
  minValueLabel?: string;
  maxValueLabel?: string;
  maxValue?: number;
  rowAxisLabel?: string;
  columnAxisLabel?: string;

  // Metadata bars
  rowMetadata?: Record<string, Record<string, string | number>>;
  columnMetadata?: Record<string, Record<string, string | number>>;
  rowSortOrders?: Array<{ key: string; direction: "asc" | "desc" }>;
  columnSortOrders?: Array<{ key: string; direction: "asc" | "desc" }>;
  getFieldDisplayName?: (field: string) => string;
  rowMetadataBarWidth?: number;
  columnMetadataBarHeight?: number;

  // Optional: metadata bars, legends, etc.
  includeAxes?: boolean;
  includeLegend?: boolean;
}

/**
 * Render complete multi-panel visualization to high-resolution canvas
 */
export function renderMultiPanelToCanvas(params: MultiPanelExportParams): void {
  const {
    canvas,
    resolution,
    totalWidth,
    totalHeight,
    heatmapX,
    heatmapY,
    heatmapWidth,
    heatmapHeight,
    topGraphHeight,
    leftGraphWidth,
    leftPadding,
    topPadding,
    rows,
    columns,
    dataMap,
    rowMaxes,
    xScale,
    yScale,
    colorScale,
    strokeColor,
    selectedValues = new Set(),
    normalization,
    columnColors,
    defaultColor,
    backgroundColor,
    topBars,
    leftBars,
    topGraphCounts = {},
    leftGraphCounts = {},
    tickLabelSize = 60,
    legendLabel = "Counts",
    minValueLabel = "1",
    maxValueLabel = "Max",
    maxValue = 100,
    rowAxisLabel,
    columnAxisLabel,
    rowMetadata,
    columnMetadata,
    rowSortOrders = [],
    columnSortOrders = [],
    getFieldDisplayName = (field) => field,
    rowMetadataBarWidth = 0,
    columnMetadataBarHeight = 0,
    includeAxes = true,
    includeLegend = true,
    topViolins,
    leftViolins,
  } = params;

  // Set canvas size to high resolution
  canvas.width = totalWidth * resolution;
  canvas.height = totalHeight * resolution;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context from canvas");
  }

  // Scale the context to match resolution
  ctx.scale(resolution, resolution);

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Render top graph if present
  if (topBars && topBars.length > 0) {
    ctx.save();
    ctx.translate(heatmapX, topPadding);
    renderBarsToCanvas(ctx, topBars, backgroundColor, true);
    ctx.restore();
  }

  // Render top violins if present
  if (topViolins && topViolins.length > 0) {
    ctx.save();
    ctx.translate(heatmapX, topPadding);
    renderViolinsToCanvas(ctx, topViolins);
    ctx.restore();
  }

  // Render top graph numeric axis (right side) - only for bars, not violins
  if (
    includeAxes &&
    topBars &&
    topBars.length > 0 &&
    topGraphCounts &&
    Object.keys(topGraphCounts).length > 0
  ) {
    const maxCount = Math.max(...Object.values(topGraphCounts), 0);
    const topAxisScale = scaleLinear({
      domain: [0, maxCount],
      range: [topGraphHeight, 0],
      nice: true,
    });

    // Axis renders on the right of top graph
    const axisWidth = 60; // Space for axis
    ctx.save();
    ctx.translate(heatmapX + heatmapWidth, topPadding);
    renderNumericAxisToCanvas(ctx, {
      scale: topAxisScale,
      orientation: "right",
      width: axisWidth,
      height: topGraphHeight,
      tickLabelSize,
      color: defaultColor,
      hideZero: true,
    });
    ctx.restore();
  }

  // Render left graph if present
  if (leftBars && leftBars.length > 0) {
    ctx.save();
    ctx.translate(leftPadding, heatmapY);
    renderBarsToCanvas(ctx, leftBars, backgroundColor, true);
    ctx.restore();
  }

  // Render left violins if present
  if (leftViolins && leftViolins.length > 0) {
    ctx.save();
    ctx.translate(leftPadding, heatmapY);
    renderViolinsToCanvas(ctx, leftViolins);
    ctx.restore();
  }

  // Render left graph numeric axis (bottom side) - only for bars, not violins
  if (
    includeAxes &&
    leftBars &&
    leftBars.length > 0 &&
    leftGraphCounts &&
    Object.keys(leftGraphCounts).length > 0
  ) {
    const maxCount = Math.max(...Object.values(leftGraphCounts), 0);
    const leftAxisScale = scaleLinear({
      domain: [maxCount, 0],
      range: [0, leftGraphWidth],
      nice: true,
    });

    // Axis renders at bottom of left graph
    const axisHeight = 60; // Space for axis (increased for label space)
    ctx.save();
    ctx.translate(leftPadding, heatmapY + heatmapHeight);
    renderNumericAxisToCanvas(ctx, {
      scale: leftAxisScale,
      orientation: "bottom",
      width: leftGraphWidth,
      height: axisHeight,
      tickLabelSize,
      color: defaultColor,
      hideZero: true,
    });
    ctx.restore();
  }

  // Render legend (top-left panel)
  if (includeLegend) {
    const legendWidth = leftGraphWidth - 16; // Leave padding
    const legendHeight = topGraphHeight - 16;
    const isVertical = legendWidth < 128;

    ctx.save();
    ctx.translate(leftPadding + 8, topPadding + 8); // Padding from edge + leftPadding offset
    renderLegendToCanvas(ctx, {
      colorScale,
      maxValue,
      minValueLabel,
      maxValueLabel,
      legendLabel,
      backgroundColor,
      textColor: defaultColor,
      width: legendWidth,
      height: legendHeight,
      orientation: isVertical ? "vertical" : "horizontal",
    });
    ctx.restore();
  }

  // Render heatmap
  ctx.save();
  ctx.translate(heatmapX, heatmapY);

  // Regular heatmap cells
  const cells = calculateHeatmapCells({
    rows,
    columns,
    dataMap,
    xScale,
    yScale,
    colorScale,
    backgroundColor,
    selectedValues,
  });

  renderHeatmapToCanvas(ctx, cells, strokeColor);

  // Render inline bars for expanded rows
  if (selectedValues.size > 0) {
    const inlineBars = calculateInlineBars({
      rows,
      columns,
      dataMap,
      rowMaxes,
      xScale,
      yScale,
      selectedValues,
      normalization,
      columnColors,
      defaultColor,
      backgroundColor,
    });

    renderHeatmapToCanvas(ctx, inlineBars);

    // Render numeric Y axis for each expanded row
    selectedValues.forEach((row) => {
      const yPos = yScale(row);
      if (yPos === undefined) return;

      const rowHeight = (yScale as CustomScaleBand<string>).bandwidth(row);
      const max =
        normalization === "Log" ? Math.log(rowMaxes[row] + 1) : rowMaxes[row];
      const domain =
        normalization === "None" || normalization === "Log" ? [0, max] : [0, 1];

      // Create scale for the expanded row's inline bars
      const expandedRowScale = scaleLinear({
        domain,
        range: [rowHeight, 0],
        nice: true,
      });

      // Render axis on the left side of the expanded row
      const axisWidth = 60;
      ctx.save();
      ctx.translate(-axisWidth, yPos);
      renderNumericAxisToCanvas(ctx, {
        scale: expandedRowScale,
        orientation: "left",
        width: axisWidth,
        height: rowHeight,
        tickLabelSize: 40,
        color: defaultColor,
        hideZero: true,
        axisLabel: row,
      });
      ctx.restore();
    });
  }

  ctx.restore();

  // Render categorical axes for heatmap
  if (includeAxes) {
    // Top axis (column names) - between boundary and top graph
    ctx.save();
    ctx.translate(heatmapX, topPadding);
    renderCategoricalAxisToCanvas(ctx, {
      values: columns,
      scale: (v: string) => xScale(v),
      bandwidth: (v?: string) =>
        typeof xScale.bandwidth === "function"
          ? xScale.bandwidth(v)
          : xScale.bandwidth,
      orientation: "horizontal",
      maxLength: 20,
      color: defaultColor,
      fontSize: 11,
      axisLabel: columnAxisLabel,
      tickLength: 6,
      totalLength: heatmapWidth,
      includeAxisLine: true,
      includeTicks: true,
    });
    ctx.restore();

    // Left axis (row names) - between boundary and left graph
    ctx.save();
    ctx.translate(leftPadding, heatmapY);
    renderCategoricalAxisToCanvas(ctx, {
      values: rows,
      scale: (v: string) => yScale(v),
      bandwidth: (v?: string) =>
        typeof yScale.bandwidth === "function"
          ? yScale.bandwidth(v)
          : yScale.bandwidth,
      orientation: "vertical",
      maxLength: 20,
      color: defaultColor,
      fontSize: 11,
      axisLabel: rowAxisLabel,
      tickLength: 6,
      totalLength: heatmapHeight,
      includeAxisLine: true,
      includeTicks: true,
      hideLabels: selectedValues,
    });
    ctx.restore();
  }

  // Render metadata bars for columns (bottom of heatmap)
  if (
    columnMetadata &&
    columnSortOrders.length > 0 &&
    columnMetadataBarHeight > 0
  ) {
    ctx.save();
    ctx.translate(heatmapX, heatmapY + heatmapHeight);
    renderMetadataBarsToCanvas(ctx, {
      axis: "X",
      keys: columns,
      metadata: columnMetadata,
      sortOrders: columnSortOrders,
      scale: (v: string) => xScale(v),
      bandwidth: (v?: string) =>
        typeof xScale.bandwidth === "function"
          ? xScale.bandwidth(v)
          : xScale.bandwidth,
      width: heatmapWidth,
      height: columnMetadataBarHeight,
      defaultColor,
      greyColor: backgroundColor === "#ffffff" ? "#cccccc" : "#666666",
      getFieldDisplayName,
    });
    ctx.restore();
  }

  // Render metadata bars for rows (right of heatmap)
  if (rowMetadata && rowSortOrders.length > 0 && rowMetadataBarWidth > 0) {
    ctx.save();
    ctx.translate(heatmapX + heatmapWidth, heatmapY);
    renderMetadataBarsToCanvas(ctx, {
      axis: "Y",
      keys: rows,
      metadata: rowMetadata,
      sortOrders: rowSortOrders,
      scale: (v: string) => yScale(v),
      bandwidth: (v?: string) =>
        typeof yScale.bandwidth === "function"
          ? yScale.bandwidth(v)
          : yScale.bandwidth,
      width: rowMetadataBarWidth,
      height: heatmapHeight,
      defaultColor,
      greyColor: backgroundColor === "#ffffff" ? "#cccccc" : "#666666",
      getFieldDisplayName,
    });
    ctx.restore();
  }
}
