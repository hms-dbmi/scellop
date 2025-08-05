import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
import { useColumnConfig } from "../../contexts/AxisConfigContext";
import { useColumns, useData } from "../../contexts/DataContext";
import AxisZoomControl from "./AxisZoomControl";

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
  const axisConfig = useColumnConfig();

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
      sx={{
        // Necessary for the axis zoom control to be positioned over the axis
        zIndex: "100 !important",
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <Box>{xAxisLabel}</Box>
        <AxisZoomControl axisConfig={axisConfig} orientation="horizontal" />
      </Stack>
    </Typography>
  );
}
