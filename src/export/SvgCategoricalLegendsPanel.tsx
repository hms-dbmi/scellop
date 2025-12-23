import React from "react";
import {
    calculateCategoricalColorLegendDimensions,
    SvgCategoricalColorLegend,
} from "./SvgCategoricalColorLegend";

/**
 * Configuration for categorical legends panel export
 */
export interface SvgCategoricalLegendsPanelConfig {
  // Row legend
  rows?: string[];
  rowColors?: Record<string, string>;
  rowAxisLabel?: string;

  // Column legend
  columns?: string[];
  columnColors?: Record<string, string>;
  columnAxisLabel?: string;

  // Appearance
  backgroundColor: string;
  textColor: string;
  defaultColor?: string;

  // Layout
  orientation?: "vertical" | "horizontal";
  maxLegendWidth?: number;
  maxLegendHeight?: number;
  spacing?: number;
  padding?: number;
}

/**
 * Standalone SVG component that renders categorical color legends as a separate panel.
 * This can be exported as a separate SVG file alongside the main visualization.
 */
export const SvgCategoricalLegendsPanel: React.FC<
  SvgCategoricalLegendsPanelConfig
> = ({
  rows = [],
  rowColors = {},
  rowAxisLabel,
  columns = [],
  columnColors = {},
  columnAxisLabel,
  backgroundColor,
  textColor,
  defaultColor = "#999999",
  orientation = "vertical",
  maxLegendWidth = 300,
  maxLegendHeight = 600,
  spacing = 20,
  padding = 16,
}) => {
  // Calculate dimensions for each legend
  const rowLegendDims =
    rows.length > 0 &&
    rowColors &&
    Object.values(rowColors).some((c) => c && c.trim() !== "") &&
    rowAxisLabel
      ? calculateCategoricalColorLegendDimensions(
          rows,
          rowColors,
          orientation,
          maxLegendWidth,
          maxLegendHeight,
          true, // showAllItems for export
          false, // don't truncate labels for export
        )
      : { width: 0, height: 0 };

  const columnLegendDims =
    columns.length > 0 &&
    columnColors &&
    Object.values(columnColors).some((c) => c && c.trim() !== "") &&
    columnAxisLabel
      ? calculateCategoricalColorLegendDimensions(
          columns,
          columnColors,
          orientation,
          maxLegendWidth,
          maxLegendHeight,
          true, // showAllItems for export
          false, // don't truncate labels for export
        )
      : { width: 0, height: 0 };

  // If no legends to display, return null
  if (rowLegendDims.width === 0 && columnLegendDims.width === 0) {
    return null;
  }

  // Calculate panel dimensions
  const hasRowLegend = rowLegendDims.width > 0;
  const hasColumnLegend = columnLegendDims.width > 0;

  let panelWidth: number;
  let panelHeight: number;

  if (orientation === "vertical") {
    // Stack legends horizontally
    panelWidth =
      padding * 2 +
      rowLegendDims.width +
      columnLegendDims.width +
      (hasRowLegend && hasColumnLegend ? spacing : 0);
    panelHeight =
      padding * 2 + Math.max(rowLegendDims.height, columnLegendDims.height);
  } else {
    // Stack legends vertically
    panelWidth =
      padding * 2 + Math.max(rowLegendDims.width, columnLegendDims.width);
    panelHeight =
      padding * 2 +
      rowLegendDims.height +
      columnLegendDims.height +
      (hasRowLegend && hasColumnLegend ? spacing : 0);
  }

  return (
    <svg
      width={panelWidth}
      height={panelHeight}
      xmlns="http://www.w3.org/2000/svg"
      style={{ backgroundColor }}
    >
      <title>Categorical Color Legends</title>

      {/* Row legend */}
      {hasRowLegend && rowAxisLabel && (
        <SvgCategoricalColorLegend
          values={rows}
          colors={rowColors}
          title={rowAxisLabel}
          defaultColor={defaultColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
          x={padding}
          y={padding}
          maxWidth={maxLegendWidth}
          maxHeight={maxLegendHeight}
          orientation={orientation}
          showAllItems={true}
          truncateLabels={false}
        />
      )}

      {/* Column legend */}
      {hasColumnLegend && columnAxisLabel && (
        <SvgCategoricalColorLegend
          values={columns}
          colors={columnColors}
          title={columnAxisLabel}
          defaultColor={defaultColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
          x={
            orientation === "vertical"
              ? padding + rowLegendDims.width + (hasRowLegend ? spacing : 0)
              : padding
          }
          y={
            orientation === "vertical"
              ? padding
              : padding + rowLegendDims.height + (hasRowLegend ? spacing : 0)
          }
          maxWidth={maxLegendWidth}
          maxHeight={maxLegendHeight}
          orientation={orientation}
          showAllItems={true}
          truncateLabels={false}
        />
      )}
    </svg>
  );
};

/**
 * Calculate dimensions needed for the categorical legends panel
 */
export function calculateCategoricalLegendsPanelDimensions(
  config: SvgCategoricalLegendsPanelConfig,
): { width: number; height: number } {
  const {
    rows = [],
    rowColors = {},
    rowAxisLabel,
    columns = [],
    columnColors = {},
    columnAxisLabel,
    orientation = "vertical",
    maxLegendWidth = 300,
    maxLegendHeight = 600,
    spacing = 20,
    padding = 16,
  } = config;

  // Calculate dimensions for each legend
  const rowLegendDims =
    rows.length > 0 &&
    rowColors &&
    Object.values(rowColors).some((c) => c && c.trim() !== "") &&
    rowAxisLabel
      ? calculateCategoricalColorLegendDimensions(
          rows,
          rowColors,
          orientation,
          maxLegendWidth,
          maxLegendHeight,
          true, // showAllItems for export
          false, // don't truncate labels for export
        )
      : { width: 0, height: 0 };

  const columnLegendDims =
    columns.length > 0 &&
    columnColors &&
    Object.values(columnColors).some((c) => c && c.trim() !== "") &&
    columnAxisLabel
      ? calculateCategoricalColorLegendDimensions(
          columns,
          columnColors,
          orientation,
          maxLegendWidth,
          maxLegendHeight,
          true, // showAllItems for export
          false, // don't truncate labels for export
        )
      : { width: 0, height: 0 };

  // If no legends to display
  if (rowLegendDims.width === 0 && columnLegendDims.width === 0) {
    return { width: 0, height: 0 };
  }

  const hasRowLegend = rowLegendDims.width > 0;
  const hasColumnLegend = columnLegendDims.width > 0;

  if (orientation === "vertical") {
    // Stack legends horizontally
    return {
      width:
        padding * 2 +
        rowLegendDims.width +
        columnLegendDims.width +
        (hasRowLegend && hasColumnLegend ? spacing : 0),
      height:
        padding * 2 + Math.max(rowLegendDims.height, columnLegendDims.height),
    };
  } else {
    // Stack legends vertically
    return {
      width:
        padding * 2 + Math.max(rowLegendDims.width, columnLegendDims.width),
      height:
        padding * 2 +
        rowLegendDims.height +
        columnLegendDims.height +
        (hasRowLegend && hasColumnLegend ? spacing : 0),
    };
  }
}
