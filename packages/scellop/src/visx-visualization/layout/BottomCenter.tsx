import React from "react";

import { usePanelDimensions } from "../../contexts/DimensionsContext";
import MetadataValueBar from "../heatmap/MetadataValueBar";
import VisualizationPanel, { type VisualizationPanelProps } from "./Panel";

function BottomCenterPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { width, height } = usePanelDimensions("center_bottom");

  return (
    <VisualizationPanel {...props} ref={ref}>
      <MetadataValueBar axis="X" width={width} height={height} />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  BottomCenterPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
