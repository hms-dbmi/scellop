import React from "react";

import { usePanelDimensions } from "../../contexts/DimensionsContext";
import MetadataValueBar from "../heatmap/MetadataValueBar";
import RowSelectionControls from "../heatmap/RowSelectionControls";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function MiddleRightPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { width, height } = usePanelDimensions("right_middle");

  return (
    <VisualizationPanel
      {...props}
      ref={ref}
      sx={{
        overflowY: "hidden",
      }}
    >
      <MetadataValueBar axis="Y" width={width} height={height} />
      <RowSelectionControls />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  MiddleRightPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
