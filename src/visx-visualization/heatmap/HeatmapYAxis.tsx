import { useTheme } from "@mui/material/styles";
import { Axis, Orientation, TickRendererProps } from "@visx/axis";
import { Text } from "@visx/text";
import React, { useCallback, useId } from "react";
import { useRowConfig } from "../../contexts/AxisConfigContext";
import { useRowCounts, useRows } from "../../contexts/DataContext";
import { useHeatmapDimensions } from "../../contexts/DimensionsContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useYScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import truncateTickLabel from "../../utils/truncate-tick-label";
import SVGBackgroundColorFilter from "../SVGBackgroundColorFilter";
import { TICK_TEXT_SIZE } from "./constants";
import { useHeatmapAxis, useSetTickLabelSize } from "./hooks";

export default function HeatmapYAxis() {
  const theme = useTheme();
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const {
    scale: y,
    tickLabelSize,
    setTickLabelSize,
    scroll,
    isZoomed,
    setScroll,
  } = useYScale();
  const axisConfig = useRowConfig();
  const { label } = axisConfig;
  const { openTooltip, closeTooltip } = useSetTooltipData();
  const { height } = useHeatmapDimensions();

  const rows = useRows();
  const rowCounts = useRowCounts();

  const filterId = useId();
  const { openInNewTab, tickTitle, tickLabelStyle } =
    useHeatmapAxis(axisConfig);

  const fontSize =
    y.bandwidth() > TICK_TEXT_SIZE ? TICK_TEXT_SIZE : y.bandwidth();

  useSetTickLabelSize(setTickLabelSize, "rows", fontSize, rows);

  // Handle wheel scrolling for zoomed Y axis
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      if (!isZoomed) return;

      e.preventDefault();

      setScroll((prev: number) => {
        const maxScrollY = Math.max(0, y.range()[0] - height);
        return Math.max(0, Math.min(maxScrollY, prev + e.deltaY));
      });
    },
    [isZoomed, setScroll, y, height],
  );

  return (
    <svg height={y.range()[0]} style={{ zIndex: 1 }} onWheel={handleWheel}>
      <SVGBackgroundColorFilter
        color={theme.palette.background.default}
        id={filterId}
      />
      <g transform={isZoomed ? `translate(0, ${-scroll})` : undefined}>
        <Axis
          scale={y}
          left={tickLabelSize}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
          tickFormat={(v) => truncateTickLabel(v, 20)}
          tickComponent={({
            formattedValue,
            ...tickLabelProps
          }: TickRendererProps) => (
            <Text
              {...tickLabelProps}
              x={
                // Visx types are a bit off here, so we need to cast to unknown as a workaround
                ((tickLabelProps?.to as unknown as { x: number })?.x ?? 0) -
                Number(tickLabelProps?.fontSize ?? 0)
              }
            >
              {formattedValue}
            </Text>
          )}
          tickLabelProps={(t) =>
            ({
              fontSize,
              textAnchor: "end",
              fill: theme.palette.text.primary,
              className: "y-axis-tick-label",
              fontFamily: theme.typography.fontFamily,
              style: tickLabelStyle,
              dy: "0.25em",
              onMouseOver: (e) => {
                openTooltip(
                  {
                    title: tickTitle(t),
                    data: {
                      "Cell Count": rowCounts[t],
                      [label]: t,
                    },
                  },
                  e.clientX,
                  e.clientY,
                );
              },
              onMouseOut: closeTooltip,
              onClick: () => openInNewTab(t),
            }) as const
          }
          tickValues={rows.filter((r) => !selectedValues.has(r))}
          orientation={Orientation.left}
          hideTicks={selectedValues.size > 0}
        />
      </g>
    </svg>
  );
}
