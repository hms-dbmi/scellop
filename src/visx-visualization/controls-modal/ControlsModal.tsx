import { DndContext, useDraggable } from "@dnd-kit/core";
import ControlsModalTabs from "./ControlsModalTabs";
import ControlsModalTrigger from "./ControlsModalTrigger";

import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogTitleProps,
  Paper,
  PaperProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { TemporalControls } from "../TemporalControls";

const useBoolean = (initialValue: boolean = false) => {
  const [state, setState] = useState(initialValue);
  const toggle = useCallback(() => setState((prev) => !prev), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  return [state, setTrue, setFalse, toggle] as const;
};

function DraggablePaper(props: PaperProps) {
  const { children, ...other } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "dialog-title",
  });
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: CSS.Translate.toString(transform),
    cursor: "move",
    ...other.style,
  });

  const onDragEnd = useCallback(() => {
    setStyle((prev) => ({
      ...prev,
      transform: CSS.Translate.toString(transform),
    }));
  }, [transform]);

  return (
    <Paper
      {...other}
      {...listeners}
      {...attributes}
      style={style}
      ref={setNodeRef}
      onDragEnd={onDragEnd}
    >
      {children}
    </Paper>
  );
}

export function ControlsModal() {
  const [isOpen, open, close] = useBoolean(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <DndContext>
      <Dialog
        open={isOpen}
        onClose={close}
        fullWidth
        maxWidth="md" // Adjust maxWidth as needed
        fullScreen={fullScreen} // Use full screen on mobile
        sx={{ pointerEvents: "auto" }} // Ensure pointer events are enabled
        PaperComponent={DraggablePaper}
      >
        <DialogTitle>Plot Controls</DialogTitle>

        <ControlsModalTabs />
        <DialogActions>
          <TemporalControls />
        </DialogActions>
      </Dialog>
      <ControlsModalTrigger onClick={open} />
    </DndContext>
  );
}
