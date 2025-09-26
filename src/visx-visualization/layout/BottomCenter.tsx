import React from "react";

import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { useViewType } from "../../contexts/ViewTypeContext";
import MetadataValueBar from "../heatmap/MetadataValueBar";
import TraditionalViewRowLegend from "../TraditionalViewRowLegend";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function BottomCenterPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { width, height } = usePanelDimensions("center_bottom");
  const { viewType } = useViewType();

  return (
    <VisualizationPanel {...props} ref={ref}>
      {viewType === "traditional" ? (
        <TraditionalViewRowLegend width={width} height={height} />
      ) : (
        <MetadataValueBar axis="X" width={width} height={height} />
      )}
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  BottomCenterPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
