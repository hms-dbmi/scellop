import React from "react";

import LeftGraph from "../side-graphs/LeftGraph";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function MiddleLeftPanel(
  { id }: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel id={id} ref={ref}>
      <LeftGraph />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  MiddleLeftPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
