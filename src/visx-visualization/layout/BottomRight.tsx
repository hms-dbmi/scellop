import React from "react";

import ControlsModalTrigger from "../controls-modal/ControlsModalTrigger";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function BottomRightPanel(
  { id }: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel
      id={id}
      ref={ref}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <ControlsModalTrigger />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  BottomRightPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
