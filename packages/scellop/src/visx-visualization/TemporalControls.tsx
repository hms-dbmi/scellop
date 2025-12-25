import React from "react";

import { RedoRounded, RestoreOutlined, UndoRounded } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";

import Button from "@mui/material/Button";
import { useTemporalControls } from "../contexts/TemporalControlsContext";

export function TemporalControls() {
  const { undo, canUndo, redo, canRedo, restoreToDefault } =
    useTemporalControls();
  return (
    <Box display="inline-flex" gap={1}>
      <Tooltip title="Reset the visualization to its initial state">
        <Button
          onClick={restoreToDefault}
          disabled={!canUndo}
          endIcon={<RestoreOutlined />}
          variant="text"
        >
          Reset
        </Button>
      </Tooltip>
      <Tooltip title="Undo the last change">
        <IconButton
          onClick={undo}
          aria-label="Undo"
          component={IconButton}
          disabled={!canUndo}
          sx={{
            minWidth: 0,
            padding: 0.5,
            aspectRatio: "1/1",
          }}
        >
          <UndoRounded />
        </IconButton>
      </Tooltip>
      <Tooltip title="Redo the last undone change">
        <IconButton
          onClick={redo}
          aria-label="Redo"
          component={IconButton}
          disabled={!canRedo}
          sx={{
            minWidth: 0,
            padding: 0.5,
            aspectRatio: "1/1",
          }}
        >
          <RedoRounded />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
