import React from "react";

import Heatmap from "../heatmap/Heatmap";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function MiddleCenterPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel {...props} ref={ref}>
      <Heatmap />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  MiddleCenterPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
