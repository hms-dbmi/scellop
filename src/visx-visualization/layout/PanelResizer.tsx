import React, { MouseEventHandler, useCallback, useRef } from "react";

import { Theme } from "@mui/material";
import Box from "@mui/material/Box";
import { useParentRef } from "../../contexts/ContainerRefContext";
import { useDimensions } from "../../contexts/DimensionsContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";

type Orientation = "X" | "Y";

interface VisualizationPanelResizerProps {
  index: number;
  resize: (newSize: number, index: number) => void;
  orientation: Orientation;
  visible?: boolean;
  isTransitioning?: boolean;
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

const shadowStyles: (
  theme: Theme,
) => Record<
  Orientation,
  Record<number, string> & { hover: Record<number, string> }
> = (theme) => ({
  X: {
    0: `4px 0 8px 0 ${theme.palette.text.primary}`,
    1: `-4px 0 8px 0 ${theme.palette.text.primary}`,
    hover: {
      0: `4px 0 8px 0 ${theme.palette.primary.main}`,
      1: `-4px 0 8px 0 ${theme.palette.primary.main}`,
    },
  },
  Y: {
    0: `0 4px 8px 0 ${theme.palette.text.primary}`,
    1: `0 -4px 8px 0 ${theme.palette.text.primary}`,
    hover: {
      0: `0 4px 8px 0 ${theme.palette.primary.main}`,
      1: `0 -4px 8px 0 ${theme.palette.primary.main}`,
    },
  },
});

export default function VisualizationPanelResizer({
  index,
  resize,
  orientation,
  visible = true,
  isTransitioning = false,
}: VisualizationPanelResizerProps) {
  const parentRef = useParentRef();
  const { rowSizes, columnSizes } = useDimensions();
  const xScaleContext = useXScale();
  const yScaleContext = useYScale();
  const ref = useRef<HTMLDivElement>(null);
  const positionKey = orientation === "X" ? "left" : "top";
  const positionValues = orientation === "X" ? columnSizes : rowSizes;
  const position = positionValues
    .slice(0, index + 1)
    .reduce((acc, size) => acc + size, 0);

  // Calculate if there's available scroll space for shadow indication
  const hasAvailableScrollSpace = useCallback(() => {
    if (orientation === "X") {
      // For vertical resizers (X orientation), check horizontal scroll availability
      if (!xScaleContext.isZoomed) return false;
      const totalWidth = columnSizes.reduce((a, b) => a + b, 0);
      const scaleWidth = xScaleContext.scale.range()[1];
      const maxScrollX = Math.max(0, scaleWidth - totalWidth);

      if (index === 0) {
        // Left resizer - check if we can scroll left (current scroll > 0)
        return maxScrollX > 0 && xScaleContext.scroll > 0;
      } else {
        // Right resizer - check if we can scroll right (current scroll < maxScroll)
        return maxScrollX > 0 && xScaleContext.scroll < maxScrollX;
      }
    } else {
      // For horizontal resizers (Y orientation), check vertical scroll availability
      if (!yScaleContext.isZoomed) return false;
      const totalHeight = rowSizes.reduce((a, b) => a + b, 0);
      const scaleHeight = yScaleContext.scale.range()[0];
      const maxScrollY = Math.max(0, scaleHeight - totalHeight);

      if (index === 0) {
        // Top resizer - check if we can scroll down (current scroll > 0)
        return maxScrollY > 0 && yScaleContext.scroll > 0;
      } else {
        // Bottom resizer - check if we can scroll up (current scroll < maxScroll)
        return maxScrollY > 0 && yScaleContext.scroll < maxScrollY;
      }
    }
  }, [
    orientation,
    index,
    xScaleContext.isZoomed,
    xScaleContext.scale,
    xScaleContext.scroll,
    yScaleContext.isZoomed,
    yScaleContext.scale,
    yScaleContext.scroll,
    columnSizes,
    rowSizes,
  ]);

  const showScrollShadow = hasAvailableScrollSpace();

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
        zIndex: 100,
        pointerEvents: visible ? "auto" : "none",
        backgroundColor: theme.palette.action.hover,
        top: 0,
        left: 0,
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transition: isTransitioning
          ? "background-color 0.3s, box-shadow 0.3s, opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          : "background-color 0.3s, box-shadow 0.3s",
        "&.active": {
          backgroundColor: theme.palette.action.active,
        },
        "&:hover": {
          backgroundColor: theme.palette.action.active,
        },
        [positionKey]: `${position - 3}px`,
        // Add subtle shadow when there's available scroll space
        ...(showScrollShadow && {
          boxShadow: shadowStyles(theme)[orientation][index] || "",
          "&:hover": {
            backgroundColor: theme.palette.action.active,
            boxShadow: shadowStyles(theme)[orientation].hover[index] || "",
          },
        }),
      })}
      data-orientation={orientation}
      onMouseDown={onMouseDown}
    />
  );
}
