import type React from "react";

interface SvgCategoricalColorLegendProps {
  /** List of category names to display */
  values: string[];
  /** Mapping of category names to their colors */
  colors: Record<string, string>;
  /** Title for the legend (e.g., "Cell Types", "Datasets") */
  title: string;
  /** Default color to use if a value doesn't have a color assigned */
  defaultColor?: string;
  /** Text color for labels */
  textColor: string;
  /** Background color */
  backgroundColor: string;
  /** X position of the legend */
  x?: number;
  /** Y position of the legend */
  y?: number;
  /** Maximum width for the legend */
  maxWidth?: number;
  /** Maximum height for the legend */
  maxHeight?: number;
  /** Orientation of the legend items */
  orientation?: "vertical" | "horizontal";
  /** Whether to show all items without truncation (ignores maxHeight constraint) */
  showAllItems?: boolean;
  /** Whether to truncate long labels (default: true) */
  truncateLabels?: boolean;
}

/**
 * SVG component for rendering categorical color legends.
 * Displays a list of categories with colored indicators (squares).
 */
export const SvgCategoricalColorLegend: React.FC<
  SvgCategoricalColorLegendProps
> = ({
  values,
  colors,
  title,
  defaultColor = "#999999",
  textColor,
  backgroundColor,
  x = 0,
  y = 0,
  maxWidth = 300,
  maxHeight = 600,
  orientation = "vertical",
  showAllItems = false,
  truncateLabels = true,
}) => {
  const padding = 12;
  const titleFontSize = 13;
  const itemFontSize = 11;
  const colorBoxSize = 12;
  const itemSpacing = 8;
  const titleMargin = 16;

  // Filter out values that don't have colors assigned or have empty colors
  const categoriesWithColors = values.filter(
    (value) => colors[value] && colors[value].trim() !== "",
  );

  // If no categories have colors, don't render anything
  if (categoriesWithColors.length === 0) {
    return null;
  }

  const isVertical = orientation === "vertical";

  // Calculate item dimensions
  const maxLabelLength = 20; // Truncate labels longer than this (when truncation enabled)
  const charWidth = itemFontSize * 0.6;
  const longestLabel = categoriesWithColors.reduce(
    (max, val) => (val.length > max.length ? val : max),
    "",
  );
  // Use actual longest label length when not truncating, otherwise respect maxLabelLength
  const effectiveLabelLength = truncateLabels
    ? Math.min(longestLabel.length, maxLabelLength)
    : longestLabel.length;
  const maxLabelWidth = effectiveLabelLength * charWidth;
  const itemWidth = colorBoxSize + 6 + maxLabelWidth + padding;
  const itemHeight = Math.max(colorBoxSize, itemFontSize) + itemSpacing;

  // Calculate legend dimensions based on orientation
  let legendWidth: number;
  let legendHeight: number;

  if (isVertical) {
    // When not truncating labels, use full item width; otherwise respect maxWidth
    legendWidth = truncateLabels ? Math.min(itemWidth, maxWidth) : itemWidth;
    const naturalHeight =
      titleFontSize + titleMargin + categoriesWithColors.length * itemHeight;
    legendHeight = showAllItems
      ? naturalHeight
      : Math.min(naturalHeight, maxHeight);
  } else {
    // Horizontal: arrange items in a grid
    const itemsPerRow = Math.floor(maxWidth / itemWidth) || 1;
    const rows = Math.ceil(categoriesWithColors.length / itemsPerRow);
    legendWidth = Math.min(itemsPerRow * itemWidth, maxWidth);
    const naturalHeight = titleFontSize + titleMargin + rows * itemHeight;
    legendHeight = showAllItems
      ? naturalHeight
      : Math.min(naturalHeight, maxHeight);
  }

  // Calculate how many items can fit (or show all if showAllItems is true)
  const availableHeight = legendHeight - titleFontSize - titleMargin;
  const maxItems = showAllItems
    ? categoriesWithColors.length
    : Math.floor(availableHeight / itemHeight);
  const displayedCategories = categoriesWithColors.slice(0, maxItems);

  return (
    <g transform={`translate(${x}, ${y})`} className="categorical-color-legend">
      {/* Background */}
      <rect
        x={0}
        y={0}
        width={legendWidth}
        height={legendHeight}
        fill={backgroundColor}
        stroke={textColor}
        strokeWidth={0.5}
        opacity={0.1}
      />

      {/* Title */}
      <text
        x={padding}
        y={padding + titleFontSize}
        fill={textColor}
        fontSize={`${titleFontSize}px`}
        fontFamily="sans-serif"
        fontWeight="bold"
        textAnchor="start"
      >
        {title}
      </text>

      {/* Legend items */}
      {displayedCategories.map((value, index) => {
        const color = colors[value] || defaultColor;
        const yPos = padding + titleFontSize + titleMargin + index * itemHeight;

        // Truncate label if needed and truncation is enabled
        const label =
          truncateLabels && value.length > maxLabelLength
            ? `${value.slice(0, maxLabelLength)}...`
            : value;

        return (
          <g key={value} className="legend-item">
            {/* Color box */}
            <rect
              x={padding}
              y={yPos}
              width={colorBoxSize}
              height={colorBoxSize}
              fill={color}
              stroke={textColor}
              strokeWidth={0.5}
            />

            {/* Label */}
            <text
              x={padding + colorBoxSize + 6}
              y={yPos + colorBoxSize / 2}
              fill={textColor}
              fontSize={`${itemFontSize}px`}
              fontFamily="sans-serif"
              textAnchor="start"
              dominantBaseline="middle"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Show ellipsis if there are more items */}
      {categoriesWithColors.length > displayedCategories.length && (
        <text
          x={padding}
          y={legendHeight - padding}
          fill={textColor}
          fontSize={`${itemFontSize}px`}
          fontFamily="sans-serif"
          textAnchor="start"
        >
          ... and {categoriesWithColors.length - displayedCategories.length}{" "}
          more
        </text>
      )}
    </g>
  );
};

/**
 * Calculate the dimensions needed for a categorical color legend
 */
export function calculateCategoricalColorLegendDimensions(
  values: string[],
  colors: Record<string, string>,
  orientation: "vertical" | "horizontal" = "vertical",
  maxWidth = 300,
  maxHeight = 600,
  showAllItems = false,
  truncateLabels = true,
): { width: number; height: number } {
  const padding = 12;
  const titleFontSize = 13;
  const itemFontSize = 11;
  const colorBoxSize = 12;
  const itemSpacing = 8;
  const titleMargin = 16;

  // Filter categories with colors
  const categoriesWithColors = values.filter(
    (value) => colors[value] && colors[value].trim() !== "",
  );

  if (categoriesWithColors.length === 0) {
    return { width: 0, height: 0 };
  }

  const isVertical = orientation === "vertical";
  const maxLabelLength = 20;
  const charWidth = itemFontSize * 0.6;
  const longestLabel = categoriesWithColors.reduce(
    (max, val) => (val.length > max.length ? val : max),
    "",
  );
  // Use actual longest label length when not truncating, otherwise respect maxLabelLength
  const effectiveLabelLength = truncateLabels
    ? Math.min(longestLabel.length, maxLabelLength)
    : longestLabel.length;
  const maxLabelWidth = effectiveLabelLength * charWidth;
  const itemWidth = colorBoxSize + 6 + maxLabelWidth + padding;
  const itemHeight = Math.max(colorBoxSize, itemFontSize) + itemSpacing;

  if (isVertical) {
    // When not truncating labels, use full item width; otherwise respect maxWidth
    const width = truncateLabels ? Math.min(itemWidth, maxWidth) : itemWidth;
    const naturalHeight =
      titleFontSize + titleMargin + categoriesWithColors.length * itemHeight;
    const height = showAllItems
      ? naturalHeight
      : Math.min(naturalHeight, maxHeight);
    return { width, height };
  } else {
    const itemsPerRow = Math.floor(maxWidth / itemWidth) || 1;
    const rows = Math.ceil(categoriesWithColors.length / itemsPerRow);
    const width = Math.min(itemsPerRow * itemWidth, maxWidth);
    const naturalHeight = titleFontSize + titleMargin + rows * itemHeight;
    const height = showAllItems
      ? naturalHeight
      : Math.min(naturalHeight, maxHeight);
    return { width, height };
  }
}
