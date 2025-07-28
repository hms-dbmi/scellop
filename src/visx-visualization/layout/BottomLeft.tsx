import React from "react";

import { LeftGraphScale } from "../side-graphs/LeftGraph";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function BottomLeftPanel(
  { id }: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel id={id} ref={ref}>
      <LeftGraphScale />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  BottomLeftPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
