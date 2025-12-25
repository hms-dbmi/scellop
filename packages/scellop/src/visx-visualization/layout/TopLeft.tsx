import React from "react";

import Legend from "../Legend";
import VisualizationPanel, { type VisualizationPanelProps } from "./Panel";

function TopLeftPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel {...props} ref={ref}>
      <Legend />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  TopLeftPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
