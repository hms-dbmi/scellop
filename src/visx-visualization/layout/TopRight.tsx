import React from "react";

import { TopGraphScale } from "../side-graphs/TopGraph";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function TopRightPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel {...props} ref={ref}>
      <TopGraphScale />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  TopRightPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
