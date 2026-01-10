import { useTheme } from "@mui/material/styles";
import { Axis, Orientation } from "@visx/axis";
import React, { useCallback, useId } from "react";
import { useColumnConfig } from "../../contexts/AxisConfigContext";
import {
  useColumnCounts,
  useColumnMetadataKeys,
  useColumns,
  useData,
  useMetadataLookup,
} from "../../contexts/DataContext";
import { useHeatmapDimensions } from "../../contexts/DimensionsContext";
import { useTooltipFields } from "../../contexts/MetadataConfigContext";
import { useXScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import SVGBackgroundColorFilter from "../SVGBackgroundColorFilter";
import { TICK_TEXT_SIZE } from "./constants";
import { useHeatmapAxis, useSetTickLabelSize } from "./hooks";
import TruncatedText from "./TruncatedText";

export function useHeatmapXAxisLabel() {
  const axisConfig = useColumnConfig();
  const { label } = axisConfig;

  const columns = useColumns();
  const filteredColumns = columns.length;
  const allColumns = useData((s) => s.columnOrder.length);

  const labelWithCounts =
    filteredColumns !== allColumns
      ? `${label} (${filteredColumns}/${allColumns})`
      : `${label} (${allColumns})`;

  return labelWithCounts;
}

/**
 * Component which renders the x-axis of the heatmap.
 * @returns
 */
export default function HeatmapXAxis() {
  const columnCounts = useColumnCounts();
  const theme = useTheme();
  const {
    scale: x,
    tickLabelSize,
    setTickLabelSize,
    scroll,
    isZoomed,
    setScroll,
  } = useXScale();
  const axisConfig = useColumnConfig();
  const { label } = axisConfig;
  const { width } = useHeatmapDimensions();

  const { openTooltip, closeTooltip } = useSetTooltipData();

  const columns = useColumns();
  const columnMetadataKeys = useColumnMetadataKeys();
  const columnTooltipFields = useTooltipFields(columnMetadataKeys);
  const lookupMetadata = useMetadataLookup();

  const filterId = useId();
  const { openInNewTab, tickTitle, tickLabelStyle } =
    useHeatmapAxis(axisConfig);
  const fontSize =
    x.bandwidth() > TICK_TEXT_SIZE ? TICK_TEXT_SIZE : x.bandwidth();

  useSetTickLabelSize(setTickLabelSize, "columns", fontSize, columns);

  // Handle wheel scrolling for zoomed X axis
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      if (!isZoomed) return;

      e.preventDefault();

      setScroll((prev: number) => {
        const maxScrollX = Math.max(0, x.range()[1] - width);
        return Math.max(0, Math.min(maxScrollX, prev + e.deltaX));
      });
    },
    [isZoomed, setScroll, x, width],
  );

  return (
    <svg
      width={x.range()[1]}
      height={tickLabelSize - 24}
      style={{
        zIndex: 1,
        borderBottom: `1px solid ${theme.palette.text.primary}`,
      }}
      onWheel={handleWheel}
    >
      <SVGBackgroundColorFilter
        color={theme.palette.background.default}
        id={filterId}
      />
      <g transform={isZoomed ? `translate(${-scroll}, 0)` : undefined}>
        <Axis
          scale={x}
          numTicks={x.domain().length}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
          top={tickLabelSize - 24}
          tickLength={2}
          tickComponent={(tickLabelProps) => (
            <TruncatedText
              {...tickLabelProps}
              text={String(tickLabelProps.formattedValue)}
              maxWidth={tickLabelSize - 32}
              fontSize={fontSize}
              fontFamily={theme.typography.fontFamily}
            />
          )}
          tickLabelProps={(t) =>
            ({
              angle: -90,
              dx: "0.25em",
              dy: "-0.25em",
              textAnchor: "start",
              fontSize,
              style: tickLabelStyle,
              fill: theme.palette.text.primary,
              className: "x-axis-tick-label",
              fontFamily: theme.typography.fontFamily,
              onMouseOver: (e) => {
                const metadataValues = lookupMetadata(
                  t,
                  "cols",
                  columnTooltipFields,
                );
                openTooltip(
                  {
                    title: tickTitle(t),
                    data: {
                      "Cell Count": columnCounts[t],
                      [label]: t,
                      ...metadataValues,
                    },
                  },
                  e.clientX,
                  e.clientY,
                );
              },
              onMouseOut: closeTooltip,
              onClick: () => {
                const metadataValues = lookupMetadata(
                  t,
                  "cols",
                  columnTooltipFields,
                );
                openInNewTab(t, metadataValues);
              },
            }) as const
          }
          tickValues={columns}
          orientation={Orientation.top}
        />
      </g>
    </svg>
  );
}
