import { formatPrefix, type ScaleLinear } from "d3";
import type React from "react";

interface SvgNumericAxisProps {
  scale: ScaleLinear<number, number>;
  orientation: "left" | "right" | "top" | "bottom";
  width: number;
  height: number;
  tickLabelSize: number;
  color: string;
  hideZero?: boolean;
  minTicks?: number;
  x?: number;
  y?: number;
}

/**
 * SVG numeric axis component for side graphs
 */
export const SvgNumericAxis: React.FC<SvgNumericAxisProps> = ({
  scale,
  orientation,
  width,
  height,
  color,
  hideZero = false,
  x = 0,
  y = 0,
}) => {
  const isVertical = orientation === "left" || orientation === "right";
  const availableSpace = isVertical ? height : width;

  // Get tick values
  let tickValues = scale.ticks();

  // Filter out zero if requested (before limiting ticks)
  if (hideZero) {
    tickValues = tickValues.filter((v) => v !== 0);
  }

  // If space is limited, reduce ticks but ensure we have at least one
  if (availableSpace < 100 && tickValues.length > 1) {
    // Keep the max value tick
    const maxTick = Math.max(...tickValues);
    tickValues = [maxTick];
  }

  // Ensure we have at least one tick
  if (tickValues.length === 0) {
    const domain = scale.domain();
    tickValues = [Math.max(...domain)];
  }

  // Format function with decimals for non-round thousands
  const maxDomain = Math.max(...scale.domain());

  const ticks = tickValues.map((value) => {
    let label: string;

    if (value < 1000) {
      // Leave values under 1000 unformatted
      label = value.toString();
    } else {
      // Check if the value is a multiple of 1000
      const isMultipleOf1000 = value % 1000 === 0;

      // Use .0 for multiples of 1000, .1 for others to show one decimal place
      const formatSpec = isMultipleOf1000 ? ".0k" : ".1k";
      const format = formatPrefix(formatSpec, maxDomain);
      label = format(value);
    }

    return {
      value,
      position: scale(value),
      label,
    };
  });

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Axis line */}
      {orientation === "right" && (
        <line x1={0} y1={0} x2={0} y2={height} stroke={color} strokeWidth={1} />
      )}
      {orientation === "left" && (
        <line
          x1={width}
          y1={0}
          x2={width}
          y2={height}
          stroke={color}
          strokeWidth={1}
        />
      )}
      {orientation === "bottom" && (
        <line x1={0} y1={0} x2={width} y2={0} stroke={color} strokeWidth={1} />
      )}

      {/* Ticks and labels */}
      {ticks.map(({ value, position, label }) => (
        <g key={value}>
          {orientation === "right" && (
            <>
              <line
                x1={0}
                y1={position}
                x2={5}
                y2={position}
                stroke={color}
                strokeWidth={1}
              />
              <text
                x={8}
                y={position}
                fill={color}
                fontSize="11px"
                fontFamily="sans-serif"
                textAnchor="start"
                dominantBaseline="middle"
              >
                {label}
              </text>
            </>
          )}
          {orientation === "left" && (
            <>
              <line
                x1={width}
                y1={position}
                x2={width - 5}
                y2={position}
                stroke={color}
                strokeWidth={1}
              />
              <text
                x={width - 8}
                y={position}
                fill={color}
                fontSize="11px"
                fontFamily="sans-serif"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {label}
              </text>
            </>
          )}
          {orientation === "bottom" && (
            <>
              <line
                x1={position}
                y1={0}
                x2={position}
                y2={5}
                stroke={color}
                strokeWidth={1}
              />
              <text
                x={position}
                y={8}
                fill={color}
                fontSize="11px"
                fontFamily="sans-serif"
                textAnchor="middle"
                dominantBaseline="hanging"
              >
                {label}
              </text>
            </>
          )}
        </g>
      ))}
    </g>
  );
};
