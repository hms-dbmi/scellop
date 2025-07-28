import React, { MouseEventHandler, useCallback, useRef } from "react";

import Box from "@mui/material/Box";
import { useParentRef } from "../../contexts/ContainerRefContext";
import { useDimensions } from "../../contexts/DimensionsContext";

interface VisualizationPanelResizerProps {
  index: number;
  resize: (newSize: number, index: number) => void;
  orientation: "X" | "Y";
}

const orientationStyles = {
  X: {
    width: 5,
    height: "100%",
    cursor: "ew-resize",
  },
  Y: {
    width: "100%",
    height: 5,
    cursor: "ns-resize",
  },
};
export default function VisualizationPanelResizer({
  index,
  resize,
  orientation,
}: VisualizationPanelResizerProps) {
  const parentRef = useParentRef();
  const { rowSizes, columnSizes } = useDimensions();
  const ref = useRef<HTMLDivElement>(null);
  const positionKey = orientation === "X" ? "left" : "top";
  const positionValues = orientation === "X" ? columnSizes : rowSizes;
  const position = positionValues
    .slice(0, index + 1)
    .reduce((acc, size) => acc + size, 0);

  const onMouseDown: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      const onMouseMove = (e: MouseEvent) => {
        const visualizationBounds = parentRef.current?.getBoundingClientRect();
        if (!visualizationBounds) {
          return;
        }
        const newSize =
          orientation === "X"
            ? e.clientX - visualizationBounds.left
            : e.clientY - visualizationBounds.top;
        resize(newSize, index);
      };
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [orientation],
  );

  return (
    <Box
      ref={ref}
      sx={(theme) => ({
        ...orientationStyles[orientation],
        display: "block",
        position: "absolute",
        zIndex: 5,
        pointerEvents: "auto",
        backgroundColor: theme.palette.action.hover,
        top: 0,
        left: 0,
        transition: "background-color 0.3s",
        "&.active": {
          backgroundColor: theme.palette.action.active,
        },
        "&:hover": {
          backgroundColor: theme.palette.action.active,
        },
        [positionKey]: `${position - 3}px`,
      })}
      data-orientation={orientation}
      onMouseDown={onMouseDown}
    />
  );
}
