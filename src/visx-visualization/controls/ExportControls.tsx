import { Download, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useMemo, useState } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useColorScale } from "../../contexts/ColorScaleContext";
import {
  useColumnCounts,
  useColumnMaxes,
  useColumns,
  useData,
  useFractionDataMap,
  useRowCounts,
  useRowMaxes,
  useRows,
} from "../../contexts/DataContext";
import {
  useHeatmapDimensions,
  usePanelDimensions,
} from "../../contexts/DimensionsContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import {
  useLeftGraphType,
  useTopGraphType,
} from "../../contexts/IndividualGraphTypeContext";
import { useGetFieldDisplayName } from "../../contexts/MetadataConfigContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import { useViewType } from "../../contexts/ViewTypeContext";
import { calculateMetadataBarDimensions } from "../../export/metadata-utils";
import { renderMultiPanelToCanvas } from "../../export/multi-panel-export";
import { calculateBars, calculateViolins } from "../../export/side-graph-utils";
import {
  exportAsSvg,
  exportCategoricalLegendsAsSvg,
} from "../../export/svg-export";
import { UserAgentTester } from "../../utils/user-agent";

/**
 * Browsers have different maximum canvas dimensions, so we detect the browser
 * to determine the appropriate maximum canvas size.
 * Source: https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 * @param navigatorString User agent string to analyze - defaults to current browser, useful for testing
 * @returns Maximum canvas dimension (width or height) supported by the browser
 */
const getMaxCanvasSize = (navigatorString = navigator.userAgent) => {
  const ua = new UserAgentTester(navigatorString);

  switch (true) {
    case ua.isMobile():
      if (ua.isChrome()) {
        if (ua.getChromeVersion() >= 91) {
          return 65535; // Mobile Chrome 91+ increased max canvas size
        }
        return 32767; // Older Mobile Chrome max canvas size
      }
      return 4096; // Conservative size for mobile safari, which only supports 4096 x 4096 exports
    case ua.isChrome():
      if (ua.getChromeVersion() >= 73) {
        // if version 73+, Chrome increased max canvas size to 65535
        return 65535;
      }
      // Fall back to previous max size for older versions
      return 32767;
    case ua.isFirefox():
      return 32767; // Firefox max canvas size
    case ua.isSafari():
      return 16384; // Safari max canvas size is reported as 4,194,303, but actual limit is lower
    case ua.isEdge():
      if (ua.getEdgeVersion() >= 79) {
        return 65535; // Newer Edge versions based on Chromium match new Chrome limits
      }
      return 16384; // Edge max canvas size for older versions
    default:
      return 16384; // Fallback conservative value that works for all browsers newer than IE 10
  }
};

/**
 * Get maximum canvas area supported by the browser
 * Source: https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 * @param navigatorString User agent string to analyze - defaults to current browser, useful for testing
 * @returns Maximum total canvas area for the browser
 */
const getMaxCanvasArea = (navigatorString = navigator.userAgent) => {
  const ua = new UserAgentTester(navigatorString);
  switch (true) {
    case ua.isMobile():
      if (ua.isChrome() && ua.isAndroid()) {
        const isNewChrome = ua.getChromeVersion() >= 91;
        switch (ua.getAndroidVersion()) {
          case 5:
            return (isNewChrome ? 11180 : 11402) ** 2;
          case 6:
            return (isNewChrome ? 16384 : 10836) ** 2;
          case 7:
            return 14188 ** 2;
          default:
            return 16384 ** 2;
        }
      }
      return 4096 ** 2; // Mobile Safari max canvas area

    case ua.isChrome():
      return 16384 ** 2;
    case ua.isFirefox():
      if (ua.getFirefoxVersion() >= 122) {
        return 23168 ** 2; // Newer Firefox versions increased max canvas area
      }
      return 11180 ** 2; // Older Firefox max canvas area
    case ua.isSafari():
      return 16384 ** 2;
    case ua.isEdge():
      return 16384 ** 2;
    default:
      return 8192 ** 2; // Fallback conservative value that works for all browsers
  }
};

/**
 * ExportControls component provides functionality to export the visualization as PNG or SVG
 */
export default function ExportControls() {
  const trackEvent = useTrackEvent();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filename, setFilename] = useState("scellop-visualization");
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [exportFormat, setExportFormat] = useState<"png" | "svg">("png");
  const [resolution, setResolution] = useState<number>(2);
  const [exportLegendsAsSeparateFile, setExportLegendsAsSeparateFile] =
    useState(false);

  // Advanced SVG export settings
  const [cellWidth, setCellWidth] = useState(20);
  const [cellHeight, setCellHeight] = useState(20);
  const [fontSize, setFontSize] = useState(11);
  const [tickLength, setTickLength] = useState(6);
  const [labelMargin, setLabelMargin] = useState(8);
  const [expansionRatio, setExpansionRatio] = useState(3);
  const [expandedRowPadding, setExpandedRowPadding] = useState(8);
  const [legendPanelSpacing, setLegendPanelSpacing] = useState(16);
  const [colorLegendLeftMargin, setColorLegendLeftMargin] = useState(20);

  const theme = useTheme();

  // Get visualization data and state
  const rows = useRows();
  const columns = useColumns();
  const normalization = useNormalization((s) => s.normalization);
  const dataMap = useFractionDataMap(normalization);
  const rawDataMap = useFractionDataMap("None"); // For stacked bars
  const rowNormalizedDataMap = useFractionDataMap("Row"); // For top violins
  const columnNormalizedDataMap = useFractionDataMap("Column"); // For left violins
  const rowMaxes = useRowMaxes();
  const columnMaxes = useColumnMaxes();
  const rowCounts = useRowCounts();
  const columnCounts = useColumnCounts();
  const xScale = useXScale();
  const yScale = useYScale();
  const { width: heatmapWidth, height: heatmapHeight } = useHeatmapDimensions();
  const topGraphDims = usePanelDimensions("center_top");
  const leftGraphDims = usePanelDimensions("left_middle");
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const columnColors = useColumnConfig((s) => s.colors);
  const rowColors = useRowConfig((s) => s.colors);
  const leftGraphType = useLeftGraphType();
  const topGraphType = useTopGraphType();
  const removedRows = useData((s) => s.removedRows);
  const removedColumns = useData((s) => s.removedColumns);
  const rowConfig = useRowConfig();
  const columnConfig = useColumnConfig();
  const viewType = useViewType((s) => s.viewType);

  // Get metadata and sort orders for metadata bars
  const metadata = useData((s) => s.data.metadata);
  const rowMetadata = metadata?.rows;
  const columnMetadata = metadata?.cols;
  const rowSortOrders = useData((s) => s.rowSortOrder);
  const columnSortOrders = useData((s) => s.columnSortOrder);
  const getFieldDisplayName = useGetFieldDisplayName();

  // Get color scale based on normalization
  const { countsScale, percentageScale, logScale } = useColorScale();
  const colorScale =
    normalization === "None"
      ? countsScale
      : normalization === "Log"
        ? logScale
        : percentageScale;

  // Calculate actual export dimensions including all padding, axes, and metadata
  const calculateExportDimensions = useCallback(() => {
    // Calculate layout dimensions
    const topGraphHeight = topGraphDims.height;
    const leftGraphWidth = leftGraphDims.width;

    // Calculate leftPadding based on longest row label
    const fontSize = 11;
    const longestRowLabel = rows.reduce(
      (max, row) => (row.length > max.length ? row : max),
      "",
    );
    const maxRowLabelLength = Math.min(longestRowLabel.length, 20);
    const charWidth = fontSize * 0.6; // Approximate character width
    const tickLength = 6;
    const axisLabelSpace = 20; // Space for axis label
    const margin = 16; // Margin from edge
    const leftPadding = Math.max(
      120,
      margin + axisLabelSpace + tickLength + maxRowLabelLength * charWidth + 4,
    ); // Padding for left axis (margin + axis label + ticks + labels + spacing)

    // Calculate topPadding based on longest column label
    const longestColumnLabel = columns.reduce(
      (max, col) => (col.length > max.length ? col : max),
      "",
    );
    const maxColumnLabelLength = Math.min(longestColumnLabel.length, 20);
    const topPadding = Math.max(
      100,
      margin +
        axisLabelSpace +
        tickLength +
        maxColumnLabelLength * charWidth +
        4,
    ); // Padding for top axis (margin + axis label + ticks + labels + spacing)

    const rightAxisWidth = 60; // Space for top graph axis
    const bottomAxisHeight = 60; // Space for left graph axis (increased for label space)
    const categoricalAxisSpace = 500; // Space for rotated column labels and row labels

    // Calculate metadata bar dimensions dynamically
    const rowMetadataBarWidth = calculateMetadataBarDimensions(
      rows,
      rowMetadata,
      rowSortOrders,
      "Y",
    );
    const columnMetadataBarHeight = calculateMetadataBarDimensions(
      columns,
      columnMetadata,
      columnSortOrders,
      "X",
    );

    const totalWidth =
      leftPadding +
      leftGraphWidth +
      heatmapWidth +
      rowMetadataBarWidth +
      rightAxisWidth +
      categoricalAxisSpace;
    const totalHeight =
      topPadding +
      topGraphHeight +
      heatmapHeight +
      columnMetadataBarHeight +
      bottomAxisHeight +
      categoricalAxisSpace;

    return { width: totalWidth, height: totalHeight };
  }, [
    topGraphDims.height,
    leftGraphDims.width,
    rows,
    columns,
    rowMetadata,
    columnMetadata,
    rowSortOrders,
    columnSortOrders,
    heatmapWidth,
    heatmapHeight,
  ]);

  // Calculate maximum safe resolution based on browser canvas limits
  const maxResolution = useMemo(() => {
    // Calculate actual export dimensions
    const exportDimensions = calculateExportDimensions();

    const maxSize = getMaxCanvasSize();
    const maxArea = getMaxCanvasArea();

    // Calculate max resolution based on dimension constraints
    const maxFromSize = Math.floor(
      maxSize / Math.max(exportDimensions.width, exportDimensions.height),
    );

    // Calculate max resolution based on area constraints
    const maxFromArea = Math.floor(
      Math.sqrt(maxArea / (exportDimensions.width * exportDimensions.height)),
    );

    // Use the more restrictive limit, with a minimum of 1 and reasonable upper bound
    return Math.max(1, Math.min(maxFromSize, maxFromArea, 100));
  }, [calculateExportDimensions]);

  // Generate slider marks based on max resolution
  const sliderMarks = useMemo(() => {
    const marks = [{ value: 1, label: "1x" }];

    // Add intermediate marks
    const step = Math.max(1, Math.floor(maxResolution / 5));
    for (let i = step; i < maxResolution; i += step) {
      if (i > 1) {
        marks.push({ value: i, label: `${i}x` });
      }
    }

    // Always add the max value
    if (maxResolution > 1) {
      marks.push({ value: maxResolution, label: `${maxResolution}x` });
    }

    return marks;
  }, [maxResolution]);

  const exportAsPNG = useCallback(async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      trackEvent?.("Export Visualization", "png");

      // Calculate actual export dimensions using the helper function
      const { width: totalWidth, height: totalHeight } =
        calculateExportDimensions();

      // Calculate layout dimensions (needed for rendering)
      const topGraphHeight = topGraphDims.height;
      const leftGraphWidth = leftGraphDims.width;

      // Calculate leftPadding based on longest row label
      const fontSize = 11;
      const longestRowLabel = rows.reduce(
        (max, row) => (row.length > max.length ? row : max),
        "",
      );
      const maxRowLabelLength = Math.min(longestRowLabel.length, 20);
      const charWidth = fontSize * 0.6; // Approximate character width
      const tickLength = 6;
      const axisLabelSpace = 20; // Space for axis label
      const margin = 16; // Margin from edge
      const leftPadding = Math.max(
        120,
        margin +
          axisLabelSpace +
          tickLength +
          maxRowLabelLength * charWidth +
          4,
      ); // Padding for left axis (margin + axis label + ticks + labels + spacing)

      // Calculate topPadding based on longest column label
      const longestColumnLabel = columns.reduce(
        (max, col) => (col.length > max.length ? col : max),
        "",
      );
      const maxColumnLabelLength = Math.min(longestColumnLabel.length, 20);
      const topPadding = Math.max(
        100,
        margin +
          axisLabelSpace +
          tickLength +
          maxColumnLabelLength * charWidth +
          4,
      ); // Padding for top axis (margin + axis label + ticks + labels + spacing)

      // Calculate metadata bar dimensions dynamically
      const rowMetadataBarWidth = calculateMetadataBarDimensions(
        rows,
        rowMetadata,
        rowSortOrders,
        "Y",
      );
      const columnMetadataBarHeight = calculateMetadataBarDimensions(
        columns,
        columnMetadata,
        columnSortOrders,
        "X",
      );

      // Calculate side graph data
      const topBars =
        topGraphType !== "Violins"
          ? calculateBars({
              orientation: "columns",
              counts: columnCounts,
              orderedValues: columns,
              removedValues: removedColumns,
              categoricalScale: xScale.scale,
              domainLimit: topGraphHeight,
              graphType: topGraphType,
              normalization,
              stackValues: rows,
              removedStackValues: removedRows,
              rawDataMap,
              normalizedDataMap: dataMap,
              colorScale: {
                countsScale,
                percentageScale,
                logScale,
              },
              axisColors: columnColors,
              oppositeAxisColors: rowColors,
              defaultColor: theme.palette.text.primary,
              selectedValues,
            })
          : undefined;

      const leftBars =
        leftGraphType !== "Violins"
          ? calculateBars({
              orientation: "rows",
              counts: rowCounts,
              orderedValues: rows,
              removedValues: removedRows,
              categoricalScale: yScale.scale,
              domainLimit: leftGraphWidth,
              graphType: leftGraphType,
              normalization,
              stackValues: columns,
              removedStackValues: removedColumns,
              rawDataMap,
              normalizedDataMap: dataMap,
              colorScale: {
                countsScale,
                percentageScale,
                logScale,
              },
              axisColors: rowColors,
              oppositeAxisColors: columnColors,
              defaultColor: theme.palette.text.primary,
              selectedValues,
            })
          : undefined;

      // Calculate violin plots for PNG export if needed
      const topViolins =
        topGraphType === "Violins"
          ? calculateViolins({
              orientation: "columns",
              orderedValues: columns,
              removedValues: removedColumns,
              categoricalScale: xScale.scale,
              domainLimit: topGraphHeight,
              tickLabelSize: 0, // Full span for PNG export
              rows,
              columns,
              fractionDataMap: rowNormalizedDataMap,
              color: theme.palette.text.primary,
              selectedValues,
              width: heatmapWidth,
              height: topGraphHeight,
            })
          : undefined;

      const leftViolins =
        leftGraphType === "Violins"
          ? calculateViolins({
              orientation: "rows",
              orderedValues: rows,
              removedValues: removedRows,
              categoricalScale: yScale.scale,
              domainLimit: leftGraphWidth,
              tickLabelSize: 0, // Full span for PNG export
              rows,
              columns,
              fractionDataMap: columnNormalizedDataMap,
              color: theme.palette.text.primary,
              selectedValues,
              width: leftGraphWidth,
              height: heatmapHeight,
            })
          : undefined;

      // Create offscreen canvas for high-resolution rendering
      const canvas = document.createElement("canvas");

      // Calculate legend labels
      const isNormalized =
        normalization === "Row" || normalization === "Column";
      const isLogTransformed = normalization === "Log";

      const legendLabel = isNormalized
        ? `Percent of all cells in ${normalization}`
        : isLogTransformed
          ? "Log Counts"
          : "Counts";

      const minValueLabel = isNormalized ? "0%" : "1";
      const maxValueLabel = isNormalized
        ? "100%"
        : Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
            Object.values(dataMap).reduce((max, val) => Math.max(max, val), 0),
          );

      // dataMap already contains normalized/log-transformed values based on normalization setting
      const maxValue = Object.values(dataMap).reduce(
        (max, val) => Math.max(max, val),
        0,
      );

      // Render complete multi-panel visualization
      renderMultiPanelToCanvas({
        canvas,
        resolution,
        totalWidth,
        totalHeight,
        heatmapX: leftPadding + leftGraphWidth,
        heatmapY: topPadding + topGraphHeight,
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
        columnMaxes,
        xScale: xScale.scale,
        yScale: yScale.scale,
        colorScale,
        strokeColor: colorScale(colorScale.domain()[1] / 2),
        selectedValues,
        normalization,
        columnColors,
        rowColors,
        defaultColor: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        topBars,
        leftBars,
        topViolins,
        leftViolins,
        topGraphCounts: columnCounts,
        leftGraphCounts: rowCounts,
        tickLabelSize: Math.max(xScale.tickLabelSize, yScale.tickLabelSize),
        legendLabel,
        minValueLabel,
        maxValueLabel,
        maxValue,
        rowAxisLabel: rowConfig.pluralLabel,
        columnAxisLabel: columnConfig.pluralLabel,
        rowMetadata,
        columnMetadata,
        rowSortOrders,
        columnSortOrders,
        getFieldDisplayName,
        rowMetadataBarWidth,
        columnMetadataBarHeight,
        includeAxes: true,
        includeLegend: true,
      });

      // Create download link
      const link = document.createElement("a");
      const baseFilename = filename.trim() || "scellop-visualization";
      const timestamp = includeTimestamp
        ? `-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`
        : "";
      link.download = `${baseFilename}${timestamp}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      trackEvent?.("export_visualization_success", "png");
    } catch (error) {
      console.error("Failed to export visualization:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setExportError(`Export failed: ${errorMessage}`);
      trackEvent?.("export_visualization_error", errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [
    trackEvent,
    calculateExportDimensions,
    topGraphDims.height,
    leftGraphDims.width,
    heatmapWidth,
    heatmapHeight,
    topGraphType,
    leftGraphType,
    columnCounts,
    rowCounts,
    columns,
    rows,
    removedColumns,
    removedRows,
    xScale.scale,
    xScale.tickLabelSize,
    yScale.scale,
    yScale.tickLabelSize,
    normalization,
    rawDataMap,
    dataMap,
    countsScale,
    percentageScale,
    logScale,
    columnColors,
    rowColors,
    theme.palette.text.primary,
    theme.palette.background.default,
    selectedValues,
    rowMaxes,
    columnMaxes,
    colorScale,
    resolution,
    filename,
    includeTimestamp,
    rowMetadata,
    columnMetadata,
    rowSortOrders,
    columnSortOrders,
    getFieldDisplayName,
    rowConfig.pluralLabel,
    columnConfig.pluralLabel,
    rowNormalizedDataMap,
    columnNormalizedDataMap,
  ]);

  const exportAsSVG = useCallback(async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      trackEvent?.("Export Visualization", "svg");

      const baseFilename = filename.trim() || "scellop-visualization";
      const timestamp = includeTimestamp
        ? `-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`
        : "";

      // Calculate layout dimensions
      const topGraphHeight = topGraphDims.height;
      const leftGraphWidth = leftGraphDims.width;
      // Note: leftPadding will be calculated internally by SvgVisualization based on label lengths

      // Calculate side graph data (same as PNG export)
      const topBars =
        topGraphType !== "Violins"
          ? calculateBars({
              orientation: "columns",
              counts: columnCounts,
              orderedValues: columns,
              removedValues: removedColumns,
              categoricalScale: xScale.scale,
              domainLimit: topGraphHeight,
              graphType: topGraphType,
              normalization,
              stackValues: rows,
              removedStackValues: removedRows,
              rawDataMap,
              normalizedDataMap: dataMap,
              colorScale: {
                countsScale,
                percentageScale,
                logScale,
              },
              axisColors: columnColors,
              oppositeAxisColors: rowColors,
              defaultColor: theme.palette.text.primary,
              selectedValues,
            })
          : undefined;

      const leftBars =
        leftGraphType !== "Violins"
          ? calculateBars({
              orientation: "rows",
              counts: rowCounts,
              orderedValues: rows,
              removedValues: removedRows,
              categoricalScale: yScale.scale,
              domainLimit: leftGraphWidth,
              graphType: leftGraphType,
              normalization,
              stackValues: columns,
              removedStackValues: removedColumns,
              rawDataMap,
              normalizedDataMap: dataMap,
              colorScale: {
                countsScale,
                percentageScale,
                logScale,
              },
              axisColors: rowColors,
              oppositeAxisColors: columnColors,
              defaultColor: theme.palette.text.primary,
              selectedValues,
            })
          : undefined;

      // Calculate violin plots if needed
      const topViolins =
        topGraphType === "Violins"
          ? calculateViolins({
              orientation: "columns",
              orderedValues: columns,
              removedValues: removedColumns,
              categoricalScale: xScale.scale,
              domainLimit: topGraphHeight,
              tickLabelSize: xScale.tickLabelSize,
              rows,
              columns,
              fractionDataMap: rowNormalizedDataMap,
              color: theme.palette.text.primary,
              selectedValues,
              width: heatmapWidth,
              height: topGraphHeight,
            })
          : undefined;

      const leftViolins =
        leftGraphType === "Violins"
          ? calculateViolins({
              orientation: "rows",
              orderedValues: rows,
              removedValues: removedRows,
              categoricalScale: yScale.scale,
              domainLimit: leftGraphWidth,
              tickLabelSize: yScale.tickLabelSize,
              rows,
              columns,
              fractionDataMap: columnNormalizedDataMap,
              color: theme.palette.text.primary,
              selectedValues,
              width: leftGraphWidth,
              height: heatmapHeight,
            })
          : undefined;

      console.log(
        "SVG Export - Top violins:",
        topViolins?.length,
        topGraphType,
      );
      console.log(
        "SVG Export - Left violins:",
        leftViolins?.length,
        leftGraphType,
      );

      // Calculate legend labels (same as PNG export)
      const isNormalized =
        normalization === "Row" || normalization === "Column";
      const isLogTransformed = normalization === "Log";

      const legendLabel = isNormalized
        ? `Percent of all cells in ${normalization}`
        : isLogTransformed
          ? "Log Counts"
          : "Counts";

      const minValueLabel = isNormalized ? "0%" : "1";
      const maxValueLabel = isNormalized
        ? "100%"
        : Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
            Object.values(dataMap).reduce((max, val) => Math.max(max, val), 0),
          );

      // dataMap already contains normalized/log-transformed values based on normalization setting
      const maxValue = Object.values(dataMap).reduce(
        (max, val) => Math.max(max, val),
        0,
      );

      // Export SVG with all panels
      exportAsSvg(
        {
          rows,
          columns,
          dataMap,
          rowMaxes,
          columnMaxes,
          xScale: xScale.scale,
          yScale: yScale.scale,
          colorScale,
          backgroundColor: theme.palette.background.default,
          strokeColor: colorScale(colorScale.domain()[1] / 2),
          columnColors,
          rowColors,
          defaultColor: theme.palette.text.primary,
          selectedValues,
          expandedRows: selectedValues,
          normalization,
          viewType,
          width: heatmapWidth,
          height: heatmapHeight,
          topBars,
          leftBars,
          topViolins,
          leftViolins,
          topGraphHeight,
          leftGraphWidth,
          // leftPadding will be calculated internally by SvgVisualization
          topGraphCounts: columnCounts,
          leftGraphCounts: rowCounts,
          tickLabelSize: Math.max(xScale.tickLabelSize, yScale.tickLabelSize),
          legendLabel,
          minValueLabel,
          maxValueLabel,
          maxValue,
          rowAxisLabel: rowConfig.pluralLabel,
          columnAxisLabel: columnConfig.pluralLabel,
          rowMetadata,
          columnMetadata,
          rowSortOrders,
          columnSortOrders,
          getFieldDisplayName,
          includeAxes: true,
          includeLegend: true,
          advancedSettings: {
            cellWidth,
            cellHeight,
            fontSize,
            tickLength,
            labelMargin,
            expansionRatio,
            expandedRowPadding,
            legendPanelSpacing,
            colorLegendLeftMargin,
          },
        },
        `${baseFilename}${timestamp}.svg`,
      );

      // Export categorical legends as separate file if requested
      if (
        exportLegendsAsSeparateFile &&
        (rowColors || columnColors) &&
        (rowConfig.pluralLabel || columnConfig.pluralLabel)
      ) {
        exportCategoricalLegendsAsSvg(
          {
            rows,
            rowColors,
            rowAxisLabel: rowConfig.pluralLabel,
            columns,
            columnColors,
            columnAxisLabel: columnConfig.pluralLabel,
            backgroundColor: theme.palette.background.default,
            textColor: theme.palette.text.primary,
            defaultColor: theme.palette.text.primary,
            orientation: "vertical",
            maxLegendWidth: 300,
            maxLegendHeight: 600,
            spacing: 20,
            padding: 16,
          },
          `${baseFilename}${timestamp}-legends.svg`,
        );
      }

      trackEvent?.("export_visualization_success", "svg");
    } catch (error) {
      console.error("Failed to export visualization:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setExportError(`Export failed: ${errorMessage}`);
      trackEvent?.("export_visualization_error", errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [
    trackEvent,
    filename,
    includeTimestamp,
    topGraphDims.height,
    leftGraphDims.width,
    topGraphType,
    leftGraphType,
    columnCounts,
    rowCounts,
    columns,
    rows,
    removedColumns,
    removedRows,
    xScale.scale,
    yScale.scale,
    normalization,
    rawDataMap,
    dataMap,
    countsScale,
    percentageScale,
    logScale,
    columnColors,
    rowColors,
    theme.palette.text.primary,
    theme.palette.background.default,
    selectedValues,
    rowMaxes,
    columnMaxes,
    colorScale,
    heatmapWidth,
    heatmapHeight,
    exportLegendsAsSeparateFile,
    rowConfig.pluralLabel,
    columnConfig.pluralLabel,
    cellWidth,
    cellHeight,
    fontSize,
    tickLength,
    labelMargin,
    expansionRatio,
    expandedRowPadding,
    legendPanelSpacing,
    colorLegendLeftMargin,
  ]);

  const handleExport = useCallback(() => {
    if (exportFormat === "png") {
      exportAsPNG();
    } else {
      exportAsSVG();
    }
  }, [exportFormat, exportAsPNG, exportAsSVG]);

  return (
    <Stack spacing={3} alignItems="start" width="100%">
      <Typography variant="h6" component="h3">
        Export Visualization
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Export the heatmap as a high-quality PNG or scalable SVG file.
      </Typography>

      {/* Format Selection */}
      <FormControl component="fieldset">
        <Typography variant="subtitle2" gutterBottom>
          Export Format
        </Typography>
        <RadioGroup
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as "png" | "svg")}
          row
        >
          <FormControlLabel
            value="png"
            control={<Radio />}
            label="PNG (Raster)"
          />
          <FormControlLabel
            value="svg"
            control={<Radio />}
            label="SVG (Vector)"
          />
        </RadioGroup>
        <FormHelperText>
          {exportFormat === "png"
            ? "PNG exports render at specified resolution, producing sharp raster images."
            : "SVG exports are infinitely scalable vector graphics, ideal for publications."}
        </FormHelperText>
      </FormControl>

      {/* Filename Configuration */}
      <Stack direction="column" spacing={2} width="100%">
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            variant="outlined"
            sx={{ flex: 1, minWidth: 200 }}
            placeholder="scellop-visualization"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
              />
            }
            label="Include timestamp"
          />
        </Stack>
        <FormHelperText>
          Customize the exported file name. The timestamp will be automatically
          added if enabled to prevent filename conflicts.
        </FormHelperText>
      </Stack>

      {/* Categorical Legends Export Option - only for SVG */}
      {exportFormat === "svg" &&
        ((rowColors &&
          Object.values(rowColors).some((c) => c && c.trim() !== "") &&
          rowConfig.pluralLabel) ||
          (columnColors &&
            Object.values(columnColors).some((c) => c && c.trim() !== "") &&
            columnConfig.pluralLabel)) && (
          <FormControlLabel
            control={
              <Checkbox
                checked={exportLegendsAsSeparateFile}
                onChange={(e) =>
                  setExportLegendsAsSeparateFile(e.target.checked)
                }
              />
            }
            label="Export categorical color legends as separate file"
          />
        )}

      {/* Advanced SVG Settings - only for SVG */}
      {exportFormat === "svg" && (
        <Accordion sx={{ width: "100%" }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Advanced Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2} width="100%">
              <Typography variant="body2" color="text.secondary">
                Fine-tune the SVG export layout and sizing parameters.
              </Typography>

              {/* Cell Width */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Cell Width: {cellWidth}px
                </Typography>
                <Slider
                  value={cellWidth}
                  onChange={(_, value) => setCellWidth(value as number)}
                  min={5}
                  max={50}
                  step={1}
                  marks={[{ value: 5 }, { value: 20 }, { value: 50 }]}
                  valueLabelDisplay="auto"
                  aria-label="Heatmap cell width"
                />
                <FormHelperText>
                  Width of each heatmap cell in pixels.
                </FormHelperText>
              </Stack>

              {/* Cell Height */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Cell Height: {cellHeight}px
                </Typography>
                <Slider
                  value={cellHeight}
                  onChange={(_, value) => setCellHeight(value as number)}
                  min={5}
                  max={50}
                  step={1}
                  marks={[{ value: 5 }, { value: 20 }, { value: 50 }]}
                  valueLabelDisplay="auto"
                  aria-label="Heatmap cell height"
                />
                <FormHelperText>
                  Height of each heatmap cell in pixels.
                </FormHelperText>
              </Stack>

              {/* Font Size */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Font Size: {fontSize}px
                </Typography>
                <Slider
                  value={fontSize}
                  onChange={(_, value) => setFontSize(value as number)}
                  min={6}
                  max={20}
                  step={1}
                  marks={[{ value: 6 }, { value: 11 }, { value: 20 }]}
                  valueLabelDisplay="auto"
                  aria-label="Label font size"
                />
                <FormHelperText>
                  Font size for axis labels and other text elements.
                </FormHelperText>
              </Stack>

              {/* Tick Length */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Tick Length: {tickLength}px
                </Typography>
                <Slider
                  value={tickLength}
                  onChange={(_, value) => setTickLength(value as number)}
                  min={0}
                  max={20}
                  step={1}
                  marks={[{ value: 0 }, { value: 6 }, { value: 20 }]}
                  valueLabelDisplay="auto"
                  aria-label="Axis tick length"
                />
                <FormHelperText>Length of axis tick marks.</FormHelperText>
              </Stack>

              {/* Label Margin */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Label Margin: {labelMargin}px
                </Typography>
                <Slider
                  value={labelMargin}
                  onChange={(_, value) => setLabelMargin(value as number)}
                  min={0}
                  max={30}
                  step={1}
                  marks={[{ value: 0 }, { value: 8 }, { value: 30 }]}
                  valueLabelDisplay="auto"
                  aria-label="Gap between labels and graphs"
                />
                <FormHelperText>
                  Gap between labels and side graphs.
                </FormHelperText>
              </Stack>

              {/* Expansion Ratio */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Expansion Ratio: {expansionRatio}x
                </Typography>
                <Slider
                  value={expansionRatio}
                  onChange={(_, value) => setExpansionRatio(value as number)}
                  min={1}
                  max={10}
                  step={0.5}
                  marks={[{ value: 1 }, { value: 3 }, { value: 10 }]}
                  valueLabelDisplay="auto"
                  aria-label="Expanded row size ratio"
                />
                <FormHelperText>
                  Size ratio for expanded rows relative to collapsed rows.
                </FormHelperText>
              </Stack>

              {/* Expanded Row Padding */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Expanded Row Padding: {expandedRowPadding}px
                </Typography>
                <Slider
                  value={expandedRowPadding}
                  onChange={(_, value) =>
                    setExpandedRowPadding(value as number)
                  }
                  min={0}
                  max={30}
                  step={1}
                  marks={[{ value: 0 }, { value: 8 }, { value: 30 }]}
                  valueLabelDisplay="auto"
                  aria-label="Padding for expanded rows"
                />
                <FormHelperText>
                  Vertical padding between expanded rows and other rows.
                </FormHelperText>
              </Stack>

              {/* Legend Panel Spacing */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Legend Panel Spacing: {legendPanelSpacing}px
                </Typography>
                <Slider
                  value={legendPanelSpacing}
                  onChange={(_, value) =>
                    setLegendPanelSpacing(value as number)
                  }
                  min={0}
                  max={50}
                  step={2}
                  marks={[{ value: 0 }, { value: 16 }, { value: 50 }]}
                  valueLabelDisplay="auto"
                  aria-label="Spacing between legend panels"
                />
                <FormHelperText>
                  Horizontal spacing between categorical legend panels.
                </FormHelperText>
              </Stack>

              {/* Color Legend Left Margin */}
              <Stack direction="column" spacing={1}>
                <Typography variant="body2" gutterBottom>
                  Color Legend Left Margin: {colorLegendLeftMargin}px
                </Typography>
                <Slider
                  value={colorLegendLeftMargin}
                  onChange={(_, value) =>
                    setColorLegendLeftMargin(value as number)
                  }
                  min={0}
                  max={50}
                  step={2}
                  marks={[{ value: 0 }, { value: 20 }, { value: 50 }]}
                  valueLabelDisplay="auto"
                  aria-label="Margin before color legends"
                />
                <FormHelperText>
                  Left margin before categorical color legends.
                </FormHelperText>
              </Stack>

              {/* Reset Button */}
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setCellWidth(20);
                  setCellHeight(20);
                  setFontSize(11);
                  setTickLength(6);
                  setLabelMargin(8);
                  setExpansionRatio(3);
                  setExpandedRowPadding(8);
                  setLegendPanelSpacing(16);
                  setColorLegendLeftMargin(20);
                }}
              >
                Reset to Defaults
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Resolution Configuration - only for PNG */}
      {exportFormat === "png" && (
        <Stack direction="column" spacing={2} width="100%">
          <FormControl fullWidth>
            <Typography variant="body2" gutterBottom>
              Export Resolution: {resolution}x
              {` (${Math.round(heatmapWidth * resolution)} × ${Math.round(heatmapHeight * resolution)} pixels)`}
            </Typography>
            <Slider
              value={Math.min(resolution, maxResolution)}
              onChange={(_, value) => setResolution(value as number)}
              min={1}
              max={maxResolution}
              step={1}
              marks={sliderMarks}
              valueLabelDisplay="auto"
              aria-label="Export resolution multiplier"
            />
          </FormControl>
          <FormHelperText>
            Higher resolutions produce sharper images but take longer to
            generate and result in larger file sizes. The maximum available
            export resolution is determined by the base resolution of the
            visualization and the capabilities of your browser.
          </FormHelperText>
        </Stack>
      )}

      <Box width="100%">
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isExporting}
          startIcon={
            isExporting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Download />
            )
          }
          fullWidth
          size="large"
        >
          {isExporting
            ? "Exporting..."
            : `Export as ${exportFormat.toUpperCase()}`}
        </Button>
      </Box>

      {exportError && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {exportError}
        </Alert>
      )}

      <Alert
        severity="info"
        sx={{
          width: "100%",
          "& .MuiAlert-message": {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        }}
      >
        <AlertTitle>Export Quality</AlertTitle>
        <Typography
          variant="body2"
          component="ul"
          sx={{ margin: 0, paddingLeft: 2 }}
        >
          <li>
            <strong>PNG exports</strong> render the heatmap at high resolution
            directly to Canvas, producing crisp images that remain sharp when
            zoomed
          </li>
          <li>
            <strong>SVG exports</strong> create infinitely scalable vector
            graphics, perfect for publications and presentations
          </li>
          <li>Ensure all data is fully loaded before exporting</li>
          {exportFormat === "png" && (
            <li>
              Higher resolution settings produce sharper images but result in
              larger file sizes
            </li>
          )}
        </Typography>
      </Alert>
    </Stack>
  );
}
