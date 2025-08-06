import React, { ChangeEvent, useId } from "react";
import { useColorScale } from "../../contexts/ColorScaleContext";
import { HEATMAP_THEMES_LIST, HeatmapTheme } from "../../utils/heatmap-themes";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useEventCallback } from "@mui/material/utils";

import {
  Checkbox,
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
  useFractionControlIsDisabled,
  useNormalizationControlIsDisabled,
  useThemeControlIsDisabled,
} from "../../contexts/DisabledControlProvider";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useFraction } from "../../contexts/FractionContext";
import {
  NORMALIZATIONS,
  useNormalization,
} from "../../contexts/NormalizationContext";
import LabelledSwitch from "../LabelledSwitch";

export function HeatmapThemeControl() {
  const { setHeatmapTheme, heatmapTheme } = useColorScale();
  const trackEvent = useTrackEvent();

  const handleThemeChange = useEventCallback((e: SelectChangeEvent) => {
    setHeatmapTheme(e.target.value as HeatmapTheme);
    trackEvent("Change Heatmap Theme", e.target.value);
  });
  return (
    <FormControl fullWidth>
      <InputLabel id="heatmap-theme-select-label">Heatmap Themes</InputLabel>
      <Select
        labelId="heatmap-theme-select-label"
        id="heatmap-theme-select"
        value={heatmapTheme}
        onChange={handleThemeChange}
        variant="outlined"
        label="Heatmap Themes"
        sx={{ textTransform: "capitalize", minWidth: 200 }}
      >
        {HEATMAP_THEMES_LIST.map((theme) => (
          <MenuItem
            key={theme}
            value={theme}
            sx={{ textTransform: "capitalize" }}
          >
            {theme}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        Select a theme for the heatmap visualization. This will change the color
        scale used to represent data values.
      </FormHelperText>
    </FormControl>
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

export function FractionControl() {
  const { fraction, setFraction } = useFraction();
  const trackEvent = useTrackEvent();
  const changeFraction = useEventCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newFraction = Boolean(event.target.checked);
      setFraction(newFraction);
      const fraction = newFraction ? "Fraction" : "Count";
      trackEvent("Change Graph Type", fraction);
    },
  );
  const fractionIsDisabled = useFractionControlIsDisabled();
  if (fractionIsDisabled) {
    return null;
  }

  return (
    <LabelledSwitch
      label="Graph Type"
      leftLabel="Count"
      rightLabel="Fraction"
      onChange={changeFraction}
      checked={fraction}
      tooltip={
        "Toggle between displaying bars representing total cell counts, or violins representing fractions of data in the plot."
      }
      tooltipIsHelper
    />
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
      >
        {NORMALIZATIONS.map((normalization) => (
          <MenuItem
            key={normalization}
            value={normalization}
            sx={{ textTransform: "capitalize" }}
          >
            {normalization}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        Select a normalization method for the heatmap. This will affect how data
        values are scaled and displayed.
      </FormHelperText>
    </FormControl>
  );
}

interface ZoomBandwidthControlProps {
  axisConfig: AxisConfigStore;
  label: string;
  id?: string;
}

function ZoomBandwidthFormControl({
  axisConfig,
  label,
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
          aria-label={`Enable zoom on ${axisConfig.label} axis`}
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
      />
      <ZoomBandwidthFormControl
        axisConfig={colConfig}
        label="Row Height Zoom"
      />
    </Stack>
  );
}
