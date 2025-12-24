import React from "react";

interface SvgCategoricalAxisProps {
  values: string[];
  scale: (value: string) => number | undefined;
  bandwidth: (value?: string) => number;
  orientation: "horizontal" | "vertical";
  maxLength: number;
  color: string;
  fontSize?: number;
  x?: number;
  y?: number;
  className?: string;
  axisLabel?: string;
  totalLength?: number;
  tickLength?: number;
  hideLabels?: Set<string>; // Set of values to hide labels for
}

/**
 * SVG categorical axis component for row/column labels
 */
export const SvgCategoricalAxis: React.FC<SvgCategoricalAxisProps> = ({
  values,
  scale,
  bandwidth,
  orientation,
  maxLength,
  color,
  fontSize = 11,
  x = 0,
  y = 0,
  className,
  axisLabel,
  totalLength = 0,
  tickLength = 6,
  hideLabels,
}) => {
  const tickSign = -1; // Always inward

  // Calculate the longest label length for proper axis label positioning
  const longestLabel = values.reduce(
    (max, val) => (val.length > max.length ? val : max),
    "",
  );
  const charWidth = fontSize * 0.75; // Conservative estimate for sans-serif fonts
  const maxLabelWidth = Math.min(longestLabel.length, maxLength) * charWidth;

  return (
    <g transform={`translate(${x}, ${y})`} className={className}>
      {/* Axis line */}
      {orientation === "horizontal" ? (
        <line
          x1={0}
          y1={0}
          x2={totalLength}
          y2={0}
          stroke={color}
          strokeWidth={1}
        />
      ) : (
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={totalLength}
          stroke={color}
          strokeWidth={1}
        />
      )}

      {/* Axis label */}
      {axisLabel && (
        <text
          x={
            orientation === "horizontal"
              ? totalLength / 2
              : -(tickLength + maxLabelWidth + 10)
          }
          y={
            orientation === "horizontal"
              ? -(tickLength + maxLabelWidth + 10)
              : totalLength / 2
          }
          fill={color}
          fontSize={`${fontSize + 2}px`}
          fontFamily="sans-serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={
            orientation === "vertical"
              ? `rotate(-90, ${-(tickLength + maxLabelWidth + 20)}, ${totalLength / 2})`
              : undefined
          }
        >
          {axisLabel}
        </text>
      )}

      {/* Tick marks and labels */}
      {values.map((value) => {
        const position = scale(value);
        if (position === undefined) return null;

        const size = bandwidth(value);
        const center = position + size / 2;

        // Skip label if in hideLabels set
        const shouldHideLabel = hideLabels?.has(value);

        // Truncate label if needed
        const label =
          value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

        if (orientation === "horizontal") {
          // Horizontal axis - ticks and labels adjust based on direction
          const tickY2 = tickSign * tickLength;
          const labelY = tickSign * (tickLength + 2);

          return (
            <g key={value}>
              {/* Tick mark */}
              <line
                x1={center}
                y1={0}
                x2={center}
                y2={tickY2}
                stroke={color}
                strokeWidth={1}
              />
              {/* Label - rotated -90 degrees */}
              {!shouldHideLabel && (
                <text
                  x={center}
                  y={labelY}
                  fill={color}
                  fontSize={`${fontSize}px`}
                  fontFamily="sans-serif"
                  textAnchor="start"
                  dominantBaseline="middle"
                  transform={`rotate(-90, ${center}, ${labelY})`}
                >
                  {label}
                </text>
              )}
            </g>
          );
        } else {
          // Vertical axis - ticks and labels adjust based on direction
          const tickX2 = tickSign * tickLength;
          const labelX = tickSign * (tickLength + 2);

          return (
            <g key={value}>
              {/* Tick mark */}
              <line
                x1={0}
                y1={center}
                x2={tickX2}
                y2={center}
                stroke={color}
                strokeWidth={1}
              />
              {/* Label */}
              {!shouldHideLabel && (
                <text
                  x={labelX}
                  y={center}
                  fill={color}
                  fontSize={`${fontSize}px`}
                  fontFamily="sans-serif"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {label}
                </text>
              )}
            </g>
          );
        }
      })}
    </g>
  );
};
