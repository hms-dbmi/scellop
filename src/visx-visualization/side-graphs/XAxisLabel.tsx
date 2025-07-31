import Typography from "@mui/material/Typography";
import React from "react";
import { useColumnConfig } from "../../contexts/AxisConfigContext";
import { useColumns, useData } from "../../contexts/DataContext";

function useHeatmapXAxisLabel() {
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

export default function XAxisLabel() {
  const xAxisLabel = useHeatmapXAxisLabel();

  return (
    <Typography
      position="absolute"
      display="block"
      top={0}
      textAlign={"center"}
      width="100%"
      variant="caption"
      color="textSecondary"
      noWrap
    >
      {xAxisLabel}
    </Typography>
  );
}
