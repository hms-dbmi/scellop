import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ScaleBand, ScaleLinear } from "d3";
import React, { useMemo } from "react";
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
import { BackgroundStripe } from "./BackgroundStripe";

interface BarsProps {
  orientation: "horizontal" | "vertical";
  categoricalScale: ScaleBand<string>;
  numericalScale: ScaleLinear<number, number>;
  domainLimit: number;
  selectedValues?: Set<string>;
  nonExpandedSize: number;
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

/**
 * Helper component for rendering the bars of a bar chart
 * @param props.orientation The orientation of the bars.
 * @param props.categoricalScale The scale for the categorical axis (i.e. the x-axis if looking at a vertically oriented bar chart).
 * @param props.numericalScale The scale for the numerical axis (i.e. the y-axis if looking at a vertically oriented bar chart).
 * @param props.domainLimit The limit of the domain (i.e. the maximum height of a bar on the chart).
 * @returns
 */
export default function Bars({
  orientation,
  categoricalScale,
  numericalScale,
  domainLimit,
  nonExpandedSize,
}: BarsProps) {
  const data = useCurrentCounts(orientation);
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const bars = useMemo(() => {
    const entries = Object.entries(data);
    return entries
      .map(([key, value]) => {
        if (orientation === "horizontal" && selectedValues?.has(key)) {
          // Display an axis scaled for the selected value instead of the tick if the value is expanded
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
        const width = isVertical ? barSize : barLength;
        const height = isVertical ? barLength : barSize;

        // Background dimensions and position
        const backgroundX = isVertical ? x : domainLimit - rangeEnd;
        const backgroundY = isVertical ? domainLimit - rangeStart : y;
        const backgroundWidth = isVertical ? barSize : rangeEnd;
        const backgroundHeight = isVertical ? rangeStart : barSize;
        return {
          x,
          y,
          width,
          height,
          value: key,
          orientation,
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
  return (
    <>
      {bars.map((bar) => {
        return <Bar {...bar} key={bar.key} />;
      })}
    </>
  );
}

interface BarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  orientation: "horizontal" | "vertical";
  backgroundX: number;
  backgroundY: number;
  backgroundHeight: number | string;
  backgroundWidth: number | string;
}

function Bar({
  x,
  y,
  width,
  height,
  backgroundX,
  backgroundY,
  backgroundHeight,
  backgroundWidth,
  value,
  orientation,
}: BarProps) {
  const metadata = useCurrentMetadata(orientation);
  const data = useCurrentCounts(orientation);
  const { openTooltip } = useSetTooltipData();
  const label = useCurrentLabel(orientation);
  const onMouse = useEventCallback((e: React.MouseEvent<SVGRectElement>) => {
    const metadataValues = metadata?.[value];
    openTooltip(
      {
        title: value,
        data: {
          "Cell Count": data[value],
          [label]: value,
          ...metadataValues,
        },
      },
      e.clientX,
      e.clientY,
    );
  });
  const { closeTooltip } = useSetTooltipData();
  const theme = useTheme();
  return (
    <g
      onMouseOver={onMouse}
      onMouseMove={onMouse}
      onMouseOut={closeTooltip}
      pointerEvents={"all"}
    >
      <BackgroundStripe
        x={backgroundX}
        y={backgroundY}
        height={backgroundHeight}
        width={backgroundWidth}
        orientation={orientation}
        value={value}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={theme.palette.text.primary}
        stroke={theme.palette.background.default}
      />
    </g>
  );
}
