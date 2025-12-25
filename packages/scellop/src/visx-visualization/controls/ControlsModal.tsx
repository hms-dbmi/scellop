import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Paper, { type PaperProps } from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useEffect } from "react";
import {
  useControlsVisibility,
  useControlsVisibilityActions,
} from "../../contexts/ControlsVisibilityContext";
import { TemporalControls } from "../TemporalControls";
import ControlsModalTabs from "./ControlsModalTabs";

// Resize handle component
function ResizeHandle({
  position,
  onResize,
}: {
  position: "se" | "sw" | "ne" | "nw" | "n" | "s" | "e" | "w";
  onResize: (deltaX: number, deltaY: number, position: string) => void;
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

  const getCursor = () => {
    switch (position) {
      case "se":
      case "nw":
        return "nw-resize";
      case "sw":
      case "ne":
        return "ne-resize";
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      default:
        return "default";
    }
  };

  const getPositionStyles = () => {
    const size = 12;
    const offset = -size / 2;

    const base = {
      position: "absolute" as const,
      cursor: getCursor(),
      backgroundColor: "transparent",
      zIndex: 1000,
      overflow: "none",
    };

    switch (position) {
      case "se":
        return {
          ...base,
          width: size,
          height: size,
          bottom: offset,
          right: offset,
        };
      case "sw":
        return {
          ...base,
          width: size,
          height: size,
          bottom: offset,
          left: offset,
        };
      case "ne":
        return {
          ...base,
          width: size,
          height: size,
          top: offset,
          right: offset,
        };
      case "nw":
        return {
          ...base,
          width: size,
          height: size,
          top: offset,
          left: offset,
        };
      case "n":
        return {
          ...base,
          width: "100%",
          height: size,
          top: offset,
          left: 0,
        };
      case "s":
        return {
          ...base,
          width: "100%",
          height: size,
          bottom: offset,
          left: 0,
        };
      case "e":
        return {
          ...base,
          width: size,
          height: "100%",
          right: offset,
          top: 0,
        };
      case "w":
        return {
          ...base,
          width: size,
          height: "100%",
          left: offset,
          top: 0,
        };
      default:
        return { ...base, width: size, height: size };
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      onResize(deltaX, deltaY, position);
      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startPos, onResize, position]);

  return (
    <hr
      style={getPositionStyles()}
      onMouseDown={handleMouseDown}
      tabIndex={0}
      aria-label={`Resize handle ${position}`}
    />
  );
}

// Draggable Dialog Content Component
function DraggableDialogContent({
  children,
  fullScreen,
  positionRef,
  sizeRef,
  onResize,
}: {
  children: React.ReactNode;
  fullScreen: boolean;
  positionRef: React.MutableRefObject<{ x: number; y: number }>;
  sizeRef: React.MutableRefObject<{ width: number; height: number }>;
  onResize: (deltaX: number, deltaY: number, position: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "controls-modal",
  });

  const style = {
    transform: `translate3d(${positionRef.current.x + (transform?.x ?? 0)}px, ${positionRef.current.y + (transform?.y ?? 0)}px, 0)`,
    width: sizeRef.current.width,
    height: sizeRef.current.height,
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

      {/* Resize handles */}
      <ResizeHandle position="se" onResize={onResize} />
      <ResizeHandle position="sw" onResize={onResize} />
      <ResizeHandle position="ne" onResize={onResize} />
      <ResizeHandle position="nw" onResize={onResize} />
      <ResizeHandle position="n" onResize={onResize} />
      <ResizeHandle position="s" onResize={onResize} />
      <ResizeHandle position="e" onResize={onResize} />
      <ResizeHandle position="w" onResize={onResize} />

      {children}
    </Paper>
  );
}

const initialSize = { width: 700, height: 800 };

export function ControlsModal() {
  const { isControlsVisible } = useControlsVisibility();
  const { hideControls } = useControlsVisibilityActions();
  const theme = useTheme();
  // Use fullScreen view for smaller screens
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // State to track dialog position and size
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [size, setSize] = React.useState(initialSize);

  // Use refs to avoid recreating the component when position/size changes
  const positionRef = React.useRef(position);
  const sizeRef = React.useRef(size);
  positionRef.current = position;
  sizeRef.current = size;

  // Reset position and size when dialog opens
  React.useEffect(() => {
    if (isControlsVisible) {
      setPosition({ x: 0, y: 0 });
      setSize(initialSize);
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

  const handleResize = React.useCallback(
    (deltaX: number, deltaY: number, position: string) => {
      setSize((prevSize) => {
        const minWidth = 400;
        const minHeight = 300;
        let newWidth = prevSize.width;
        let newHeight = prevSize.height;

        // Handle width changes
        if (position.includes("e")) {
          newWidth = Math.max(minWidth, prevSize.width + deltaX / 2);
        }
        if (position.includes("w")) {
          newWidth = Math.max(minWidth, prevSize.width - deltaX / 2);
        }

        // Handle height changes
        if (position.includes("s")) {
          newHeight = Math.max(minHeight, prevSize.height + deltaY / 2);
        }
        if (position.includes("n")) {
          newHeight = Math.max(minHeight, prevSize.height - deltaY / 2);
        }

        // Calculate position adjustments based on actual size changes
        const actualWidthChange = (newWidth - prevSize.width) / 2;
        const actualHeightChange = (newHeight - prevSize.height) / 2;

        let positionAdjustmentX = 0;
        let positionAdjustmentY = 0;

        // Adjust position to keep opposite edges anchored
        if (position.includes("w")) {
          // West resize: keep right edge anchored
          positionAdjustmentX = -actualWidthChange;
        }
        if (position.includes("e")) {
          // East resize: keep left edge anchored (no adjustment needed)
          positionAdjustmentX = actualWidthChange;
        }
        if (position.includes("n")) {
          // North resize: keep bottom edge anchored
          positionAdjustmentY = -actualHeightChange;
        }
        if (position.includes("s")) {
          // South resize: keep top edge anchored (no adjustment needed)
          positionAdjustmentY = actualHeightChange;
        }

        // Apply position adjustments if needed
        if (positionAdjustmentX || positionAdjustmentY) {
          setPosition((prevPos) => ({
            x: prevPos.x + positionAdjustmentX,
            y: prevPos.y + positionAdjustmentY,
          }));
        }

        return { width: newWidth, height: newHeight };
      });
    },
    [],
  );

  // Memoize the PaperComponent to prevent recreation on every render
  const DraggablePaperComponent = React.useCallback(
    (props: PaperProps) => (
      <DraggableDialogContent
        fullScreen={fullScreen}
        positionRef={positionRef}
        sizeRef={sizeRef}
        onResize={handleResize}
      >
        {props.children}
      </DraggableDialogContent>
    ),
    [fullScreen, handleResize],
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
        <ControlsModalTabs hideControls={hideControls} />
      </Dialog>
    </DndContext>
  );
}
