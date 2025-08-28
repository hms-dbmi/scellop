import { useTheme } from "@mui/material/styles";
import React, { useId } from "react";
import { useColorScale } from "../contexts/ColorScaleContext";

import { Box, Tooltip, Typography, TypographyProps } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";

import { usePanelDimensions } from "../contexts/DimensionsContext";
import {
  useIsLogTransformed,
  useIsNormalizedByRowOrColumn,
  useNormalization,
} from "../contexts/NormalizationContext";

const legendThresholds = new Array(100).fill(0).map((_, i) => i / 100);

function ZeroValueIndicator({ isVertical = false }: { isVertical?: boolean }) {
  const theme = useTheme();
  return (
    <Tooltip title="Zero values are indicated with the current visualization background color.">
      <Box
        sx={{
          height: 32,
          width: 32, // Keep square for vertical, match legend height for horizontal
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          px: isVertical ? 0.5 : 0,
          py: isVertical ? 1 : 0, // Add vertical padding for better spacing
        }}
      >
        <ValueLabel color={theme.palette.text.primary}>0</ValueLabel>
      </Box>
    </Tooltip>
  );
}

function ValueLabel({
  color,
  children,
  ...rest
}: TypographyProps & { color: string }) {
  return (
    <Typography variant="body2" style={{ color }} {...rest}>
      {children}
    </Typography>
  );
}
const useLegendLabel = () => {
  const isNormalized = useIsNormalizedByRowOrColumn();
  const isLogTransformed = useIsLogTransformed();
  const normalization = useNormalization((state) => state.normalization);

  if (isNormalized) {
    return `Percent of all cells in ${normalization}`;
  }
  if (isLogTransformed) {
    return "Log Counts";
  }
  return "Counts";
};

const useMinValueLabel = () => {
  const isNormalized = useIsNormalizedByRowOrColumn();
  return isNormalized ? "0%" : "0";
};

const useMaxValueLabel = () => {
  const isNormalized = useIsNormalizedByRowOrColumn();
  const isLogTransformed = useIsLogTransformed();
  const { maxValue, maxLogValue } = useColorScale();

  if (isNormalized) {
    return "100%";
  }
  if (isLogTransformed) {
    return maxLogValue.toFixed(2);
  }
  return maxValue;
};

export default function Legend() {
  const { countsScale: colors, maxValue } = useColorScale();
  const id = useId() + "-legend";
  const { width: panelWidth } = usePanelDimensions("left_top");

  // Determine if we should use vertical layout based on panel width
  const isVertical = panelWidth < 128;

  const minColor = colors(0);
  const legendColors = legendThresholds.map((value) => [
    colors(value * maxValue),
    `${value * 100}%`,
  ]);
  const maxColor = colors(maxValue);

  const legendLabel = useLegendLabel();
  const minValueLabel = useMinValueLabel();
  const maxValueLabel = useMaxValueLabel();

  const gradientDirection = isVertical ? "to top" : "to right";
  const gradientBackground = `linear-gradient(${gradientDirection}, ${legendColors.map(([c, position]) => `${c} ${position}`).join(", ")})`;

  return (
    <Box
      sx={{
        height: "100%",
        px: 1,
        display: "grid",
        gridTemplateRows: isVertical
          ? "auto 1fr auto" // label, legend, zero indicator
          : "auto 1fr", // label, main content
        gap: 1,
      }}
    >
      {/* Legend Label */}
      <InputLabel id="heatmap-legend-label">{legendLabel}</InputLabel>

      {/* Main legend area */}
      <Box
        sx={{
          display: isVertical ? "flex" : "grid",
          flexDirection: isVertical ? "column-reverse" : "unset",
          gridTemplateColumns: isVertical ? undefined : "auto 1fr",
          gap: 2,
          alignItems: isVertical ? "center" : "start", // Align to top for horizontal
          justifyContent: isVertical ? "center" : undefined,
        }}
      >
        {!isVertical && <ZeroValueIndicator isVertical={false} />}

        <Box
          id={id}
          data-testid="heatmap-legend"
          sx={{
            maxWidth: isVertical ? 32 : "100%",
            height: isVertical ? "100%" : 32,
            minHeight: isVertical ? 100 : undefined,
            flexBasis: isVertical ? "100%" : undefined,
            background: gradientBackground,
            borderRadius: 4,
            display: "flex",
            flexShrink: 1,
            flexGrow: 1,
            flexDirection: isVertical ? "column-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            px: isVertical ? 0.5 : 2, // minimal padding for vertical, horizontal needs space for readability
            py: isVertical ? 1 : 0, // Add vertical padding for better spacing
          }}
        >
          <ValueLabel color={maxColor}>{minValueLabel}</ValueLabel>
          <ValueLabel color={minColor}>{maxValueLabel}</ValueLabel>
        </Box>
      </Box>

      {/* Zero indicator when vertical (below legend) */}
      {isVertical && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ZeroValueIndicator isVertical={true} />
        </Box>
      )}
    </Box>
  );
}
