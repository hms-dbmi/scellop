import React from "react";

import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { AxisRight } from "@visx/axis";
import { formatPrefix, max } from "d3";
import { useColumnCounts } from "../../contexts/DataContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import {
    useIsTopViolins,
    useTopGraphType,
} from "../../contexts/IndividualGraphTypeContext";
import { useXScale } from "../../contexts/ScaleContext";
import HeatmapXAxis from "../heatmap/HeatmapXAxis";
import Bars from "./Bars";
import { useCountsScale } from "./hooks";
import Violins from "./Violin";
import XAxisLabel from "./XAxisLabel";

const useColumnCountsScale = () => {
  const { height, width } = usePanelDimensions("center_top");
  const columnCounts = useColumnCounts();
  const { tickLabelSize } = useXScale();
  const topGraphType = useTopGraphType();
  const domainMax =
    topGraphType === "Violins" ? 100 : (max(Object.values(columnCounts)) ?? 0);
  const rangeMax = height - tickLabelSize;
  return [
    useCountsScale([domainMax, 0], [height - tickLabelSize, 0]),
    rangeMax,
    width,
  ] as const;
};

function TopBar() {
  // Use same x scale as the heatmap
  const { scale: xScale } = useXScale();
  const [yScale, height, width] = useColumnCountsScale();

  return (
    <Bars
      orientation="columns"
      categoricalScale={xScale}
      domainLimit={height}
      width={width}
      height={height}
    />
  );
}

export function TopGraphScale() {
  const { width, height } = usePanelDimensions("right_top");
  const [yScale] = useColumnCountsScale();
  const { tickLabelSize } = useXScale();

  const axisScale = yScale.copy().range([tickLabelSize, height]);

  const axisTotalHeight = height - tickLabelSize;

  const theme = useTheme();

  const violins = useIsTopViolins();

  if (violins) {
    return null;
  }

  return (
    <svg
      width={width}
      height={height}
      style={{ borderLeft: `1px solid ${theme.palette.text.primary}` }}
    >
      <AxisRight
        scale={axisScale}
        top={0}
        left={0}
        orientation="right"
        hideZero
        hideAxisLine
        stroke={theme.palette.text.primary}
        tickLabelProps={{ fill: theme.palette.text.primary, className: "text" }}
        tickStroke={theme.palette.text.primary}
        tickFormat={(t) => formatPrefix(".0k", t as number)(t)}
        tickValues={axisTotalHeight > 100 ? undefined : [yScale.domain()[0]]}
      />
    </svg>
  );
}

function TopViolin() {
  return <Violins side="top" />;
}

/**
 * Container component for the top graph.
 */
export default function TopGraph() {
  const violins = useIsTopViolins();
  const { height } = usePanelDimensions("center_top");

  return (
    <Stack direction="column" width="100%" height={height} overflow="hidden">
      <XAxisLabel />
      <HeatmapXAxis />
      {violins ? <TopViolin /> : <TopBar />}
    </Stack>
  );
}
