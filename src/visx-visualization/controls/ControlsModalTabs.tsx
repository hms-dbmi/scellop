import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
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
  GraphTypeControl,
  HeatmapThemeControl,
  NormalizationControl,
  ThemeControl,
  ZoomBandwidthControl,
} from "./Controls";
import {
  CustomTabWithSubItems,
  HorizontalSubItems,
  SubItem,
} from "./CustomTabWithSubItems";

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
      display={value === index ? "block" : "none"}
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

interface ControlsModalTabsProps {
  hideControls: () => void;
}

const scrollToSection = (section: string) => {
  document.getElementById(section)?.scrollIntoView({
    behavior: "smooth",
  });
};

const rowSubItems = [
  {
    id: "row-sorts",
    label: "Sorts",
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      scrollToSection("sort-options-Row");
    },
  },
  {
    id: "row-display",
    label: "Display Options",
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      scrollToSection("display-options-Row");
    },
  },
];
const columnSubItems = [
  {
    id: "column-sorts",
    label: "Sorts",
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      scrollToSection("sort-options-Column");
    },
  },
  {
    id: "column-display",
    label: "Display Options",
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      scrollToSection("display-options-Column");
    },
  },
];

/**
 * ControlsModalTabs component renders a set of tabs for controlling plot settings.
 */
export default function ControlsModalTabs({
  hideControls,
}: ControlsModalTabsProps) {
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

  const handleSubItemClick = useCallback(
    (subItem: SubItem) => (event: React.MouseEvent<HTMLElement>) => {
      // Prevent event propagation to parent Tabs
      event.stopPropagation();

      // In horizontal mode, we need to determine which tab this sub-item belongs to
      // and ensure that tab is selected
      if (orientation === "horizontal") {
        let targetTabIndex = value;

        // Determine which tab this sub-item belongs to
        if (rowSubItems.some((item) => item.id === subItem.id)) {
          targetTabIndex = 1;
        } else if (columnSubItems.some((item) => item.id === subItem.id)) {
          targetTabIndex = 2;
        }

        // If the target tab is not currently selected, select it first
        if (targetTabIndex !== value) {
          setValue(targetTabIndex);

          // Delay the sub-item action to allow the tab content to render
          setTimeout(() => {
            if (subItem.onClick) {
              subItem.onClick(event);
            }
          }, 100);
          return;
        }
      }

      // Call the sub-item's onClick handler immediately if tab is already selected
      if (subItem.onClick) {
        subItem.onClick(event);
      }
    },
    [orientation, value, rowSubItems, columnSubItems],
  );

  // Get sub-items for the currently selected tab in horizontal mode
  const getSubItemsForTab = (tabIndex: number) => {
    if (tabIndex === 1) return rowSubItems;
    if (tabIndex === 2) return columnSubItems;
    return [];
  };

  const currentSubItems =
    orientation === "horizontal" ? getSubItemsForTab(value) : [];

  return (
    <Stack
      direction={{
        xs: "column",
        md: orientation === "vertical" ? "row" : "column",
      }}
      flexGrow={1}
      maxHeight={{
        // accounting for the DialogActions and header heights, plus sub-items in horizontal mode
        xs:
          currentSubItems.length > 0
            ? "calc(100% - 88px)"
            : "calc(100% - 48px)",
        md: "calc(100% - 64px)",
      }}
      sx={{
        overflowX: "hidden",
      }}
      position="relative"
      top={0}
    >
      <Stack
        direction="column"
        sx={{
          display: "flex",
          flexShrink: isMobile ? 1 : 0,
          width: orientation === "horizontal" ? "100%" : "auto",
          minWidth: 0, // Allow shrinking below content size
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <Tabs
          orientation={orientation}
          variant={variant}
          value={value}
          onChange={handleChange}
          sx={{
            borderRight: orientation === "vertical" ? 1 : 0,
            borderBottom: orientation === "horizontal" ? 1 : 0,
            borderColor: "divider",
            overflowX: "hidden", // Prevent horizontal overflow only
            " & .MuiTab-root": {
              whiteSpace: "nowrap",
              justifyContent: isMobile ? "center" : "flex-start",
              textAlign: isMobile ? "center" : "left",
              minWidth: isMobile ? 0 : "auto", // Allow tabs to shrink on mobile
            },
            minWidth: isMobile
              ? undefined
              : orientation === "vertical"
                ? 180
                : "auto",
          }}
        >
          <Tab
            label="Plot"
            id="plot-settings-tab"
            aria-controls="plot-settings-panel"
            sx={{
              justifyContent: isMobile ? "center" : "flex-start",
              alignItems: isMobile ? "center" : "flex-start",
              textAlign: isMobile ? "center" : "left",
              minWidth: isMobile ? 0 : "auto",
            }}
          />
          <CustomTabWithSubItems
            label={rowLabel}
            id="row-settings-tab"
            aria-controls="row-settings-panel"
            orientation={orientation}
            selected={value === 1}
            subItems={rowSubItems}
            onClick={(event) => handleChange(event, 1)}
            onTabSelect={(event) => handleChange(event, 1)}
          />
          <CustomTabWithSubItems
            label={columnLabel}
            id="column-settings-tab"
            aria-controls="column-settings-panel"
            orientation={orientation}
            selected={value === 2}
            subItems={columnSubItems}
            onClick={(event) => handleChange(event, 2)}
            onTabSelect={(event) => handleChange(event, 2)}
          />
        </Tabs>

        {/* Horizontal sub-items */}
        {orientation === "horizontal" && currentSubItems.length > 0 && (
          <HorizontalSubItems
            subItems={currentSubItems}
            onSubItemClick={handleSubItemClick}
          />
        )}
      </Stack>
      <Box display="flex" flexDirection="column" flexGrow={1} minWidth={0}>
        <Box flexGrow={1} overflow="auto">
          <TabPanel
            value={value}
            index={0}
            id="plot-settings-panel"
            aria-labelledby="plot-settings-tab"
          >
            <Stack
              px={2}
              spacing={2}
              alignItems="start"
              flexGrow={1}
              height="100%"
            >
              <ThemeControl />
              <HeatmapThemeControl />
              <NormalizationControl />
              <Divider flexItem />
              <GraphTypeControl />
              <Divider flexItem />
              <ZoomBandwidthControl />
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

        <DialogActions sx={{ mt: "auto", flexShrink: 0 }}>
          <Button onClick={hideControls} color="primary">
            Close
          </Button>
        </DialogActions>
      </Box>
    </Stack>
  );
}
