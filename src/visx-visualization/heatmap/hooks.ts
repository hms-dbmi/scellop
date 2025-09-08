import { useCallback, useEffect, useMemo } from "react";
import { AxisConfig } from "../../contexts/AxisConfigContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";

export function useOpenInNewTab(
  createHref:
    | ((
        tick: string,
        metadataValues?: Record<string, string | number>,
      ) => string)
    | undefined,
) {
  const trackEvent = useTrackEvent();
  return useCallback(
    (tick: string, metadataValues?: Record<string, string | number>) => {
      const href = createHref?.(tick, metadataValues);
      if (href) {
        trackEvent("Open in new tab", tick, { href });
        window.open(href, "_blank");
      }
    },
    [createHref, trackEvent],
  );
}

export function useTickTitle(
  createHref:
    | ((
        tick: string,
        metadataValues?: Record<string, string | number>,
      ) => string)
    | undefined,
) {
  return useCallback(
    (tick: string) =>
      createHref ? `${tick} (Click to view in new tab)` : tick,
    [createHref],
  );
}

export function useHeatmapAxis({ createHref }: AxisConfig) {
  const openInNewTab = useOpenInNewTab(createHref);
  const tickTitle = useTickTitle(createHref);
  const tickLabelStyle = {
    fontVariantNumeric: "tabular-nums",
    cursor: createHref ? "pointer" : "default",
  };
  return { openInNewTab, tickTitle, tickLabelStyle };
}

/**
 * Estimates text dimensions using canvas measureText
 */
function estimateTextDimensions(
  text: string,
  fontSize: number,
  fontFamily: string,
) {
  // Create a temporary canvas for text measurement
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: text.length * fontSize * 0.6, height: fontSize };

  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);

  // Clean up the canvas
  canvas.remove();

  return {
    width: metrics.width,
    height: fontSize, // Approximate height based on font size
  };
}

/**
 * Calculates the estimated tick label size based on actual items and font properties
 */
export function useSetTickLabelSize(
  setTickLabelSize: (size: number) => void,
  orientation: "rows" | "columns" = "rows",
  fontSize: number,
  items: string[] = [],
  fontFamily: string = "Roboto, Arial, sans-serif",
) {
  const estimatedSize = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }

    // Calculate dimensions for all tick labels
    const dimensions = items.map((item) => {
      // Apply same truncation as the actual component
      const truncatedText =
        item.length > 20 ? item.substring(0, 17) + "..." : item;
      return estimateTextDimensions(truncatedText, fontSize, fontFamily);
    });

    const maxSize = Math.max(...dimensions.map((d) => d.width));

    // Add padding for axis label and margins (same as original)
    return maxSize + 48;
  }, [orientation, fontSize, items, fontFamily]);

  useEffect(() => {
    setTickLabelSize(estimatedSize);
  }, [estimatedSize, setTickLabelSize]);
}
