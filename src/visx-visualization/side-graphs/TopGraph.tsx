import React from "react";

import { useTheme } from "@mui/material/styles";
import { AxisRight } from "@visx/axis";
import { formatPrefix, max } from "d3";
import { useColumnConfig } from "../../contexts/AxisConfigContext";
import { useColumnCounts } from "../../contexts/DataContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { useFraction } from "../../contexts/FractionContext";
import { useXScale } from "../../contexts/ScaleContext";
import HeatmapXAxis from "../heatmap/HeatmapXAxis";
import Bars from "./Bars";
import { useCountsScale } from "./hooks";
import Violins from "./Violin";
import XAxisLabel from "./XAxisLabel";

const useColumnCountsScale = () => {
  const { height } = usePanelDimensions("center_top");
  const columnCounts = useColumnCounts();
  const { tickLabelSize } = useXScale();
  const fraction = useFraction((s) => s.fraction);
  const domainMax = fraction ? 100 : (max(Object.values(columnCounts)) ?? 0);
  return useCountsScale([domainMax, 0], [height - tickLabelSize, 0]);
};

function TopBar() {
  const { height } = usePanelDimensions("center_top");
  // Use same x scale as the heatmap
  const { scale: xScale, nonExpandedSize } = useXScale();
  const yScale = useColumnCountsScale();

  return (
    <g className="bar-graph-top">
      <Bars
        orientation="vertical"
        categoricalScale={xScale}
        numericalScale={yScale}
        domainLimit={height}
        nonExpandedSize={nonExpandedSize}
      />
    </g>
  );
}

export function TopGraphScale() {
  const { width, height } = usePanelDimensions("right_top");
  const yScale = useColumnCountsScale();
  const { tickLabelSize } = useXScale();

  const axisScale = yScale.copy().range([tickLabelSize, height]);

  const axisTotalHeight = height - tickLabelSize;

  const theme = useTheme();

  const fraction = useFraction((s) => s.fraction);

  if (fraction) {
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
  const { width, height } = usePanelDimensions("center_top");

  const flipAxisPosition = useColumnConfig((store) => store.flipAxisPosition);

  const { fraction } = useFraction();

  return (
    <>
      <svg className="top-graph-container" height={height} width={width}>
        {fraction ? <TopViolin /> : <TopBar />}
        {flipAxisPosition && <HeatmapXAxis />}
      </svg>
      {flipAxisPosition && <XAxisLabel />}
    </>
  );
}
