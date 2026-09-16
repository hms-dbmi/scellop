import type { Theme } from "@mui/material";
import Box from "@mui/material/Box";
import {
  type KeyboardEventHandler,
  type MouseEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import { useParentRef } from "../../contexts/ContainerRefContext";

type Orientation = "X" | "Y";

interface AxisResizerProps {
  orientation: Orientation;
  tickLabelSize: number;
  setTickLabelSize: (size: number) => void;
  visible?: boolean;
}

const MIN_AXIS_SIZE = 50;
const MAX_AXIS_SIZE = 400;
const RESIZE_STEP = 5;

export default function AxisResizer({
  orientation,
  tickLabelSize,
  setTickLabelSize,
  visible = true,
}: AxisResizerProps) {
  const parentRef = useParentRef();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const onMouseDown: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);

      const onMouseMove = (e: MouseEvent) => {
        const visualizationBounds = parentRef.current?.getBoundingClientRect();
        if (!visualizationBounds) {
          return;
        }

        let newSize: number;
        if (orientation === "X") {
          // For X-axis (horizontal), measure from top of container
          newSize = e.clientY - visualizationBounds.top;
        } else {
          // For Y-axis (vertical), measure from left of container
          newSize = e.clientX - visualizationBounds.left;
        }

        // Clamp to min/max bounds
        const clampedSize = Math.max(
          MIN_AXIS_SIZE,
          Math.min(MAX_AXIS_SIZE, newSize),
        );
        setTickLabelSize(clampedSize);
      };

      const onMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [orientation, setTickLabelSize, parentRef],
  );

  const onKeyDown: KeyboardEventHandler = useCallback(
    (e) => {
      let delta = 0;

      if (orientation === "X") {
        if (e.key === "ArrowUp") delta = -RESIZE_STEP;
        else if (e.key === "ArrowDown") delta = RESIZE_STEP;
      } else {
        if (e.key === "ArrowLeft") delta = -RESIZE_STEP;
        else if (e.key === "ArrowRight") delta = RESIZE_STEP;
      }

      if (delta !== 0) {
        e.preventDefault();
        const newSize = Math.max(
          MIN_AXIS_SIZE,
          Math.min(MAX_AXIS_SIZE, tickLabelSize + delta),
        );
        setTickLabelSize(newSize);
      }
    },
    [orientation, tickLabelSize, setTickLabelSize],
  );

  const orientationLabel = orientation === "X" ? "horizontal" : "vertical";
  const ariaLabel = `Resize ${orientationLabel} axis tick labels (use arrow keys or drag)`;

  return (
    <Box
      ref={ref}
      role="separator"
      aria-label={ariaLabel}
      aria-orientation={orientation === "X" ? "horizontal" : "vertical"}
      aria-valuenow={tickLabelSize}
      aria-valuemin={MIN_AXIS_SIZE}
      aria-valuemax={MAX_AXIS_SIZE}
      tabIndex={visible ? 0 : -1}
      sx={(theme: Theme) => ({
        display: "block",
        position: "absolute",
        zIndex: 102, // Higher than corner resizers (101) and panel resizers (100)
        pointerEvents: visible ? "auto" : "none",
        backgroundColor:
          isDragging || isFocused ? theme.palette.primary.main : "transparent",
        opacity: visible ? (isDragging || isFocused ? 0.5 : 0) : 0,
        visibility: visible ? "visible" : "hidden",
        transition: "background-color 0.15s, opacity 0.15s",
        ...(orientation === "X"
          ? {
              // Horizontal resizer for X-axis (at bottom of TopCenter panel)
              width: "100%",
              height: 5,
              top: `${tickLabelSize - 2}px`,
              left: 0,
              cursor: "ns-resize",
            }
          : {
              // Vertical resizer for Y-axis (at right edge of MiddleLeft panel)
              width: 5,
              height: "100%",
              top: 0,
              left: `${tickLabelSize - 2}px`,
              cursor: "ew-resize",
            }),
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          opacity: 0.5,
        },
        "&:focus": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      })}
      data-axis-resizer={orientation}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
