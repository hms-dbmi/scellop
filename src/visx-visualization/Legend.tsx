import React, { useId } from "react";
import { useColorScale } from "../contexts/ColorScaleContext";

import { Box, Stack, Typography } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";

import {
  useIsLogTransformed,
  useIsNormalized,
  useNormalization,
} from "../contexts/NormalizationContext";
import { PlotControlsButton } from "./plot-controls.tsx/PlotControls";
import { TemporalControls } from "./TemporalControls";

const legendThresholds = new Array(100).fill(0).map((_, i) => i / 100);

export default function Legend() {
  const { scale: colors, maxValue, maxLogValue } = useColorScale();
  const id = useId() + "-legend";

  const minColor = colors(0);
  const legendColors = legendThresholds.map((value) => [
    colors(value * maxValue),
    `${value * 100}%`,
  ]);
  const maxColor = colors(maxValue);
  const isNormalized = useIsNormalized();
  const isLogTransformed = useIsLogTransformed();
  const normalization = useNormalization((state) => state.normalization);  

  const legendLabel = isNormalized
    ? `Percent of all cells in ${normalization}`
    : isLogTransformed 
      ? "Log Counts"
      : "Counts";
  const minValueLabel = isNormalized ? "0%" : "0";
  const maxValueLabel = isNormalized ? "100%" : isLogTransformed ? maxLogValue.toFixed(2) : maxValue;

  return (
    <Stack height="100%" gap="1rem" paddingX={1}>
      <Stack width="100%">
        <InputLabel id="heatmap-legend-label">{legendLabel}</InputLabel>
        <Box
          id={id}
          data-testId="heatmap-legend"
          sx={{
            width: "100%",
            display: "flex",
            flexGrow: 1,
            background: `linear-gradient(to right, ${legendColors.map(([c, position]) => `${c} ${position}`).join(", ")})`,
            borderRadius: 4,
          }}
        >
          <Stack
            justifyContent="space-between"
            direction={"row"}
            width="100%"
            px={2}
            py={0.75}
          >
            <Typography variant="body2" style={{ color: maxColor }}>
              {minValueLabel}
            </Typography>
            <Typography variant="body2" style={{ color: minColor }}>
              {maxValueLabel}
            </Typography>
          </Stack>
        </Box>
      </Stack>
      <Stack direction="row" gap={2} flexWrap="wrap">
        <PlotControlsButton />
        <TemporalControls />
      </Stack>
    </Stack>
  );
}
