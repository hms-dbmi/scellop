import { Settings } from "@mui/icons-material";
import Fab from "@mui/material/Fab";
import React from "react";

interface ControlsModalTriggerProps {
  onClick?: (e: React.MouseEvent) => void;
}

export default function ControlsModalTrigger({
  onClick,
}: ControlsModalTriggerProps) {
  return (
    <Fab color="primary" aria-label="add" onClick={onClick}>
      <Settings />
    </Fab>
  );
}
