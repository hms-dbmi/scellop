import React from "react";

import { useColumnConfig } from "../../contexts/AxisConfigContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import HeatmapXAxis from "../heatmap/HeatmapXAxis";
import MetadataValueBar from "../heatmap/MetadataValueBar";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function BottomCenterPanel(
  { id }: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const flipAxisPosition = useColumnConfig((store) => store.flipAxisPosition);
  const { width, height } = usePanelDimensions("center_bottom");
  return (
    <VisualizationPanel id={id} ref={ref}>
      {flipAxisPosition ? (
        <MetadataValueBar axis="X" width={width} height={height} />
      ) : (
        <svg width={width} height={height}>
          <HeatmapXAxis />
        </svg>
      )}
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  BottomCenterPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
