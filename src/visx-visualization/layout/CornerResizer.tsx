import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";

import { Theme } from "@mui/material";
import Box from "@mui/material/Box";
import { useParentRef } from "../../contexts/ContainerRefContext";
import { useDimensions } from "../../contexts/DimensionsContext";

interface CornerResizerProps {
  xIndex: number;
  yIndex: number;
  resizeColumn: (newSize: number, index: number) => void;
  resizeRow: (newSize: number, index: number) => void;
  visible?: boolean;
  isTransitioning?: boolean;
}

const CORNER_SIZE = 8;
const RESIZE_STEP = 10; // pixels to move per arrow key press

export default function CornerResizer({
  xIndex,
  yIndex,
  resizeColumn,
  resizeRow,
  visible = true,
  isTransitioning = false,
}: CornerResizerProps) {
  const parentRef = useParentRef();
  const { rowSizes, columnSizes } = useDimensions();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Calculate position at the intersection of column and row boundaries
  const xPosition = columnSizes
    .slice(0, xIndex + 1)
    .reduce((acc, size) => acc + size, 0);
  const yPosition = rowSizes
    .slice(0, yIndex + 1)
    .reduce((acc, size) => acc + size, 0);

  const onMouseDown: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent edge resizers from also triggering
      setIsDragging(true);

      const onMouseMove = (e: MouseEvent) => {
        const visualizationBounds = parentRef.current?.getBoundingClientRect();
        if (!visualizationBounds) {
          return;
        }
        const newX = e.clientX - visualizationBounds.left;
        const newY = e.clientY - visualizationBounds.top;

        // Update both dimensions simultaneously
        resizeColumn(newX, xIndex);
        resizeRow(newY, yIndex);
      };

      const onMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [xIndex, yIndex, resizeColumn, resizeRow, parentRef],
  );

  const onKeyDown: KeyboardEventHandler = useCallback(
    (e) => {
      const visualizationBounds = parentRef.current?.getBoundingClientRect();
      if (!visualizationBounds) {
        return;
      }

      let deltaX = 0;
      let deltaY = 0;

      switch (e.key) {
        case "ArrowLeft":
          deltaX = -RESIZE_STEP;
          break;
        case "ArrowRight":
          deltaX = RESIZE_STEP;
          break;
        case "ArrowUp":
          deltaY = -RESIZE_STEP;
          break;
        case "ArrowDown":
          deltaY = RESIZE_STEP;
          break;
        default:
          return;
      }

      e.preventDefault();

      // Calculate current positions
      const currentX = xPosition;
      const currentY = yPosition;

      // Apply deltas
      if (deltaX !== 0) {
        resizeColumn(currentX + deltaX, xIndex);
      }
      if (deltaY !== 0) {
        resizeRow(currentY + deltaY, yIndex);
      }
    },
    [xIndex, yIndex, xPosition, yPosition, resizeColumn, resizeRow, parentRef],
  );

  // Determine corner position for ARIA label
  const cornerPosition =
    yIndex === 0
      ? xIndex === 0
        ? "top-left"
        : "top-right"
      : xIndex === 0
        ? "bottom-left"
        : "bottom-right";

  return (
    <Box
      ref={ref}
      role="separator"
      aria-label={`Resize ${cornerPosition} panels (use arrow keys or drag)`}
      aria-orientation="vertical"
      aria-valuenow={xPosition}
      aria-valuetext={`Column position: ${Math.round(xPosition)}px, Row position: ${Math.round(yPosition)}px`}
      tabIndex={visible ? 0 : -1}
      sx={(theme: Theme) => ({
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        display: "block",
        position: "absolute",
        zIndex: 101, // Higher than edge resizers (100)
        pointerEvents: visible ? "auto" : "none",
        backgroundColor:
          isDragging || isFocused ? theme.palette.primary.main : "transparent",
        top: `${yPosition - CORNER_SIZE / 2}px`,
        left: `${xPosition - CORNER_SIZE / 2}px`,
        opacity: visible ? (isDragging || isFocused ? 0.8 : 0) : 0,
        visibility: visible ? "visible" : "hidden",
        cursor: "move",
        borderRadius: "50%",
        transition: isTransitioning
          ? "background-color 0.3s, opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          : "background-color 0.15s, opacity 0.15s",
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          opacity: 0.8,
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
      data-corner={`x${xIndex}-y${yIndex}`}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
