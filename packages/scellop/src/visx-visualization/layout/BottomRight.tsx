import React from "react";

import ControlsModalTrigger from "../controls/ControlsModalTrigger";
import VisualizationPanel, { type VisualizationPanelProps } from "./Panel";

function BottomRightPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanel
      {...props}
      ref={ref}
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
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
