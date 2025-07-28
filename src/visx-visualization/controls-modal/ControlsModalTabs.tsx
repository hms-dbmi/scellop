import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import React, { useCallback, useState } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { PlotControlSection } from "../plot-controls.tsx";
import {
  FractionControl,
  HeatmapThemeControl,
  NormalizationControl,
  SelectedDimensionControl,
  ThemeControl,
} from "../plot-controls.tsx/Controls";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

/**
 * ControlsModalTabs component renders a set of tabs for controlling plot settings.
 */
export default function ControlsModalTabs() {
  const isMobile = useIsMobile();
  const orientation = isMobile ? "horizontal" : "vertical"; // Horizontal tabs work best for mobile
  const [value, setValue] = useState(0);
  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    },
    [],
  );

  return (
    <Stack direction={isMobile ? "column" : "row"}>
      <Tabs
        orientation={orientation}
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        <Tab label="Plot Controls" {...a11yProps(0)} />
        <Tab label="Row Controls" {...a11yProps(1)} />
        <Tab label="Column Controls" {...a11yProps(2)} />
      </Tabs>
      <Box
        minHeight={isMobile ? "auto" : "100%"}
        maxHeight={{
          xs: "unset",
          md: "calc(70vh)",
        }}
        overflow={{
          xs: "unset",
          md: "auto",
        }}
        sx={{ flexGrow: 1 }}
      >
        <TabPanel value={value} index={0}>
          <HeatmapThemeControl />
          <NormalizationControl />
          <ThemeControl />
          <SelectedDimensionControl />
          <FractionControl />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PlotControlSection value="Row" />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <PlotControlSection value="Column" />
        </TabPanel>
      </Box>
    </Stack>
  );
}
