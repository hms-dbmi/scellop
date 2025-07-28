import React from "react";

import Legend from "../Legend";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function TopLeftPanel(
  { id }: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel id={id} ref={ref}>
      <Legend />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  TopLeftPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
