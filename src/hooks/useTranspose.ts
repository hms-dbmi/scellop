import { useEventCallback } from "@mui/material";
import { useSwapAxisConfigs } from "../contexts/AxisConfigContext";
import { useTranspose } from "../contexts/DataContext";
import { useTrackEvent } from "../contexts/EventTrackerProvider";
import { useSelectedValues } from "../contexts/ExpandedValuesContext";
import { useXScale, useYScale } from "../contexts/ScaleContext";

export function useHandleTranspose() {
  const transposeData = useTranspose();
  const swapAxisConfigs = useSwapAxisConfigs();
  const trackEvent = useTrackEvent();
  const xScale = useXScale();
	const yScale = useYScale();
  const expandedValues = useSelectedValues();
 		
	return useEventCallback(() => {
		// Perform data transposition operations
		transposeData();
    // Swap the axis configurations
		swapAxisConfigs();
		// Reset scroll state to avoid invalid viewport
		xScale.resetScroll();
    yScale.resetScroll();
    // Reset expanded rows since they are no longer relevant
    expandedValues.reset();

    trackEvent("Transpose Data", "");
	});
}