import Typography from "@mui/material/Typography";
import React from "react";
import { useRowConfig } from "../../contexts/AxisConfigContext";
import { useData, useRows } from "../../contexts/DataContext";

export function useHeatmapYAxisLabel() {
  const axisConfig = useRowConfig();
  const { label } = axisConfig;

  const rows = useRows();
  const filteredRows = rows.length;
  const allRows = useData((s) => s.rowOrder.length);

  const labelWithCounts =
    filteredRows !== allRows
      ? `${label} (${filteredRows}/${allRows})`
      : `${label} (${allRows})`;
  return labelWithCounts;
}

interface YAxisLabelProps {
  height: number;
  side?: "left" | "right";
}

const isLeft = (side: string | undefined): boolean => {
  return side === "left" || side === undefined;
};

export default function YAxisLabel({ height, side = "left" }: YAxisLabelProps) {
  const yAxisLabel = useHeatmapYAxisLabel();

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
        writingMode: isLeft(side) ? "vertical-lr" : "vertical-rl",
        transform: "rotate(180deg) translateY(50%)",
      }}
    >
      {yAxisLabel}
    </Typography>
  );
}
