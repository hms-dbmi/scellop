import React from "react";

import { LeftGraphScale } from "../side-graphs/LeftGraph";
import VisualizationPanel, { type VisualizationPanelProps } from "./Panel";

function BottomLeftPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel {...props} ref={ref}>
      <LeftGraphScale />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  BottomLeftPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
