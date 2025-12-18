import React from "react";
import { BarData } from "./types";

interface SvgBarsProps {
  bars: BarData[];
  backgroundColor: string;
  drawStripes?: boolean;
}

/**
 * SVG version of the bar chart renderer
 * Renders bar segments as SVG rect elements
 */
export const SvgBars: React.FC<SvgBarsProps> = ({
  bars,
  backgroundColor,
  drawStripes = true,
}) => {
  return (
    <g className="bars">
      {bars.map((bar) => (
        <g key={bar.key}>
          {/* Background stripe */}
          {drawStripes && (
            <rect
              x={bar.backgroundX}
              y={bar.backgroundY}
              width={bar.backgroundWidth}
              height={bar.backgroundHeight}
              fill={backgroundColor}
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
            />
          ))}
        </g>
      ))}
    </g>
  );
};
