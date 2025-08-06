import { Tooltip } from "@mui/material";
import React, { useCallback } from "react";
import { useRowConfig } from "../../contexts/AxisConfigContext";
import { useRows } from "../../contexts/DataContext";
import { useHeatmapDimensions } from "../../contexts/DimensionsContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useYScale } from "../../contexts/ScaleContext";

export default function RowSelectionControls() {
  const rows = useRows();
  const { scale, scroll, isZoomed, setScroll } = useYScale();
  const { height } = useHeatmapDimensions();
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const toggleSelection = useSelectedValues((s) => s.toggleValue);
  const smallScale = scale.bandwidth() < 10;
  const rowsToRender = smallScale ? [...selectedValues] : rows;
  const trackEvent = useTrackEvent();
  const rowLabel = useRowConfig((s) => s.label);

  // Handle wheel scrolling for zoomed Y axis
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!isZoomed) return;

      e.preventDefault();

      setScroll((prev: number) => {
        const maxScrollY = Math.max(0, scale.range()[0] - height);
        return Math.max(0, Math.min(maxScrollY, prev + e.deltaY));
      });
    },
    [isZoomed, setScroll, scale, height],
  );

  const onChange = (row: string) => () => {
    if (selectedValues.has(row)) {
      trackEvent(`Expand ${rowLabel}`, row);
    } else {
      trackEvent(`Collapse ${rowLabel}`, row);
    }
    toggleSelection(row);
  };
  return (
    <div style={{ position: "absolute", top: 0 }} onWheel={handleWheel}>
      <div
        style={{
          position: "relative",
          transform: isZoomed ? `translateY(${-scroll}px)` : undefined,
        }}
      >
        {rowsToRender.map((row) => (
          <Tooltip
            title={`Toggle ${row}`}
            key={row}
            // to keep the tooltip from blocking the checkbox
            slotProps={{
              popper: { style: { pointerEvents: "none" } },
              tooltip: { style: { pointerEvents: "none" } },
            }}
          >
            <input
              type="checkbox"
              checked={selectedValues.has(row)}
              onChange={onChange(row)}
              style={{
                width: Math.max(
                  Math.min(Math.floor(scale.bandwidth()), 32),
                  16,
                ),
                height: Math.max(
                  Math.min(Math.floor(scale.bandwidth()), 32),
                  16,
                ),
                left: 0,
                top: scale(row),
                position: "absolute",
              }}
            />
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
