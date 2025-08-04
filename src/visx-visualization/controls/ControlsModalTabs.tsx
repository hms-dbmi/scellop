import Box, { BoxProps } from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, { useCallback, useState } from "react";
import { PlotControlSection } from ".";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useIsMobile } from "../../hooks/useMediaQueries";
import {
  FractionControl,
  HeatmapThemeControl,
  NormalizationControl,
  ThemeControl,
} from "./Controls";

interface TabPanelProps extends BoxProps {
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      flexGrow={1}
      display={value === index ? "flex" : "none"}
      width="100%"
      height="100%"
      {...other}
    >
      {value === index && (
        <Box p={2} pl={0} flexGrow={1}>
          {children}
        </Box>
      )}
    </Box>
  );
}

/**
 * ControlsModalTabs component renders a set of tabs for controlling plot settings.
 */
export default function ControlsModalTabs() {
  const isMobile = useIsMobile();
  // Horizontal tabs work best for mobile
  const orientation = isMobile ? "horizontal" : "vertical";
  const variant = isMobile ? "fullWidth" : "standard";
  const [value, setValue] = useState(0);
  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    },
    [],
  );

  const rowLabel = useRowConfig((state) => state.pluralLabel);
  const columnLabel = useColumnConfig((state) => state.pluralLabel);

  return (
    <Stack direction={isMobile ? "column" : "row"} flexGrow={1} height="100%">
      <Tabs
        orientation={orientation}
        variant={variant}
        value={value}
        onChange={handleChange}
        sx={{
          borderRight: 1,
          borderColor: "divider",
          " & .MuiTab-root": {
            whiteSpace: "nowrap",
          },
        }}
      >
        <Tab
          label="Plot"
          id="plot-settings-tab"
          aria-controls="plot-settings-panel"
        />
        <Tab
          label={rowLabel}
          id="row-settings-tab"
          aria-controls="row-settings-panel"
        />
        <Tab
          label={columnLabel}
          id="column-settings-tab"
          aria-controls="column-settings-panel"
        />
      </Tabs>
      <Box
        minHeight={isMobile ? "auto" : "100%"}
        maxHeight={{
          xs: "unset",
          md: "70vh",
        }}
        height={{
          xs: "unset",
          md: "70vh",
        }}
        overflow={{
          xs: "unset",
          md: "auto",
        }}
        display="flex"
        flexGrow={1}
        sx={{
          transition: "height 0.3s ease-in-out",
        }}
      >
        <TabPanel
          value={value}
          index={0}
          id="plot-settings-panel"
          aria-labelledby="plot-settings-tab"
        >
          <Stack
            pl={2}
            spacing={2}
            alignItems="start"
            flexGrow={1}
            width="100%"
          >
            <HeatmapThemeControl />
            <NormalizationControl />
            <ThemeControl />
            <FractionControl />
          </Stack>
        </TabPanel>
        <TabPanel
          value={value}
          index={1}
          id="row-settings-panel"
          aria-labelledby="row-settings-tab"
        >
          <PlotControlSection value="Row" />
        </TabPanel>
        <TabPanel
          value={value}
          index={2}
          id="column-settings-panel"
          aria-labelledby="column-settings-tab"
        >
          <PlotControlSection value="Column" />
        </TabPanel>
      </Box>
    </Stack>
  );
}
