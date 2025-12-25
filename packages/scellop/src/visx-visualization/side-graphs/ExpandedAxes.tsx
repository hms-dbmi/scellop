import { useTheme } from "@mui/material/styles";
import { AxisBottom, AxisLeft } from "@visx/axis";
import type { ScaleLinear } from "d3";

interface ExpandedAxis {
  key: string;
  scale: ScaleLinear<number, number>;
  position: number;
  bandwidth: number;
  max: number;
  normalizationIsNotNone: boolean;
}

interface ExpandedAxesProps {
  expandedAxes: ExpandedAxis[];
  orientation: "rows" | "columns";
  width: number;
  height: number;
  scrollOffset: number;
  isZoomed: boolean;
  isDragging: boolean;
  draggedValue?: string | null;
}

export default function ExpandedAxes({
  expandedAxes,
  orientation,
  width,
  height,
  scrollOffset,
  isZoomed,
  isDragging,
  draggedValue,
}: ExpandedAxesProps) {
  const theme = useTheme();

  if (expandedAxes.length === 0) {
    return null;
  }

  return (
    <svg
      width={width}
      height={height + scrollOffset}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        transform: isZoomed ? `translateY(${-scrollOffset}px)` : undefined,
      }}
    >
      <title>Expanded Axes</title>
      {expandedAxes.map((axis) => {
        const AxisComponent = orientation === "rows" ? AxisLeft : AxisBottom;
        const isDraggedAxis = isDragging && draggedValue === axis.key;

        return (
          <AxisComponent
            key={axis.key}
            scale={axis.scale}
            top={orientation === "rows" ? axis.position : height - 1}
            left={
              orientation === "columns"
                ? axis.position + axis.bandwidth / 2
                : width - 1
            }
            orientation={orientation === "rows" ? "left" : "bottom"}
            stroke={
              isDraggedAxis
                ? theme.palette.primary.main
                : theme.palette.text.primary
            }
            tickStroke={
              isDraggedAxis
                ? theme.palette.primary.main
                : theme.palette.text.primary
            }
            tickFormat={
              axis.normalizationIsNotNone
                ? (v) => `${(v as number) * 100}%`
                : undefined
            }
            tickLabelProps={{
              fill: isDraggedAxis
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              fontSize: 10,
              fontFamily: theme.typography.fontFamily,
              fontWeight: isDraggedAxis ? "bold" : "normal",
            }}
            label={axis.key}
            labelProps={{
              fill: isDraggedAxis
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              fontSize: 12,
              fontFamily: theme.typography.fontFamily,
              textAnchor: "middle",
              fontWeight: isDraggedAxis ? "bold" : "normal",
            }}
          />
        );
      })}
    </svg>
  );
}
