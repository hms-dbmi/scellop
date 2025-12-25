import { Download } from "@mui/icons-material";
import {
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useColorScale } from "../../contexts/ColorScaleContext";
import { useParentRef } from "../../contexts/ContainerRefContext";
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
  const visualizationContainerRef = useParentRef();
  const trackEvent = useTrackEvent();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filename, setFilename] = useState("scellop-visualization");
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [exportFormat, setExportFormat] = useState<"png" | "svg">("png");
  const [resolution, setResolution] = useState<number>(2);
  const [exportLegendsAsSeparateFile, setExportLegendsAsSeparateFile] =
    useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

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

  // Calculate maximum safe resolution based on browser canvas limits
  const maxResolution = useMemo(() => {
    if (!dimensions) return 5; // Default fallback

    const maxSize = getMaxCanvasSize();
    const maxArea = getMaxCanvasArea();

    // Calculate max resolution based on dimension constraints
    const maxFromSize = Math.floor(
      maxSize / Math.max(dimensions.width, dimensions.height),
    );

    // Calculate max resolution based on area constraints
    const maxFromArea = Math.floor(
      Math.sqrt(maxArea / (dimensions.width * dimensions.height)),
    );

    // Use the more restrictive limit, with a minimum of 1 and reasonable upper bound
    return Math.max(1, Math.min(maxFromSize, maxFromArea, 100));
  }, [dimensions]);

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

  // Update dimensions when parent ref changes
  useEffect(() => {
    const updateDimensions = () => {
      if (visualizationContainerRef?.current) {
        const rect = visualizationContainerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateDimensions();

    // Update dimensions on window resize
    const handleResize = () => updateDimensions();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [visualizationContainerRef]);

  const exportAsPNG = useCallback(async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      trackEvent?.("Export Visualization", "png");

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
        : isLogTransformed
          ? Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
              Math.log(
                Object.values(dataMap).reduce(
                  (max, val) => Math.max(max, val),
                  0,
                ) + 1,
              ),
            )
          : Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
              Object.values(dataMap).reduce(
                (max, val) => Math.max(max, val),
                0,
              ),
            );

      const maxValue = isLogTransformed
        ? Math.log(
            Object.values(dataMap).reduce((max, val) => Math.max(max, val), 0) +
              1,
          )
        : Object.values(dataMap).reduce((max, val) => Math.max(max, val), 0);

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
    resolution,
    filename,
    includeTimestamp,
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
        : isLogTransformed
          ? Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
              Math.log(
                Object.values(dataMap).reduce(
                  (max, val) => Math.max(max, val),
                  0,
                ) + 1,
              ),
            )
          : Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
              Object.values(dataMap).reduce(
                (max, val) => Math.max(max, val),
                0,
              ),
            );

      const maxValue = isLogTransformed
        ? Math.log(
            Object.values(dataMap).reduce((max, val) => Math.max(max, val), 0) +
              1,
          )
        : Object.values(dataMap).reduce((max, val) => Math.max(max, val), 0);

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
      <Stack direction="column" spacing={1} width="100%">
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

      {/* Resolution Configuration - only for PNG */}
      {exportFormat === "png" && (
        <Stack direction="column" spacing={1} width="100%">
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
