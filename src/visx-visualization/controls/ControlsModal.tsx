import ControlsModalTabs from "./ControlsModalTabs";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Paper, { PaperProps } from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import React from "react";
import {
  useControlsVisibility,
  useControlsVisibilityActions,
} from "../../contexts/ControlsVisibilityContext";
import { TemporalControls } from "../TemporalControls";

// Draggable Dialog Content Component
function DraggableDialogContent({
  children,
  fullScreen,
  positionRef,
}: {
  children: React.ReactNode;
  fullScreen: boolean;
  positionRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "controls-modal",
  });

  const style = {
    transform: `translate3d(${positionRef.current.x + (transform?.x ?? 0)}px, ${positionRef.current.y + (transform?.y ?? 0)}px, 0)`,
  };

  if (fullScreen) {
    // Don't make the dialog draggable on fullscreen mode (mobile)
    return <>{children}</>;
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        margin: 0,
        maxWidth: "none",
        borderRadius: 1,
        boxShadow: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Draggable handle - the title area */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        pr={2}
        {...listeners}
        {...attributes}
        sx={{
          cursor: "move",
          "&:active": {
            cursor: "grabbing",
          },
        }}
      >
        <DialogTitle>Settings</DialogTitle>
        <TemporalControls />
      </Stack>
      {children}
    </Paper>
  );
}

export function ControlsModal() {
  const { isControlsVisible } = useControlsVisibility();
  const { hideControls } = useControlsVisibilityActions();
  const theme = useTheme();
  // Use fullScreen view for smaller screens
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // State to track dialog position
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  // Use a ref to avoid recreating the component when position changes
  const positionRef = React.useRef(position);
  positionRef.current = position;

  // Reset position when dialog opens
  React.useEffect(() => {
    if (isControlsVisible) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isControlsVisible]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  // Memoize the PaperComponent to prevent recreation on every render
  const DraggablePaperComponent = React.useCallback(
    (props: PaperProps) => (
      <DraggableDialogContent fullScreen={fullScreen} positionRef={positionRef}>
        {props.children}
      </DraggableDialogContent>
    ),
    [fullScreen],
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Dialog
        open={isControlsVisible}
        onClose={hideControls}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
        PaperComponent={fullScreen ? undefined : DraggablePaperComponent}
        slotProps={
          fullScreen
            ? {
                paper: {
                  sx: {
                    margin: 2,
                    maxHeight: "calc(100% - 32px)",
                  },
                },
              }
            : undefined
        }
      >
        {fullScreen && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            pr={2}
          >
            <DialogTitle>Settings</DialogTitle>
            <TemporalControls />
          </Stack>
        )}
        <ControlsModalTabs />
        <DialogActions sx={{ mt: "auto" }}>
          <Button onClick={hideControls} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  );
}
