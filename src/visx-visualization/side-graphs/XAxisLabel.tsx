import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
import { useRowConfig } from "../../contexts/AxisConfigContext";
import { useXScale } from "../../contexts/ScaleContext";
import AxisZoomControl from "./AxisZoomControl";
import { useAxisLabel } from "./useAxisLabel";

export default function XAxisLabel() {
  const xAxisLabel = useAxisLabel("x");
  const { resetScroll } = useXScale();

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
        <AxisZoomControl
          axisConfig={useRowConfig()}
          resetScroll={resetScroll}
          axis="Column"
        />
      </Stack>
    </Typography>
  );
}
