import React, { ChangeEvent, useId } from "react";
import { useColorScale } from "../../contexts/ColorScaleContext";
import {
  HEATMAP_THEMES_LIST,
  HeatmapTheme,
  heatmapThemes,
  heatmapThemesInverted,
} from "../../utils/heatmap-themes";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { styled, useTheme } from "@mui/material/styles";
import { useEventCallback } from "@mui/material/utils";

import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import {
  AxisConfigStore,
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useSetTheme } from "../../contexts/CellPopThemeContext";
import {
  useGraphTypeControlIsDisabled,
  useNormalizationControlIsDisabled,
  useThemeControlIsDisabled,
} from "../../contexts/DisabledControlProvider";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import {
  GRAPH_TYPES,
  GRAPH_TYPE_DESCRIPTIONS,
  GraphType,
  useGraphType,
} from "../../contexts/FractionContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import {
  NORMALIZATIONS,
  NORMALIZATION_DESCRIPTIONS,
} from "../../utils/normalizations";
import LabelledSwitch from "../LabelledSwitch";

interface ColorBoxProps {
  color: string;
}

const ColorBox = styled(Box)<ColorBoxProps>(({ theme, color }) => ({
  width: theme.spacing(1.5),
  height: theme.spacing(1.5),
  backgroundColor: color,
  borderRadius: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
}));

function ThemePreview({
  theme,
  isInverted,
}: {
  theme: HeatmapTheme;
  isInverted?: boolean;
}) {
  const muiTheme = useTheme();

  const themeList = isInverted ? heatmapThemesInverted : heatmapThemes;
  const interpolator = themeList[theme];

  // Generate 10 color samples from the theme
  const colorSamples = Array.from({ length: 10 }, (_, i) =>
    interpolator(i / 9),
  );

  // Zero value uses the background color
  const zeroColor = muiTheme.palette.background.default;

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography sx={{ textTransform: "capitalize", minWidth: 80 }}>
        {theme}
      </Typography>
      <Divider orientation="vertical" flexItem />
      <Stack direction="row" spacing={0.25}>
        {/* Zero value indicator */}
        <ColorBox color={zeroColor} />
        {/* Color gradient samples */}
        {colorSamples.map((color, index) => (
          <ColorBox key={index} color={color} />
        ))}
      </Stack>
    </Stack>
  );
}

export function HeatmapThemeControl() {
  const { setHeatmapTheme, heatmapTheme, isInverted, toggleInvert } =
    useColorScale();
  const trackEvent = useTrackEvent();

  const handleThemeChange = useEventCallback((e: SelectChangeEvent) => {
    setHeatmapTheme(e.target.value as HeatmapTheme);
    trackEvent("Change Heatmap Theme", e.target.value);
  });
  const handleInvertChange = useEventCallback((_, checked: boolean) => {
    toggleInvert();
    trackEvent("Toggle Heatmap Inversion", checked ? "Inverted" : "Normal");
  });

  return (
    <Stack direction="column" spacing={1} width="100%">
      <Stack direction="row" spacing={2} alignItems="center" flexWrap={"wrap"}>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="heatmap-theme-select-label">
            Heatmap Themes
          </InputLabel>
          <Select
            labelId="heatmap-theme-select-label"
            id="heatmap-theme-select"
            value={heatmapTheme}
            onChange={handleThemeChange}
            variant="outlined"
            label="Heatmap Themes"
            sx={{ textTransform: "capitalize", minWidth: "100%" }}
          >
            {HEATMAP_THEMES_LIST.map((theme) => (
              <MenuItem
                key={theme}
                value={theme}
                sx={{
                  py: 1,
                  px: 2,
                }}
              >
                <ThemePreview theme={theme} isInverted={isInverted} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox checked={isInverted} onChange={handleInvertChange} />
          }
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <Box>Invert</Box>
            </Stack>
          }
        />
      </Stack>
      <FormHelperText>
        Select a theme for the heatmap visualization. This will change the color
        scale used to represent data values. The &quot;Invert&quot; option
        allows reversing the color scale, which can be necessary for certain
        themes to work with light/dark mode.
      </FormHelperText>
    </Stack>
  );
}

export function ThemeControl() {
  const themeIsDisabled = useThemeControlIsDisabled();

  const { currentTheme, setTheme } = useSetTheme();
  const trackEvent = useTrackEvent();

  const changeVisTheme = useEventCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newTheme = e.target.checked ? "dark" : "light";
      setTheme(newTheme);
      trackEvent("Change Visualization Theme", newTheme);
    },
  );
  if (themeIsDisabled) {
    return null;
  }

  return (
    <LabelledSwitch
      label="Theme"
      leftLabel="Light"
      rightLabel="Dark"
      onChange={changeVisTheme}
      checked={currentTheme === "dark"}
      tooltip="Toggle between light and dark themes for the visualization."
      tooltipIsHelper
    />
  );
}

export function GraphTypeControl() {
  const { graphType, setGraphType } = useGraphType();
  const trackEvent = useTrackEvent();
  const changeGraphType = useEventCallback((event: SelectChangeEvent) => {
    const newGraphType = event.target.value as GraphType;
    setGraphType(newGraphType);
    trackEvent("Change Graph Type", newGraphType);
  });
  const fractionIsDisabled = useGraphTypeControlIsDisabled();
  const id = useId();

  if (fractionIsDisabled) {
    return null;
  }

  return (
    <Stack direction="column" spacing={1} width="100%">
      <FormControl fullWidth>
        <InputLabel id={id}>Graph Type</InputLabel>
        <Select
          labelId={id}
          id={`${id}-select`}
          value={graphType}
          onChange={changeGraphType}
          variant="outlined"
          label="Graph Type"
          sx={{ minWidth: 200 }}
        >
          {GRAPH_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              <Stack direction="column" spacing={0.5} sx={{ width: "100%" }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {type}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "none",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    lineHeight: 1.3,
                    maxWidth: "100%",
                  }}
                >
                  {GRAPH_TYPE_DESCRIPTIONS[type]}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormHelperText>
        Select the type of graph to display in the side panels. &quot;Bars&quot;
        shows simple bar charts, &quot;Stacked Bars&quot; shows segmented bars
        with colors matching the heatmap cells, and &quot;Violins&quot; shows
        violin plots representing data distributions.
      </FormHelperText>
    </Stack>
  );
}

export function NormalizationControl() {
  const normalizationIsDisabled = useNormalizationControlIsDisabled();
  const { normalization, setNormalization } = useNormalization();
  const changeNormalization = useEventCallback((event: SelectChangeEvent) => {
    setNormalization(event.target.value as (typeof NORMALIZATIONS)[number]);
  });

  const id = useId();

  if (normalizationIsDisabled) {
    return null;
  }

  return (
    <Stack direction="column" spacing={1} width="100%">
      <FormControl fullWidth>
        <InputLabel id={id}>Heatmap Normalization</InputLabel>
        <Select
          labelId={id}
          id={`${id}-select`}
          value={normalization}
          onChange={changeNormalization}
          variant="outlined"
          label="Heatmap Normalization"
          sx={{ textTransform: "capitalize", minWidth: 200 }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxWidth: 400,
                "& .MuiMenuItem-root": {
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                },
              },
            },
          }}
        >
          {NORMALIZATIONS.map((normalization) => (
            <MenuItem
              key={normalization}
              value={normalization}
              sx={{
                textTransform: "capitalize",
                maxWidth: "100%", // Limit width to prevent overly wide dropdowns
                whiteSpace: "normal", // Allow text wrapping
              }}
            >
              <Stack direction="column" spacing={0.5} sx={{ width: "100%" }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {normalization}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "none",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    lineHeight: 1.3,
                    maxWidth: "100%",
                  }}
                >
                  {NORMALIZATION_DESCRIPTIONS[normalization]}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormHelperText>
        Select a normalization method for the heatmap. This will affect how data
        values are scaled and displayed.
      </FormHelperText>
    </Stack>
  );
}

interface ZoomBandwidthControlProps {
  axisConfig: AxisConfigStore;
  label: string;
  sublabel: string;
  id?: string;
}

function ZoomBandwidthFormControl({
  axisConfig,
  label,
  sublabel,
  id = label.toLowerCase().replace(" ", "-"),
}: ZoomBandwidthControlProps) {
  const { zoomed, zoomedBandwidth, toggleZoom, setZoomBandwidth } = axisConfig;

  const handleBandwidthChange = useEventCallback(
    (_: Event, value: number | number[]) => {
      if (Array.isArray(value)) {
        return;
      }
      setZoomBandwidth(value);
    },
  );

  return (
    <Stack>
      <FormControl fullWidth>
        <Typography
          id={`${id}-zoom-bandwidth-label`}
          gutterBottom
          component="label"
        >
          {label}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Checkbox
            checked={zoomed}
            onChange={toggleZoom}
            aria-label={`Enable zoom on ${sublabel} axis`}
          />
          <Slider
            value={zoomedBandwidth}
            disabled={!zoomed}
            min={5}
            max={50}
            step={1}
            onChange={handleBandwidthChange}
            aria-labelledby={`${id}-zoom-bandwidth-label`}
            valueLabelDisplay="auto"
          />
        </Stack>
      </FormControl>
      <FormHelperText>Adjust the zoom bandwidth for {sublabel}.</FormHelperText>
    </Stack>
  );
}

/**
 * Zoom Bandwidth Control
 * This component can be used to control the size of each cell in the visualization
 * when the user is zoomed in.
 */
export function ZoomBandwidthControl() {
  const rowConfig = useRowConfig();
  const colConfig = useColumnConfig();

  return (
    <Stack width={"100%"} spacing={2}>
      <ZoomBandwidthFormControl
        axisConfig={rowConfig}
        label="Column Width Zoom"
        sublabel={colConfig.pluralLabel}
      />
      <ZoomBandwidthFormControl
        axisConfig={colConfig}
        label="Row Height Zoom"
        sublabel={rowConfig.pluralLabel}
      />
    </Stack>
  );
}
