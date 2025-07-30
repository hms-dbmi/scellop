import React from "react";

import { RedoRounded, RestoreOutlined, UndoRounded } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";

import Button from "@mui/material/Button";
import { useTemporalControls } from "../contexts/TemporalControlsContext";

export function TemporalControls() {
  const { undo, canUndo, redo, canRedo, restoreToDefault } =
    useTemporalControls();
  return (
    <Box display="inline-flex" gap={1}>
      <Button
        variant="outlined"
        onClick={restoreToDefault}
        disabled={!canUndo}
        endIcon={<RestoreOutlined />}
      >
        Restore to Default
      </Button>
      <Button
        onClick={undo}
        aria-label="Undo"
        variant="outlined"
        component={IconButton}
        disabled={!canUndo}
        sx={{
          minWidth: 0,
          padding: 0.5,
          aspectRatio: "1/1",
        }}
      >
        <UndoRounded />
      </Button>
      <Button
        onClick={redo}
        aria-label="Redo"
        variant="outlined"
        component={IconButton}
        disabled={!canRedo}
        sx={{
          minWidth: 0,
          padding: 0.5,
          aspectRatio: "1/1",
        }}
      >
        <RedoRounded />
      </Button>
    </Box>
  );
}
