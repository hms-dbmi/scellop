import React from "react";
import { BarData } from "./types";

interface SvgBarsProps {
  bars: BarData[];
  backgroundColor: string;
  drawStripes?: boolean;
  orderedValues?: string[];
  stripeEvenColor?: string;
  stripeOddColor?: string;
}

/**
 * SVG version of the bar chart renderer
 * Renders bar segments as SVG rect elements
 */
export const SvgBars: React.FC<SvgBarsProps> = ({
  bars,
  backgroundColor,
  drawStripes = true,
  orderedValues,
  stripeEvenColor,
  stripeOddColor,
}) => {
  return (
    <g className="bars">
      {bars.map((bar) => {
        // Determine stripe color based on position in ordered values
        let stripeColor = backgroundColor;
        if (drawStripes && orderedValues && stripeEvenColor && stripeOddColor) {
          const barIndex = orderedValues.indexOf(bar.key);
          stripeColor = barIndex % 2 === 0 ? stripeEvenColor : stripeOddColor;
        }

        return (
          <g key={bar.key}>
            {/* Background stripe */}
            {drawStripes && (
              <rect
                x={bar.backgroundX}
                y={bar.backgroundY}
                width={bar.backgroundWidth}
                height={bar.backgroundHeight}
                fill={stripeColor}
              />
            )}
            {/* Bar segments */}
            {bar.segments.map((segment, i) => (
              <rect
                key={`${bar.key}-segment-${i}`}
                x={segment.x}
                y={segment.y}
                width={segment.width}
                height={segment.height}
                fill={segment.color}
                stroke={backgroundColor}
                strokeWidth={0.5}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
};
