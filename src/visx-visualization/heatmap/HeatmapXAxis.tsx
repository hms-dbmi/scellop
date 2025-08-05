import { useTheme } from "@mui/material/styles";
import { Axis, Orientation } from "@visx/axis";
import React, { useId } from "react";
import { useColumnConfig } from "../../contexts/AxisConfigContext";
import {
  useColumnCounts,
  useColumns,
  useData,
} from "../../contexts/DataContext";
import { useXScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import truncateTickLabel from "../../utils/truncate-tick-label";
import SVGBackgroundColorFilter from "../SVGBackgroundColorFilter";
import { TICK_TEXT_SIZE } from "./constants";
import { useHeatmapAxis, useSetTickLabelSize } from "./hooks";

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
  const { scale: x, tickLabelSize, setTickLabelSize } = useXScale();
  const axisConfig = useColumnConfig();
  const { label } = axisConfig;

  const { openTooltip, closeTooltip } = useSetTooltipData();

  const columns = useColumns();

  const filterId = useId();
  const { openInNewTab, tickTitle, tickLabelStyle } =
    useHeatmapAxis(axisConfig);
  const fontSize =
    x.bandwidth() > TICK_TEXT_SIZE ? TICK_TEXT_SIZE : x.bandwidth();

  useSetTickLabelSize(setTickLabelSize, "x", fontSize, columns);

  return (
    <svg width={x.range()[1]} style={{ zIndex: 1 }}>
      <SVGBackgroundColorFilter
        color={theme.palette.background.default}
        id={filterId}
      />
      <Axis
        scale={x}
        numTicks={x.domain().length}
        stroke={theme.palette.text.primary}
        tickStroke={theme.palette.text.primary}
        top={tickLabelSize}
        tickFormat={(t) => truncateTickLabel(t, 20)}
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
              openTooltip(
                {
                  title: tickTitle(t),
                  data: {
                    "Cell Count": columnCounts[t],
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
        tickValues={columns}
        orientation={Orientation.top}
      />
    </svg>
  );
}
