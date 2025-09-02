import React, { ChangeEvent, useId } from "react";
import MenuItemWithDescription from "../../components/MenuItemWithDescription";
import { useColorScale } from "../../contexts/ColorScaleContext";
import { useViewType } from "../../contexts/ViewTypeContext";
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
  Button,
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
  useSwapAxisConfigs,
} from "../../contexts/AxisConfigContext";
import { useSetTheme } from "../../contexts/CellPopThemeContext";
import { useTranspose } from "../../contexts/DataContext";
import {
  useGraphTypeControlIsDisabled,
  useNormalizationControlIsDisabled,
  useThemeControlIsDisabled,
} from "../../contexts/DisabledControlProvider";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import {
  useLeftGraphType,
  useSetLeftGraphType,
  useSetTopGraphType,
  useTopGraphType,
} from "../../contexts/IndividualGraphTypeContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import useBoolean from "../../hooks/useBoolean";
import {
  GRAPH_TYPES,
  GRAPH_TYPE_DESCRIPTIONS,
  GraphType,
} from "../../utils/graph-types";
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

export function LeftGraphTypeControl() {
  const leftGraphType = useLeftGraphType();
  const setLeftGraphType = useSetLeftGraphType();
  const trackEvent = useTrackEvent();
  const changeGraphType = useEventCallback((event: SelectChangeEvent) => {
    const newGraphType = event.target.value as GraphType;
    setLeftGraphType(newGraphType);
    trackEvent("Change Left Graph Type", newGraphType);
  });
  const fractionIsDisabled = useGraphTypeControlIsDisabled();
  const id = useId();

  if (fractionIsDisabled) {
    return null;
  }

  return (
    <Stack direction="column" spacing={1} width="100%">
      <FormControl fullWidth>
        <InputLabel id={id}>Left Graph Type</InputLabel>
        <Select
          labelId={id}
          id={`${id}-select`}
          value={leftGraphType}
          onChange={changeGraphType}
          variant="outlined"
          label="Left Graph Type"
          sx={{ minWidth: 200 }}
          renderValue={(value) => value as string}
        >
          {GRAPH_TYPES.map((type) => (
            <MenuItemWithDescription
              key={type}
              value={type}
              title={type}
              description={GRAPH_TYPE_DESCRIPTIONS[type]}
            />
          ))}
        </Select>
      </FormControl>
      <FormHelperText>
        Select the type of graph to display in the left panel.
      </FormHelperText>
    </Stack>
  );
}

export function TopGraphTypeControl() {
  const topGraphType = useTopGraphType();
  const setTopGraphType = useSetTopGraphType();
  const trackEvent = useTrackEvent();
  const changeGraphType = useEventCallback((event: SelectChangeEvent) => {
    const newGraphType = event.target.value as GraphType;
    setTopGraphType(newGraphType);
    trackEvent("Change Top Graph Type", newGraphType);
  });
  const fractionIsDisabled = useGraphTypeControlIsDisabled();
  const id = useId();

  if (fractionIsDisabled) {
    return null;
  }

  return (
    <Stack direction="column" spacing={1} width="100%">
      <FormControl fullWidth>
        <InputLabel id={id}>Top Graph Type</InputLabel>
        <Select
          labelId={id}
          id={`${id}-select`}
          value={topGraphType}
          onChange={changeGraphType}
          variant="outlined"
          label="Top Graph Type"
          sx={{ minWidth: 200 }}
          renderValue={(value) => value as string}
        >
          {GRAPH_TYPES.map((type) => (
            <MenuItemWithDescription
              key={type}
              value={type}
              title={type}
              description={GRAPH_TYPE_DESCRIPTIONS[type]}
            />
          ))}
        </Select>
      </FormControl>
      <FormHelperText>
        Select the type of graph to display in the top panel.
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
          renderValue={(value) => value as string}
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
            <MenuItemWithDescription
              key={normalization}
              value={normalization}
              title={normalization}
              description={NORMALIZATION_DESCRIPTIONS[normalization]}
              sx={{
                textTransform: "capitalize",
                maxWidth: "100%",
                whiteSpace: "normal",
              }}
            />
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

export function TransposeControl() {
  const transposeData = useTranspose();
  const swapAxisConfigs = useSwapAxisConfigs();
  const trackEvent = useTrackEvent();

  const rowConfig = useRowConfig();
  const columnConfig = useColumnConfig();

  const xScale = useXScale();
  const yScale = useYScale();
  const expandedValues = useSelectedValues();

  const [hasBeenTransposed, , , toggleHasBeenTransposed] = useBoolean(false);

  const handleTranspose = useEventCallback(() => {
    // First transpose the data
    transposeData();
    // Then swap the axis configurations
    swapAxisConfigs();
    // Reset scroll positions to avoid invalid states
    xScale.resetScroll();
    yScale.resetScroll();
    // Reset expanded rows since they no longer make sense after transpose
    expandedValues.reset();

    toggleHasBeenTransposed();
    trackEvent("Transpose Data", "");
  });

  const currentRowConfig = hasBeenTransposed ? rowConfig : columnConfig;
  const currentColumnConfig = hasBeenTransposed ? columnConfig : rowConfig;

  return (
    <Stack direction="column" spacing={1} width="100%">
      <Button
        variant="outlined"
        onClick={handleTranspose}
        sx={{ textTransform: "none" }}
      >
        Transpose Rows and Columns
      </Button>
      <FormHelperText>
        Swap rows and columns in the visualization. Currently showing{" "}
        <strong>{currentRowConfig.pluralLabel}</strong> as rows and{" "}
        <strong>{currentColumnConfig.pluralLabel}</strong> as columns.
      </FormHelperText>
    </Stack>
  );
}

export function ViewTypeControl() {
  const { viewType, setTraditional, setDefault } = useViewType();
  const setTopGraphType = useSetTopGraphType();
  const trackEvent = useTrackEvent();

  const handleViewTypeChange = useEventCallback((event: SelectChangeEvent) => {
    const newViewType = event.target.value as "traditional" | "default";
    if (newViewType === "traditional") {
      setTraditional();
      setTopGraphType("Stacked Bars (Categorical)");
    } else {
      setDefault();
    }
    trackEvent("Change View Type", newViewType);
  });

  const id = useId();

  return (
    <Stack direction="column" spacing={1} width="100%">
      <FormControl fullWidth>
        <InputLabel id={id}>View Type</InputLabel>
        <Select
          labelId={id}
          id={`${id}-select`}
          value={viewType}
          onChange={handleViewTypeChange}
          variant="outlined"
          label="View Type"
          sx={{ textTransform: "capitalize", minWidth: 200 }}
          renderValue={(value) => value as string}
        >
          <MenuItemWithDescription
            value="default"
            title="Default"
            description="Standard 3x3 grid layout with all panels visible"
          />
          <MenuItemWithDescription
            value="traditional"
            title="Traditional"
            description="Simplified layout focusing on only the top stacked bar chart."
          />
        </Select>
      </FormControl>
      <FormHelperText>
        Select the layout view type. Traditional view shows only the top row of
        panels with larger heatmap proportions, while default view shows all
        panels in a 3x3 grid.
      </FormHelperText>
    </Stack>
  );
}
