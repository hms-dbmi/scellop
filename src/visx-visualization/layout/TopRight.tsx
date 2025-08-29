import React from "react";

import { useViewType } from "../../contexts/ViewTypeContext";
import ControlsModalTrigger from "../controls/ControlsModalTrigger";
import { TopGraphScale } from "../side-graphs/TopGraph";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function TopRightPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const isTraditional = useViewType().viewType === "traditional";
  return (
    <VisualizationPanel {...props} ref={ref}>
      <TopGraphScale />
      {isTraditional && <ControlsModalTrigger />}
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  TopRightPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
