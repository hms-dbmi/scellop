import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ScaleBand, ScaleLinear } from "d3";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import {
  useColumnCounts,
  useData,
  useRowCounts,
} from "../../contexts/DataContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";

interface BarsProps {
  orientation: "horizontal" | "vertical";
  categoricalScale: ScaleBand<string>;
  numericalScale: ScaleLinear<number, number>;
  domainLimit: number;
  selectedValues?: Set<string>;
  nonExpandedSize: number;
  width: number;
  height: number;
}

function useCurrentCounts(orientation: string) {
  const rowCounts = useRowCounts();
  const columnCounts = useColumnCounts();
  return orientation === "vertical" ? columnCounts : rowCounts;
}

function useCurrentMetadata(orientation: string) {
  return useData((s) =>
    orientation === "vertical" ? s.data.metadata.cols : s.data.metadata.rows,
  );
}

function useCurrentLabel(orientation: string) {
  const columnLabel = useColumnConfig((store) => store.label);
  const rowLabel = useRowConfig((store) => store.label);
  return orientation === "vertical" ? columnLabel : rowLabel;
}

export default function Bars({
  orientation,
  categoricalScale,
  numericalScale,
  domainLimit,
  nonExpandedSize,
  width,
  height,
}: BarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = useCurrentCounts(orientation);
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const theme = useTheme();
  const metadata = useCurrentMetadata(orientation);
  const { openTooltip, closeTooltip } = useSetTooltipData();
  const label = useCurrentLabel(orientation);

  const bars = useMemo(() => {
    const entries = Object.entries(data);
    return entries
      .map(([key, value]) => {
        if (orientation === "horizontal" && selectedValues?.has(key)) {
          return null;
        }

        const scaledKey = categoricalScale(key);
        const scaledValue = numericalScale(value);
        const isVertical = orientation === "vertical";
        const barSize = nonExpandedSize;
        const scaledPosition = scaledKey ?? 0;
        const barLength = scaledValue;
        const [rangeStart, rangeEnd] = numericalScale.range();

        // Bar dimensions and position
        const x = isVertical ? scaledPosition : domainLimit - scaledValue;
        const y = isVertical ? domainLimit - scaledValue : scaledPosition;
        const barWidth = isVertical ? barSize : barLength;
        const barHeight = isVertical ? barLength : barSize;

        // Background dimensions and position
        const backgroundX = isVertical ? x : domainLimit - rangeEnd;
        const backgroundY = isVertical ? domainLimit - rangeStart : y;
        const backgroundWidth = isVertical ? barSize : rangeEnd;
        const backgroundHeight = isVertical ? rangeStart : barSize;

        return {
          x,
          y,
          width: barWidth,
          height: barHeight,
          value: key,
          backgroundX,
          backgroundY,
          backgroundHeight,
          backgroundWidth,
          key,
        };
      })
      .filter((bar) => bar !== null);
  }, [
    orientation,
    data,
    categoricalScale,
    numericalScale,
    domainLimit,
    nonExpandedSize,
    selectedValues,
  ]);

  useLayoutEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw bars
    bars.forEach((bar, idx) => {
      // Draw background stripe pattern (simplified - you may want to implement stripes)
      ctx.fillStyle =
        idx % 2 === 0
          ? theme.palette.action.hover
          : theme.palette.background.default;
      ctx.fillRect(
        bar.backgroundX,
        bar.backgroundY,
        bar.backgroundWidth,
        bar.backgroundHeight,
      );

      // Draw bar
      ctx.fillStyle = theme.palette.text.primary;
      ctx.strokeStyle = theme.palette.background.default;
      ctx.lineWidth = 1;

      ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
      ctx.strokeRect(bar.x, bar.y, bar.width, bar.height);
    });
  }, [bars, width, height, theme]);

  // Hit detection for tooltips
  const handleMouseMove = useEventCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find which bar was hit (check background area first, then actual bar)
      const hitBar = bars.find((bar) => {
        return (
          x >= bar.backgroundX &&
          x <= bar.backgroundX + bar.backgroundWidth &&
          y >= bar.backgroundY &&
          y <= bar.backgroundY + bar.backgroundHeight
        );
      });

      if (hitBar) {
        const metadataValues = metadata?.[hitBar.value];
        openTooltip(
          {
            title: hitBar.value,
            data: {
              "Cell Count": data[hitBar.value],
              [label]: hitBar.value,
              ...metadataValues,
            },
          },
          e.clientX,
          e.clientY,
        );
      } else {
        closeTooltip();
      }
    },
  );

  const handleMouseLeave = useEventCallback(() => {
    closeTooltip();
  });

  const style = useMemo(() => {
    if (orientation === "horizontal") {
      return {
        marginLeft: -1,
      };
    } else
      return {
        marginTop: -1,
      };
  }, [orientation]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
