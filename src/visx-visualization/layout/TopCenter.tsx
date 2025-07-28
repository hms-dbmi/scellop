import React from "react";

import TopGraph from "../side-graphs/TopGraph";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function TopCenterPanel(
  { id }: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel id={id} ref={ref}>
      <TopGraph />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  TopCenterPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
