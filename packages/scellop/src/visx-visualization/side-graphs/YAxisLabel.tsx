import Typography from "@mui/material/Typography";
import { useColumnConfig } from "../../contexts/AxisConfigContext";
import { useYScale } from "../../contexts/ScaleContext";
import AxisZoomControl from "./AxisZoomControl";
import { useAxisLabel } from "./useAxisLabel";

export function useHeatmapYAxisLabel() {}

export default function YAxisLabel() {
  const yAxisLabel = useAxisLabel("y");
  const { resetScroll } = useYScale();

  return (
    <Typography
      variant="caption"
      color="textSecondary"
      noWrap
      sx={{
        display: "flex",
        textAlign: "center",

        // Fixed width for axis label
        width: 24,

        flexShrink: 0,

        // Rotate the label to align with Y axis
        writingMode: "vertical-rl",

        transform: "rotate(180deg)",
        zIndex: "100 !important",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
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
