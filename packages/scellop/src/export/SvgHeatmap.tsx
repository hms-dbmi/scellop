import { type ScaleBand, scaleLinear } from "d3";
import type React from "react";
import type { ScaleBand as CustomScaleBand } from "../contexts/types";
import { SvgNumericAxis } from "./SvgAxis";

interface SvgHeatmapProps {
  rows: string[];
  columns: string[];
  dataMap: Record<string, number>;
  rowMaxes: Record<string, number>;
  xScale: ScaleBand<string> | CustomScaleBand<string>;
  yScale: ScaleBand<string> | CustomScaleBand<string>;
  colorScale: (value: number) => string;
  selectedValues?: Set<string>;
  normalization: string;
  columnColors?: Record<string, string>;
  defaultColor: string;
  backgroundColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  axisWidth?: number; // Width allocated for inline bar chart axis
}

/**
 * SVG version of the heatmap renderer
 * Renders heatmap cells and inline bars as SVG rect elements
 */
export const SvgHeatmap: React.FC<SvgHeatmapProps> = ({
  rows,
  columns,
  dataMap,
  rowMaxes,
  xScale,
  yScale,
  colorScale,
  selectedValues = new Set(),
  normalization,
  columnColors,
  defaultColor,
  backgroundColor,
  strokeColor,
  strokeWidth = 1,
  axisWidth = 60,
}) => {
  const cellWidth = Math.ceil(xScale.bandwidth());

  return (
    <g className="heatmap">
      {rows.map((row) => {
        const cellHeight = Math.ceil(
          (yScale as CustomScaleBand<string>).bandwidth(row),
        );
        const y = yScale(row);
        if (y === undefined) return null;

        // Check if this row is expanded (showing inline bars)
        if (selectedValues.has(row)) {
          // Render inline bar chart with numeric axis
          const max =
            normalization === "Log"
              ? Math.log(rowMaxes[row] + 1)
              : rowMaxes[row];
          const domain =
            normalization === "None" || normalization === "Log"
              ? [0, max]
              : [0, 1];

          // Create inline scale for bar height
          const maxBarHeight = cellHeight;
          const inlineScale = (value: number) =>
            ((value - domain[0]) / (domain[1] - domain[0])) * maxBarHeight;

          // Create D3 scale for axis
          const axisScale = scaleLinear()
            .domain(domain)
            .range([maxBarHeight, 0]);

          return (
            <g key={row}>
              {columns.map((col) => {
                const key = `${row}-${col}`;
                const value = dataMap[key as keyof typeof dataMap] || 0;
                const x = xScale(col);
                if (x === undefined) return null;

                const barHeight = inlineScale(value);
                const yBar = y + cellHeight - barHeight;

                return (
                  <g key={col}>
                    {/* Background */}
                    <rect
                      x={x}
                      y={y}
                      width={cellWidth}
                      height={cellHeight}
                      fill={backgroundColor}
                    />
                    {/* Bar */}
                    {barHeight > 0 && (
                      <rect
                        x={x}
                        y={yBar}
                        width={cellWidth}
                        height={barHeight}
                        fill={columnColors?.[col] || defaultColor}
                      />
                    )}
                  </g>
                );
              })}
              {/* Numeric axis for inline bar chart */}
              <SvgNumericAxis
                scale={axisScale}
                orientation="left"
                width={axisWidth}
                height={cellHeight}
                tickLabelSize={30}
                color={defaultColor}
                hideZero={false}
                x={-axisWidth - 10}
                y={y}
              />
              {/* Row label as axis label - positioned between axis and boundary */}
              <text
                x={-axisWidth - 20}
                y={y + cellHeight / 2}
                fill={defaultColor}
                fontSize="11px"
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(-90, ${-axisWidth - 20}, ${y + cellHeight / 2})`}
              >
                {row}
              </text>
            </g>
          );
        }

        // Render regular heatmap cells
        return (
          <g key={row}>
            {columns.map((col) => {
              const value =
                dataMap[`${row}-${col}` as keyof typeof dataMap] || 0;
              const x = xScale(col);
              if (x === undefined) return null;

              const color = value !== 0 ? colorScale(value) : backgroundColor;

              return (
                <rect
                  key={col}
                  x={x}
                  y={y}
                  width={cellWidth}
                  height={cellHeight}
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};
