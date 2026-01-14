import { scaleBand, scaleLinear } from "@visx/scale";
import type { ScaleBand } from "d3";
import type React from "react";
import { useMemo } from "react";
import type { ScaleBand as CustomScaleBand } from "../contexts/types";
import { SvgNumericAxis } from "./SvgAxis";
import { SvgBars } from "./SvgBars";
import { SvgCategoricalAxis } from "./SvgCategoricalAxis";
import {
  calculateCategoricalColorLegendDimensions,
  SvgCategoricalColorLegend,
} from "./SvgCategoricalColorLegend";
import { SvgHeatmap } from "./SvgHeatmap";
import { SvgLegend } from "./SvgLegend";
import {
  calculateMetadataLabelOverhang,
  calculateSvgMetadataBarDimensions,
  SvgMetadataValueBars,
} from "./SvgMetadataValueBars";
import { SvgViolins } from "./SvgViolins";
import type { BarData } from "./types";

/**
 * Configuration for SVG export
 */
export interface SvgExportConfig {
  // Core data
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  rowMaxes: Record<string, number>;
  columnMaxes: Record<string, number>;

  // Scales
  xScale: ScaleBand<string> | CustomScaleBand<string>;
  yScale: ScaleBand<string> | CustomScaleBand<string>;

  // Colors
  colorScale: (value: number) => string;
  backgroundColor: string;
  strokeColor?: string;
  columnColors?: Record<string, string>;
  rowColors?: Record<string, string>;
  defaultColor: string;

  // State
  selectedValues?: Set<string>;
  expandedRows?: Set<string>;
  normalization: string;
  viewType?: string;

  // Dimensions
  width: number;
  height: number;

  // Panel layout
  topGraphHeight?: number;
  leftGraphWidth?: number;
  leftPadding?: number;

  // Side graphs (optional)
  topBars?: BarData[];
  leftBars?: BarData[];
  topViolins?: Array<{
    key: string;
    path: string;
    x: number;
    y: number;
    color: string;
  }>;
  leftViolins?: Array<{
    key: string;
    path: string;
    x: number;
    y: number;
    color: string;
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

  // Metadata
  rowMetadata?: Record<string, Record<string, string | number | undefined>>;
  columnMetadata?: Record<string, Record<string, string | number | undefined>>;
  rowSortOrders?: Array<{ key: string; direction: "asc" | "desc" }>;
  columnSortOrders?: Array<{ key: string; direction: "asc" | "desc" }>;
  getFieldDisplayName?: (field: string) => string;

  // Optional flags
  includeAxes?: boolean;
  includeLegend?: boolean;

  // Advanced SVG export settings
  advancedSettings?: {
    cellWidth?: number; // Width of each heatmap cell (default: 20)
    cellHeight?: number; // Height of each heatmap cell (default: 20)
    fontSize?: number; // Font size for labels (default: 11)
    tickLength?: number; // Length of axis ticks (default: 6)
    labelMargin?: number; // Gap between labels and graphs (default: 8)
    expansionRatio?: number; // Ratio for expanded rows (default: 3)
    expandedRowPadding?: number; // Padding for expanded rows (default: 8)
    legendPanelSpacing?: number; // Spacing between legend panels (default: 16)
    colorLegendLeftMargin?: number; // Margin before color legends (default: 20)
  };
}

/**
 * Complete SVG visualization component for export
 */
export const SvgVisualization: React.FC<SvgExportConfig> = (config) => {
  const {
    rows,
    columns,
    dataMap,
    rowMaxes,
    xScale,
    yScale,
    colorScale,
    backgroundColor,
    strokeColor,
    columnColors,
    defaultColor,
    selectedValues,
    expandedRows,
    normalization,
    viewType = "default",
    topGraphHeight = 0,
    leftGraphWidth = 0,
    leftPadding = 0,
    topBars,
    leftBars,
    topViolins,
    leftViolins,
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
    getFieldDisplayName,
    includeAxes = true,
    includeLegend = true,
    advancedSettings = {},
  } = config;

  // Extract advanced settings with defaults
  const {
    cellWidth = 20,
    cellHeight = 20,
    fontSize = 11,
    tickLength = 6,
    labelMargin = 8,
    expansionRatio = 3,
    expandedRowPadding = 8,
    legendPanelSpacing = 16,
    colorLegendLeftMargin = 20,
  } = advancedSettings;

  // Calculate dynamic padding based on longest labels
  const charWidth = fontSize * 0.75; // Match SvgCategoricalAxis calculation
  const axisLabelFontSize = fontSize + 2; // Axis labels are bold and larger

  const longestRowLabel = rows.reduce(
    (max, row) => (row.length > max.length ? row : max),
    "",
  );

  const longestColumnLabel = columns.reduce(
    (max, col) => (col.length > max.length ? col : max),
    "",
  );

  // Don't limit label length for proper space calculation
  const maxRowLabelLength = longestRowLabel.length;
  const maxColumnLabelLength = longestColumnLabel.length;

  // Calculate actual axis label widths based on provided labels
  const axisLabelCharWidth = axisLabelFontSize * 0.6;
  const rowAxisLabelWidth = rowAxisLabel
    ? rowAxisLabel.length * axisLabelCharWidth
    : 0;
  const columnAxisLabelWidth = columnAxisLabel
    ? columnAxisLabel.length * axisLabelCharWidth
    : 0;

  // Left padding calculation:
  // For vertical inward axis: tick labels anchor at -(tickLength + 2) with textAnchor="end"
  // So labels extend LEFT from that point by their full width (maxRowLabelWidth)
  // Axis label center is at -(tickLength + maxRowLabelWidth + 10)
  // Axis label text extends left by its width from center
  // Total space needed from axis line (at x=0) to leftmost point:
  // max(tickLength + 2 + maxRowLabelWidth, tickLength + maxRowLabelWidth + 10 + rowAxisLabelWidth)
  const maxRowLabelWidth = maxRowLabelLength * charWidth;
  const axisLabelLeftEdge =
    tickLength + maxRowLabelWidth + 10 + rowAxisLabelWidth / 2; // /2 because axis label is centered
  const calculatedLeftPadding =
    Math.max(
      100, // Minimum padding
      axisLabelLeftEdge,
    ) + labelMargin;

  // Top padding: axis line + ticks + labels + axis label + margin
  // For horizontal inward axis: similar calculation but for column labels and axis label
  const maxColumnLabelWidth = maxColumnLabelLength * charWidth;
  const columnAxisLabelTopEdge =
    tickLength + maxColumnLabelWidth + 10 + columnAxisLabelWidth / 2;
  const calculatedTopPadding =
    Math.max(
      80, // Minimum padding
      columnAxisLabelTopEdge,
    ) + labelMargin;

  // Calculate axis dimensions
  const rightAxisWidth =
    includeAxes && Object.keys(topGraphCounts).length > 0 ? 60 : 0;
  const bottomAxisHeight =
    includeAxes && Object.keys(leftGraphCounts).length > 0 ? 60 : 0;

  // Create numeric scales for axes
  const topAxisScale =
    includeAxes && Object.keys(topGraphCounts).length > 0
      ? scaleLinear({
          domain: [0, Math.max(...Object.values(topGraphCounts), 0)],
          range: [topGraphHeight, 0],
          nice: true,
        })
      : null;

  const leftAxisScale =
    includeAxes && Object.keys(leftGraphCounts).length > 0
      ? scaleLinear({
          domain: [Math.max(...Object.values(leftGraphCounts), 0), 0],
          range: [0, leftGraphWidth],
          nice: true,
        })
      : null;

  // Use config leftPadding if provided, otherwise use calculated
  // calculatedLeftPadding already includes all necessary spacing for labels and axis label
  const effectiveLeftPadding = leftPadding || calculatedLeftPadding;
  const axisSpacing = 30; // Space for top axis only
  const effectiveTopPadding = calculatedTopPadding + axisSpacing;

  // Calculate heatmap dimensions with cells
  const squareWidth = cellWidth * columns.length;
  const squareHeight = cellHeight * rows.length;

  // Recreate scales with square dimensions
  const squareXScale = xScale.copy().range([0, squareWidth]);

  // Create Y scale with proper expanded row handling
  const squareYScale = (() => {
    const effectiveExpandedRows = expandedRows || new Set<string>();

    // Base case: use regular band scale
    if (
      [0, rows.length].includes(effectiveExpandedRows.size) ||
      rows.length < 5
    ) {
      const scale = scaleBand<string>({
        range: [squareHeight, 0],
        domain: [...rows].reverse(),
        padding: 0.01,
      });
      const customScale = scale as unknown as CustomScaleBand<string>;
      customScale.lookup = (num: number) => {
        const eachBand = scale.bandwidth();
        const index = Math.floor(
          (squareHeight - (num + eachBand / 2)) / eachBand,
        );
        const maxIndex = scale.domain().length - 1;
        if (index > maxIndex) {
          return scale.domain()[maxIndex];
        }
        return scale.domain()[index];
      };
      return customScale;
    }

    // Handle expanded rows with different heights
    const expandedRowHeight =
      squareHeight / (expansionRatio + effectiveExpandedRows.size);
    const totalExpandedHeight = effectiveExpandedRows.size * expandedRowHeight;
    const totalCollapsedHeight = squareHeight - totalExpandedHeight;
    const numberOfUnselectedRows = rows.length - effectiveExpandedRows.size;
    const collapsedRowHeight = totalCollapsedHeight / numberOfUnselectedRows;

    // Split domain into sections
    const domains = rows
      .reduce(
        (acc, curr) => {
          if (effectiveExpandedRows.has(curr)) {
            acc.push([curr]);
            acc.push([]);
          } else {
            acc[acc.length - 1].push(curr);
          }
          return acc;
        },
        [[]] as string[][],
      )
      .filter((domain) => domain.length > 0)
      .reverse();

    // Calculate heights for each domain
    const heights: number[] = [];
    for (const domain of domains) {
      if (effectiveExpandedRows.has(domain[0])) {
        heights.push(expandedRowHeight);
      } else {
        heights.push(domain.length * collapsedRowHeight);
      }
    }

    // Create scales for each domain
    let cumulativeHeight = squareHeight;
    const scales = domains
      .map((domain, index) => {
        const domainHeight = heights[index];
        const initialHeight = cumulativeHeight;
        cumulativeHeight -= domainHeight;
        const isExpanded = domain.some((row) => effectiveExpandedRows.has(row));
        const rangeTop =
          cumulativeHeight + (isExpanded ? expandedRowPadding : 0);
        const rangeBottom =
          initialHeight - (isExpanded ? expandedRowPadding : 0);
        return scaleBand<string>({
          range: [rangeTop, rangeBottom],
          domain,
          padding: 0.01,
        });
      })
      .reverse();

    // Create custom scale
    const customScale = (value: string) => {
      for (const scale of scales) {
        if (scale.domain().includes(value)) {
          return scale(value);
        }
      }
      return 0;
    };

    customScale.bandwidth = (item?: string) => {
      if (item === undefined) {
        return collapsedRowHeight;
      }
      for (const scale of scales) {
        if (scale.domain().includes(item)) {
          return scale.bandwidth();
        }
      }
      return collapsedRowHeight;
    };
    customScale.domain = (newDomain?: string[]) =>
      newDomain ? customScale : rows;
    customScale.range = (newRange?: [number, number]) =>
      newRange ? customScale : ([squareHeight, 0] as [number, number]);
    customScale.rangeRound = (newRange?: [number, number]) =>
      newRange ? customScale : [squareHeight, 0];
    customScale.round = (arg?: boolean) => {
      if (arg === undefined) return false;
      scales.forEach((scale) => scale.round(arg));
      return customScale;
    };
    customScale.padding = (arg?: number) => {
      if (arg === undefined) return 0.01;
      scales.forEach((scale) => scale.padding(arg));
      return customScale;
    };
    customScale.paddingInner = (arg?: number) => {
      if (arg === undefined) return 0.01;
      scales.forEach((scale) => scale.paddingInner(arg));
      return customScale;
    };
    customScale.paddingOuter = (arg?: number) => {
      if (arg === undefined) return 0.0;
      scales.forEach((scale) => scale.paddingOuter(arg));
      return customScale;
    };
    customScale.align = (arg?: number) => {
      if (arg === undefined) return 0.5;
      scales.forEach((scale) => scale.align(arg));
      return customScale;
    };
    customScale.copy = () => customScale;
    customScale.step = () => collapsedRowHeight;
    customScale.lookup = (num: number) => {
      for (const scale of scales) {
        const [bottom, top] = scale.range();
        if (num >= bottom && num <= top) {
          const eachBand = scale.bandwidth();
          const diff = num - bottom;
          const index = Math.floor((diff + eachBand / 2) / eachBand);
          return scale.domain()[index];
        }
      }
      return "";
    };

    return customScale as unknown as CustomScaleBand<string>;
  })();

  // Calculate scale factors for adjusting side graphs to match square cells
  const originalXBandwidth =
    typeof xScale.bandwidth === "function"
      ? xScale.bandwidth()
      : xScale.bandwidth;
  const squareXBandwidth =
    typeof squareXScale.bandwidth === "function"
      ? squareXScale.bandwidth()
      : squareXScale.bandwidth;
  const originalYBandwidth =
    typeof yScale.bandwidth === "function"
      ? yScale.bandwidth()
      : yScale.bandwidth;
  const squareYBandwidth =
    typeof squareYScale.bandwidth === "function"
      ? squareYScale.bandwidth()
      : squareYScale.bandwidth;

  const xScaleFactor =
    Number(squareXBandwidth || 1) / Number(originalXBandwidth || 1);
  const yScaleFactor =
    Number(squareYBandwidth || 1) / Number(originalYBandwidth || 1);

  // Filter out "count" and "alphabetical" from sort orders for metadata bars
  const filteredColumnSortOrders = columnSortOrders.filter(
    (sort) => sort.key !== "count" && sort.key !== "alphabetical",
  );
  const filteredRowSortOrders = rowSortOrders.filter(
    (sort) => sort.key !== "count" && sort.key !== "alphabetical",
  );

  // Calculate metadata bar dimensions dynamically
  const columnMetadataBarWidth = calculateSvgMetadataBarDimensions(
    rows,
    rowMetadata,
    filteredRowSortOrders,
    "Y",
  );
  const rowMetadataBarHeight = calculateSvgMetadataBarDimensions(
    columns,
    columnMetadata,
    filteredColumnSortOrders,
    "X",
  );

  // Calculate categorical color legend dimensions
  const rowColorLegendDims =
    config.rowColors &&
    Object.values(config.rowColors).some((c) => c && c.trim() !== "")
      ? calculateCategoricalColorLegendDimensions(
          rows,
          config.rowColors,
          "vertical",
          200,
          squareHeight,
          true, // showAllItems for export
          false, // don't truncate labels for export
        )
      : { width: 0, height: 0 };

  const columnColorLegendDims =
    columnColors &&
    Object.values(columnColors).some((c) => c && c.trim() !== "")
      ? calculateCategoricalColorLegendDimensions(
          columns,
          columnColors,
          "vertical",
          200,
          squareHeight,
          true, // showAllItems for export
          false, // don't truncate labels for export
        )
      : { width: 0, height: 0 };

  // Add spacing between panels
  const totalColorLegendWidth =
    (rowColorLegendDims.width > 0 ? rowColorLegendDims.width : 0) +
    (columnColorLegendDims.width > 0 ? columnColorLegendDims.width : 0) +
    (rowColorLegendDims.width > 0 && columnColorLegendDims.width > 0
      ? legendPanelSpacing
      : 0);

  // Add spacing before color legends if they exist
  const effectiveColorLegendLeftMargin =
    totalColorLegendWidth > 0 ? colorLegendLeftMargin : 0;

  // Calculate extra space needed for metadata labels that extend beyond bars
  const rowMetadataLabelOverhang = calculateMetadataLabelOverhang(
    rows,
    rowMetadata,
    filteredRowSortOrders,
    "Y",
  );
  const columnMetadataLabelOverhang = calculateMetadataLabelOverhang(
    columns,
    columnMetadata,
    filteredColumnSortOrders,
    "X",
  );

  // Recalculate total dimensions with square heatmap, metadata bars, color legends, and label overhang
  const squareTotalWidth =
    viewType === "traditional"
      ? effectiveLeftPadding + squareWidth + rightAxisWidth
      : effectiveLeftPadding +
        leftGraphWidth +
        squareWidth +
        columnMetadataBarWidth +
        rowMetadataLabelOverhang +
        rightAxisWidth +
        effectiveColorLegendLeftMargin +
        totalColorLegendWidth;
  const squareTotalHeight =
    viewType === "traditional"
      ? effectiveTopPadding + topGraphHeight
      : effectiveTopPadding +
        topGraphHeight +
        squareHeight +
        rowMetadataBarHeight +
        columnMetadataLabelOverhang +
        bottomAxisHeight;

  // Transform left bars to use squareYScale when there are expanded rows
  const transformedLeftBars = useMemo(() => {
    if (!leftBars || leftBars.length === 0) return leftBars;

    const effectiveExpandedRows = expandedRows || new Set<string>();
    // Only transform if there are expanded rows
    if (
      effectiveExpandedRows.size === 0 ||
      effectiveExpandedRows.size === rows.length
    ) {
      return leftBars;
    }

    // Transform each bar's position and height
    return leftBars.map((bar) => {
      const originalY = bar.backgroundY;
      const originalHeight = bar.backgroundHeight;
      const squareY = squareYScale(bar.key);
      const squareBandwidth =
        typeof squareYScale.bandwidth === "function"
          ? (squareYScale.bandwidth as (item?: string) => number)(bar.key)
          : squareYScale.bandwidth;

      if (squareY === undefined || squareBandwidth === undefined) {
        return bar;
      }

      // Calculate the scale factor for this specific bar
      const originalBandwidth = originalHeight;
      const scaleFactorForBar = squareBandwidth / originalBandwidth;

      // Transform all segments
      const transformedSegments = bar.segments.map((segment) => {
        // Calculate position relative to bar start
        const relativeY = segment.y - originalY;
        const newY = squareY + relativeY * scaleFactorForBar;
        const newHeight = segment.height * scaleFactorForBar;

        return {
          ...segment,
          y: newY,
          height: newHeight,
        };
      });

      return {
        ...bar,
        backgroundY: squareY,
        backgroundHeight: squareBandwidth,
        segments: transformedSegments,
      };
    });
  }, [leftBars, squareYScale, expandedRows, rows.length]);

  // Similarly for top bars (though they typically don't have expansion)
  const transformedTopBars = useMemo(() => {
    if (!topBars || topBars.length === 0) return topBars;
    // Top bars use xScale which is always uniform, so just apply simple scale factor
    return topBars;
  }, [topBars]);

  return (
    <svg
      width={squareTotalWidth}
      height={squareTotalHeight}
      xmlns="http://www.w3.org/2000/svg"
      style={{ backgroundColor }}
    >
      <title>Scellop Visualization</title>
      <g
        className="visualization"
        transform={`translate(${effectiveLeftPadding}, 0)`}
      >
        {/* Legend (top-left panel) */}
        {includeLegend && viewType !== "traditional" && (
          <SvgLegend
            colorScale={colorScale}
            maxValue={maxValue}
            minValueLabel={minValueLabel}
            maxValueLabel={maxValueLabel}
            legendLabel={legendLabel}
            backgroundColor={backgroundColor}
            textColor={defaultColor}
            width={leftGraphWidth - 16}
            height={topGraphHeight - 16}
            orientation={leftGraphWidth < 128 ? "vertical" : "horizontal"}
            x={8}
            y={effectiveTopPadding + 8}
          />
        )}

        {/* Top side graphs */}
        {transformedTopBars && transformedTopBars.length > 0 && (
          <g
            transform={`translate(${leftGraphWidth}, ${effectiveTopPadding}) scale(${xScaleFactor}, 1)`}
            className="top-bars"
          >
            <SvgBars
              bars={transformedTopBars}
              backgroundColor={backgroundColor}
              drawStripes={true}
              orderedValues={columns}
              stripeEvenColor="#eeeeee"
              stripeOddColor="#ffffff"
            />
          </g>
        )}

        {topViolins && topViolins.length > 0 && (
          <g
            transform={`translate(${leftGraphWidth}, ${effectiveTopPadding}) scale(${xScaleFactor}, 1)`}
            className="top-violins"
          >
            <SvgViolins violins={topViolins} />
          </g>
        )}

        {/* Top graph numeric axis (right side) */}
        {topAxisScale &&
          transformedTopBars &&
          transformedTopBars.length > 0 && (
            <SvgNumericAxis
              scale={topAxisScale}
              orientation="right"
              width={60}
              height={topGraphHeight}
              tickLabelSize={tickLabelSize}
              color={defaultColor}
              hideZero={true}
              x={
                viewType === "traditional"
                  ? squareWidth
                  : leftGraphWidth + squareWidth
              }
              y={effectiveTopPadding}
            />
          )}

        {/* Left side graphs */}
        {viewType !== "traditional" &&
          transformedLeftBars &&
          transformedLeftBars.length > 0 && (
            <g
              transform={`translate(${0}, ${effectiveTopPadding + topGraphHeight})`}
              className="left-bars"
            >
              <SvgBars
                bars={transformedLeftBars}
                backgroundColor={backgroundColor}
                drawStripes={true}
                orderedValues={rows}
                stripeEvenColor="#eeeeee"
                stripeOddColor="#ffffff"
              />
            </g>
          )}

        {viewType !== "traditional" &&
          leftViolins &&
          leftViolins.length > 0 && (
            <g
              transform={`translate(0, ${effectiveTopPadding + topGraphHeight}) scale(1, ${yScaleFactor})`}
              className="left-violins"
            >
              <SvgViolins violins={leftViolins} />
            </g>
          )}

        {/* Left graph numeric axis (bottom side) */}
        {viewType !== "traditional" &&
          leftAxisScale &&
          transformedLeftBars &&
          transformedLeftBars.length > 0 && (
            <SvgNumericAxis
              scale={leftAxisScale}
              orientation="bottom"
              width={leftGraphWidth}
              height={60}
              tickLabelSize={tickLabelSize}
              color={defaultColor}
              hideZero={true}
              x={0}
              y={effectiveTopPadding + topGraphHeight + squareHeight}
            />
          )}

        {/* Main heatmap */}
        {viewType !== "traditional" && (
          <g
            transform={`translate(${leftGraphWidth}, ${effectiveTopPadding + topGraphHeight})`}
            className="heatmap"
          >
            <SvgHeatmap
              rows={rows}
              columns={columns}
              dataMap={dataMap}
              rowMaxes={rowMaxes}
              xScale={squareXScale}
              yScale={squareYScale}
              colorScale={colorScale}
              selectedValues={selectedValues}
              normalization={normalization}
              columnColors={columnColors}
              defaultColor={defaultColor}
              backgroundColor={backgroundColor}
              strokeColor={strokeColor}
            />
          </g>
        )}

        {/* Metadata value bars for columns (bottom of heatmap) */}
        {viewType !== "traditional" &&
          columnMetadata &&
          filteredColumnSortOrders.length > 0 && (
            <SvgMetadataValueBars
              axis="X"
              keys={columns}
              metadata={columnMetadata}
              sortOrders={filteredColumnSortOrders}
              scale={(v) => {
                const pos = squareXScale(v);
                return pos;
              }}
              bandwidth={() => {
                const bw = squareXScale.bandwidth;
                return typeof bw === "function" ? bw() : bw;
              }}
              x={leftGraphWidth}
              y={effectiveTopPadding + topGraphHeight + squareHeight}
              width={squareWidth}
              height={rowMetadataBarHeight}
              defaultColor={defaultColor}
              greyColor={backgroundColor === "#ffffff" ? "#cccccc" : "#666666"}
              getFieldDisplayName={getFieldDisplayName}
            />
          )}

        {/* Metadata value bars for rows (right of heatmap) */}
        {viewType !== "traditional" &&
          rowMetadata &&
          filteredRowSortOrders.length > 0 && (
            <SvgMetadataValueBars
              axis="Y"
              keys={rows}
              metadata={rowMetadata}
              sortOrders={filteredRowSortOrders}
              scale={(v) => {
                const pos = squareYScale(v);
                return pos;
              }}
              bandwidth={() => {
                const bw = squareYScale.bandwidth;
                return typeof bw === "function" ? bw() : bw;
              }}
              x={leftGraphWidth + squareWidth}
              y={effectiveTopPadding + topGraphHeight}
              width={columnMetadataBarWidth}
              height={squareHeight}
              defaultColor={defaultColor}
              greyColor={backgroundColor === "#ffffff" ? "#cccccc" : "#666666"}
              getFieldDisplayName={getFieldDisplayName}
            />
          )}

        {/* Categorical axes for heatmap */}
        {includeAxes && (
          <>
            {/* Top axis (column names) - with space for axis label */}
            <SvgCategoricalAxis
              values={columns}
              scale={(v) => {
                const pos = squareXScale(v);
                return pos;
              }}
              bandwidth={() => {
                const bw = squareXScale.bandwidth;
                return typeof bw === "function" ? bw() : bw;
              }}
              orientation="horizontal"
              maxLength={20}
              color={defaultColor}
              fontSize={11}
              x={leftGraphWidth}
              y={effectiveTopPadding}
              className="top-axis"
              axisLabel={columnAxisLabel}
              totalLength={squareWidth}
              tickLength={6}
            />
            {/* Left axis (row names) - with space for axis label */}
            {viewType !== "traditional" && (
              <SvgCategoricalAxis
                values={rows}
                scale={(v) => {
                  const pos = squareYScale(v);
                  return pos;
                }}
                bandwidth={() => {
                  const bw = squareYScale.bandwidth;
                  return typeof bw === "function" ? bw() : bw;
                }}
                orientation="vertical"
                maxLength={1000}
                color={defaultColor}
                fontSize={11}
                x={0}
                y={topGraphHeight + effectiveTopPadding}
                className="left-axis"
                axisLabel={rowAxisLabel}
                totalLength={squareHeight}
                tickLength={6}
                hideLabels={selectedValues}
              />
            )}
          </>
        )}

        {/* Categorical color legends panel (right side) */}
        {viewType !== "traditional" && (
          <>
            {/* Row color legend */}
            {config.rowColors &&
              rowColorLegendDims.width > 0 &&
              rowAxisLabel && (
                <SvgCategoricalColorLegend
                  values={rows}
                  colors={config.rowColors}
                  title={rowAxisLabel}
                  defaultColor={defaultColor}
                  textColor={defaultColor}
                  backgroundColor={backgroundColor}
                  x={
                    leftGraphWidth +
                    squareWidth +
                    columnMetadataBarWidth +
                    rightAxisWidth +
                    effectiveColorLegendLeftMargin
                  }
                  y={effectiveTopPadding + topGraphHeight}
                  maxWidth={200}
                  maxHeight={squareHeight}
                  orientation="vertical"
                  showAllItems={true}
                  truncateLabels={false}
                />
              )}

            {/* Column color legend */}
            {columnColors &&
              columnColorLegendDims.width > 0 &&
              columnAxisLabel && (
                <SvgCategoricalColorLegend
                  values={columns}
                  colors={columnColors}
                  title={columnAxisLabel}
                  defaultColor={defaultColor}
                  textColor={defaultColor}
                  backgroundColor={backgroundColor}
                  x={
                    leftGraphWidth +
                    squareWidth +
                    columnMetadataBarWidth +
                    rightAxisWidth +
                    effectiveColorLegendLeftMargin +
                    (rowColorLegendDims.width > 0
                      ? rowColorLegendDims.width + legendPanelSpacing
                      : 0)
                  }
                  y={effectiveTopPadding + topGraphHeight}
                  maxWidth={200}
                  maxHeight={squareHeight}
                  orientation="vertical"
                  showAllItems={true}
                  truncateLabels={false}
                />
              )}
          </>
        )}
      </g>
    </svg>
  );
};
