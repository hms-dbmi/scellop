import React from "react";

interface SvgLegendProps {
  colorScale: (value: number) => string;
  maxValue: number;
  minValueLabel: string;
  maxValueLabel: string;
  legendLabel: string;
  backgroundColor: string;
  textColor: string;
  width: number;
  height: number;
  orientation: "horizontal" | "vertical";
  x?: number;
  y?: number;
}

/**
 * SVG legend component for color scale visualization
 */
export const SvgLegend: React.FC<SvgLegendProps> = ({
  colorScale,
  maxValue,
  minValueLabel,
  maxValueLabel,
  legendLabel,
  backgroundColor,
  textColor,
  width,
  height,
  orientation,
  x = 0,
  y = 0,
}) => {
  const isVertical = orientation === "vertical";
  const padding = 8;
  const labelHeight = 20;
  const legendBarThickness = 32;
  const zeroBoxSize = 32;

  // Calculate layout
  const legendBarLength = isVertical
    ? height - labelHeight - zeroBoxSize - padding * 3
    : width - zeroBoxSize - padding * 3;

  const currentY = padding;

  // Sample colors for gradient
  const samples = 100;
  const colorStops = Array.from({ length: samples + 1 }, (_, i) => {
    const value = (i / samples) * maxValue;
    const color = colorScale(value);
    const offset = `${(i / samples) * 100}%`;
    return { color, offset };
  });

  const gradientId = `legend-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Legend bar position
  const legendLabelY = currentY + 12;
  const legendX = isVertical
    ? (width - legendBarThickness) / 2
    : padding + zeroBoxSize + padding;
  const legendY = legendLabelY + padding;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id={gradientId}
          x1={isVertical ? "0%" : "0%"}
          y1={isVertical ? "100%" : "0%"}
          x2={isVertical ? "0%" : "100%"}
          y2={isVertical ? "0%" : "0%"}
        >
          {colorStops.map((stop, i) => (
            <stop key={i} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>

      {/* Legend label */}
      <text
        x={isVertical ? width / 2 : padding}
        y={legendLabelY}
        fill={textColor}
        fontSize="12px"
        fontFamily="sans-serif"
        textAnchor={isVertical ? "middle" : "start"}
      >
        {legendLabel}
      </text>

      {/* Zero value indicator - horizontal orientation */}
      {!isVertical && (
        <g>
          <rect
            x={padding}
            y={legendY}
            width={zeroBoxSize}
            height={zeroBoxSize}
            fill={backgroundColor}
            stroke={textColor}
            strokeWidth={1}
          />
          <text
            x={padding + zeroBoxSize / 2}
            y={legendY + zeroBoxSize / 2}
            fill={textColor}
            fontSize="11px"
            fontFamily="sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            0
          </text>
        </g>
      )}

      {/* Gradient legend bar */}
      <rect
        x={legendX}
        y={legendY}
        width={isVertical ? legendBarThickness : legendBarLength}
        height={isVertical ? legendBarLength : legendBarThickness}
        fill={`url(#${gradientId})`}
      />

      {/* Min/Max labels */}
      {isVertical ? (
        <>
          <text
            x={legendX + legendBarThickness / 2}
            y={legendY + legendBarLength + 12}
            fill={textColor}
            fontSize="11px"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            {minValueLabel}
          </text>
          <text
            x={legendX + legendBarThickness / 2}
            y={legendY - 4}
            fill={textColor}
            fontSize="11px"
            fontFamily="sans-serif"
            textAnchor="middle"
            dominantBaseline="auto"
          >
            {maxValueLabel}
          </text>
          {/* Zero indicator below (vertical orientation) */}
          <g>
            <rect
              x={legendX}
              y={legendY + legendBarLength + 28}
              width={legendBarThickness}
              height={zeroBoxSize}
              fill={backgroundColor}
              stroke={textColor}
              strokeWidth={1}
            />
            <text
              x={legendX + legendBarThickness / 2}
              y={legendY + legendBarLength + 28 + zeroBoxSize / 2}
              fill={textColor}
              fontSize="11px"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              0
            </text>
          </g>
        </>
      ) : (
        <>
          <text
            x={legendX + 4}
            y={legendY + legendBarThickness / 2}
            fill={textColor}
            fontSize="11px"
            fontFamily="sans-serif"
            textAnchor="start"
            dominantBaseline="middle"
          >
            {minValueLabel}
          </text>
          <text
            x={legendX + legendBarLength - 4}
            y={legendY + legendBarThickness / 2}
            fill={textColor}
            fontSize="11px"
            fontFamily="sans-serif"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {maxValueLabel}
          </text>
        </>
      )}
    </g>
  );
};
