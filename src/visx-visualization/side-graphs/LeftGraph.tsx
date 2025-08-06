import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { AxisBottom } from "@visx/axis";
import { formatPrefix, max } from "d3";
import React from "react";
import { useRowCounts } from "../../contexts/DataContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useFraction } from "../../contexts/FractionContext";
import { useYScale } from "../../contexts/ScaleContext";
import HeatmapYAxis from "../heatmap/HeatmapYAxis";
import Bars from "./Bars";
import Violins from "./Violin";
import YAxisLabel from "./YAxisLabel";
import { useCountsScale } from "./hooks";

const useXAxisCountsScale = () => {
  const { width, height } = usePanelDimensions("left_middle");
  const rowCounts = useRowCounts();
  const fraction = useFraction((s) => s.fraction);
  const { tickLabelSize } = useYScale();
  const domainMax = fraction ? 100 : (max(Object.values(rowCounts)) ?? 0);
  const rangeMax = width - tickLabelSize;
  return [
    useCountsScale([0, domainMax], [0, rangeMax]),
    rangeMax,
    height,
  ] as const;
};

function LeftBar() {
  const [xScale, width, height] = useXAxisCountsScale();
  // Use same y scale as the heatmap
  const { scale: yScale } = useYScale();
  const selectedValues = useSelectedValues((s) => s.selectedValues);

  return (
    <Bars
      orientation="rows"
      categoricalScale={yScale}
      numericalScale={xScale}
      domainLimit={width}
      selectedValues={selectedValues}
      width={width}
      height={height}
    />
  );
}

export function LeftGraphScale() {
  const { width, height } = usePanelDimensions("left_bottom");
  const [xScale] = useXAxisCountsScale();
  const { tickLabelSize } = useYScale();

  const axisScale = xScale.copy().range([width, tickLabelSize * 1.25]);
  const axisTotalWidth = width - tickLabelSize;

  const fraction = useFraction((s) => s.fraction);
  const theme = useTheme();
  if (fraction) {
    return null;
  }
  return (
    <svg
      width={width}
      height={height}
      style={{ borderTop: `1px solid ${theme.palette.text.primary}` }}
    >
      <AxisBottom
        scale={axisScale}
        hideZero
        hideAxisLine
        top={0}
        orientation="bottom"
        stroke={theme.palette.text.primary}
        tickLabelProps={{ fill: theme.palette.text.primary, className: "text" }}
        tickStroke={theme.palette.text.primary}
        tickFormat={(t) => formatPrefix(".0k", t as number)(t)}
        tickValues={axisTotalWidth > 150 ? undefined : [xScale.domain()[1]]}
      />
    </svg>
  );
}

function LeftViolin() {
  return <Violins side="left" />;
}

/**
 * Container component for the left graph.
 */
export default function LeftGraph() {
  const { height, width } = usePanelDimensions("left_middle");

  const { fraction } = useFraction();
  return (
    <Stack direction="row" width={width} height={height} overflow="hidden">
      <HeatmapYAxis />
      <YAxisLabel height={height} side="left" />
      {fraction ? <LeftViolin /> : <LeftBar />}
    </Stack>
  );
}
