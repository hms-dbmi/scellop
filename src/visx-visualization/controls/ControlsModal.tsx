import ControlsModalTabs from "./ControlsModalTabs";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import React from "react";
import {
  useControlsVisibility,
  useControlsVisibilityActions,
} from "../../contexts/ControlsVisibilityContext";
import { TemporalControls } from "../TemporalControls";

export function ControlsModal() {
  const { isControlsVisible } = useControlsVisibility();
  const { hideControls } = useControlsVisibilityActions();
  const theme = useTheme();
  // Use fullScreen view for smaller screens
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={isControlsVisible}
      onClose={hideControls}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        pr={2}
      >
        <DialogTitle>Settings</DialogTitle>
        <TemporalControls />
      </Stack>
      <ControlsModalTabs />
      <DialogActions sx={{ mt: "auto" }}>
        <Button onClick={hideControls} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
