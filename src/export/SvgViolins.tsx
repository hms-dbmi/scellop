import React from "react";

interface ViolinData {
  key: string;
  path: string;
  x: number;
  y: number;
  color: string;
}

interface SvgViolinsProps {
  violins: ViolinData[];
}

/**
 * SVG version of the violin plot renderer
 * Renders violin plots as SVG path elements
 */
export const SvgViolins: React.FC<SvgViolinsProps> = ({ violins }) => {
  return (
    <g className="violins">
      {violins.map((violin) => (
        <g key={violin.key} transform={`translate(${violin.x}, ${violin.y})`}>
          <path
            d={violin.path}
            fill={violin.color}
            stroke={violin.color}
            strokeWidth={1}
          />
        </g>
      ))}
    </g>
  );
};
