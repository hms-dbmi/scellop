import { CloseRounded, Settings } from "@mui/icons-material";
import Button from "@mui/material/Button";
import React, { PropsWithChildren, useState } from "react";
import { useOuterContainerRef } from "../../contexts/ContainerRefContext";

import {
  Box,
  Divider,
  IconButton,
  Stack,
  styled,
  Tab,
  Tabs,
  Typography,
  useEventCallback,
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { DisplayControls } from "./DisplayControls";
import { JumpToSection } from "./JumpToSection";
import {
  PlotControlsSection,
  PlotControlsSectionProvider,
} from "./PlotControlsContext";
import { SortControls } from "./SortControls";

interface PlotControlsProps {
  onClose: () => void;
}

interface PlotControlSectionProps extends PropsWithChildren {
  selectedValue: PlotControlsSection;
  value: PlotControlsSection;
}

function PlotControlSection({
  value,
  selectedValue,
  ...other
}: PlotControlSectionProps) {
  return (
    <PlotControlsSectionProvider value={value}>
      <div
        role="tabpanel"
        hidden={value !== selectedValue}
        id={`tabpanel-${value}`}
        aria-labelledby={`simple-tab-${value}`}
        {...other}
      >
        <Divider />
        <SortControls />
        <Divider />
        <DisplayControls />
      </div>
    </PlotControlsSectionProvider>
  );
}

function PlotControls({ onClose }: PlotControlsProps) {
  const [selectedTab, setSelectedTab] = useState<PlotControlsSection>("Row");
  const columnLabel = useColumnConfig((s) => s.label);
  const columnIcon = useColumnConfig((s) => s.icon);
  const rowLabel = useRowConfig((s) => s.label);
  const rowIcon = useRowConfig((s) => s.icon);

  return (
    <Stack spacing={2} paddingY={2} direction="column" position="relative">
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
          pt: 1.5,
        }}
      >
        <Stack
          spacing={2}
          px={2}
          alignItems="center"
          justifyContent="space-between"
          direction="row"
        >
          <Typography variant="h5" component="label">
            Plot Controls
          </Typography>
          <IconButton aria-label="Close Plot Controls" onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </Stack>
        <Tabs
          variant="fullWidth"
          value={selectedTab}
          onChange={(_e, value) => setSelectedTab(value)}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Tab
            label={`Row: ${rowLabel}`}
            value="Row"
            icon={rowIcon}
            iconPosition="start"
          />
          <Tab
            label={`Column: ${columnLabel}`}
            value="Column"
            icon={columnIcon}
            iconPosition="start"
          />
        </Tabs>
        <JumpToSection section={selectedTab} />
      </Box>
      <PlotControlSection value="Row" selectedValue={selectedTab} />
      <PlotControlSection value="Column" selectedValue={selectedTab} />
    </Stack>
  );
}

const StyledDrawer = styled(Drawer)(() => ({
  position: "absolute",
  top: 0,
  zIndex: 1099,
}));

export function PlotControlsButton() {
  const parentRef = useOuterContainerRef();
  const [showDrawer, setShowDrawer] = useState(false);
  const closeDrawer = useEventCallback(() => setShowDrawer(false));
  const openDrawer = useEventCallback(() => setShowDrawer(true));

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Settings />}
        onClick={openDrawer}
      >
        Plot Controls
      </Button>
      <StyledDrawer
        container={parentRef.current}
        open={showDrawer}
        onClose={closeDrawer}
        anchor="right"
        transitionDuration={{
          enter: 0,
          exit: 300,
        }}
        ModalProps={{
          sx: {
            position: "absolute",
          },
        }}
        slotProps={{
          backdrop: {
            invisible: true,
          },
        }}
        PaperProps={{
          sx: {
            maxWidth: {
              xs: "100%",
              md: 450,
            },
            position: "absolute",
            top: 0,
            right: 0,
            scrollBehavior: "smooth",
          },
        }}
      >
        <PlotControls onClose={closeDrawer} />
      </StyledDrawer>
    </>
  );
}
