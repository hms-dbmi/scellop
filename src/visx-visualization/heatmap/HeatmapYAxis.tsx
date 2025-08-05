import { useTheme } from "@mui/material/styles";
import { Axis, AxisLeft, Orientation, TickRendererProps } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import { Text } from "@visx/text";
import React, { useId } from "react";
import { useRowConfig } from "../../contexts/AxisConfigContext";
import { useRowCounts, useRowMaxes, useRows } from "../../contexts/DataContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { EXPANDED_ROW_PADDING, useYScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import truncateTickLabel from "../../utils/truncate-tick-label";
import SVGBackgroundColorFilter from "../SVGBackgroundColorFilter";
import { TICK_TEXT_SIZE } from "./constants";
import { useHeatmapAxis, useSetTickLabelSize } from "./hooks";

export default function HeatmapYAxis() {
  const theme = useTheme();
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const { scale: y, tickLabelSize, setTickLabelSize } = useYScale();
  const axisConfig = useRowConfig();
  const { label } = axisConfig;
  const { openTooltip, closeTooltip } = useSetTooltipData();

  const rows = useRows();
  const rowCounts = useRowCounts();

  const filterId = useId();
  const { openInNewTab, tickTitle, tickLabelStyle } =
    useHeatmapAxis(axisConfig);

  const fontSize =
    y.bandwidth() > TICK_TEXT_SIZE ? TICK_TEXT_SIZE : y.bandwidth();

  useSetTickLabelSize(setTickLabelSize, "y", fontSize, rows);

  return (
    <svg height={y.range()[0]} style={{ zIndex: 1 }}>
      <SVGBackgroundColorFilter
        color={theme.palette.background.default}
        id={filterId}
      />
      <Axis
        scale={y}
        left={tickLabelSize}
        stroke={theme.palette.text.primary}
        tickStroke={theme.palette.text.primary}
        tickFormat={(v) => truncateTickLabel(v, 20)}
        tickComponent={({
          formattedValue,
          ...tickLabelProps
        }: TickRendererProps) =>
          selectedValues.has(formattedValue as string) ? (
            <ExpandedRowTick
              formattedValue={formattedValue}
              {...tickLabelProps}
            />
          ) : (
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
          )
        }
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
        tickValues={rows}
        orientation={Orientation.left}
        hideTicks={selectedValues.size > 0}
      />
    </svg>
  );
}

function ExpandedRowTick({
  x,
  y,
  formattedValue: row,
  ...tickLabelProps
}: TickRendererProps) {
  const { expandedSize, nonExpandedSize } = useYScale();
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const rowMaxes = useRowMaxes();
  const axisConfig = useRowConfig();

  const { openInNewTab, tickTitle, tickLabelStyle } =
    useHeatmapAxis(axisConfig);

  const panelSize = usePanelDimensions("left_middle");
  const { openTooltip, closeTooltip } = useSetTooltipData();
  const theme = useTheme();

  const { tickLabelSize } = useYScale();

  if (selectedValues.has(row!)) {
    // Display an axis scaled for the selected value instead of the tick if the value is expanded
    // Use the tick label as the axis label
    const Axis = AxisLeft;
    const max = rowMaxes[row!];
    const range =
      expandedSize > nonExpandedSize
        ? [EXPANDED_ROW_PADDING, expandedSize - EXPANDED_ROW_PADDING / 2]
        : [EXPANDED_ROW_PADDING, nonExpandedSize];

    const normalizationIsNotNone = useNormalization(
      (s) => s.normalization !== "None",
    );

    const domain = normalizationIsNotNone ? [1, 0] : [max, 0];

    const yScale = scaleLinear({
      domain,
      range,
      nice: true,
    });

    const top =
      expandedSize > nonExpandedSize
        ? y - nonExpandedSize / 2 - EXPANDED_ROW_PADDING * 2
        : y - expandedSize / 2;

    return (
      <Axis
        top={top}
        orientation="left"
        left={panelSize.width - tickLabelSize}
        scale={yScale}
        label={row}
        labelOffset={expandedSize / 2}
        tickFormat={
          normalizationIsNotNone ? (v) => `${(v as number) * 100}%` : undefined
        }
        tickLabelProps={{
          fill: theme.palette.text.primary,
          style: tickLabelStyle,
          fontFamily: theme.typography.fontFamily,
          onMouseOut: closeTooltip,
          onClick: () => openInNewTab(row!),
          className: "text",
        }}
        labelProps={{
          style: tickLabelStyle,
          fill: theme.palette.text.primary,
          className: "text",
          fontFamily: theme.typography.fontFamily,
          onMouseMove: (e) => {
            openTooltip(
              {
                title: tickTitle(row!),
                data: {
                  "Cell Count": max,
                },
              },
              e.clientX,
              e.clientY,
            );
          },
          onMouseOut: closeTooltip,
          onClick: () => openInNewTab(row!),
        }}
      />
    );
  }
  return (
    <Text x={x} y={y} {...tickLabelProps} className="text">
      {row}
    </Text>
  );
}
