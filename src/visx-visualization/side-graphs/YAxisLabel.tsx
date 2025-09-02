import Typography from "@mui/material/Typography";
import React from "react";
import { useColumnConfig } from "../../contexts/AxisConfigContext";
import { useYScale } from "../../contexts/ScaleContext";
import AxisZoomControl from "./AxisZoomControl";
import { useAxisLabel } from "./useAxisLabel";

export function useHeatmapYAxisLabel() {}

interface YAxisLabelProps {
  height: number;
}

export default function YAxisLabel({ height }: YAxisLabelProps) {
  const yAxisLabel = useAxisLabel("y");
  const { resetScroll } = useYScale();

  return (
    <Typography
      position="absolute"
      display="block"
      variant="caption"
      color="textSecondary"
      textAlign="center"
      noWrap
      top={height / 2}
      sx={{
        // Workaround for html2canvas not working with writingMode
        transform: "rotate(-90deg) translateY(-100%) translateX(50%)",
        zIndex: "100 !important",
      }}
    >
      {yAxisLabel}
      <AxisZoomControl
        axisConfig={useColumnConfig()}
        resetScroll={resetScroll}
        axis="Row"
      />
    </Typography>
  );
}
