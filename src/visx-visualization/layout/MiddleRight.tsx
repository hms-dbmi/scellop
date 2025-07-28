import React from "react";

import { useRowConfig } from "../../contexts/AxisConfigContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import HeatmapYAxis from "../heatmap/HeatmapYAxis";
import MetadataValueBar from "../heatmap/MetadataValueBar";
import RowSelectionControls from "../heatmap/RowSelectionControls";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function MiddleRightPanel(
  { id }: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { width, height } = usePanelDimensions("right_middle");
  const flipAxisPosition = useRowConfig((store) => store.flipAxisPosition);

  return (
    <VisualizationPanel id={id} ref={ref}>
      {flipAxisPosition ? (
        <MetadataValueBar axis="Y" width={width} height={height} />
      ) : (
        <svg width={width} height={height}>
          <HeatmapYAxis />
        </svg>
      )}
      <RowSelectionControls />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  MiddleRightPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
