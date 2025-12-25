import React from "react";

import { useYScale } from "../../contexts/ScaleContext";
import LeftGraph from "../side-graphs/LeftGraph";
import AxisResizer from "./AxisResizer";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function MiddleLeftPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { tickLabelSize, setTickLabelSize } = useYScale();

  return (
    <VisualizationPanel {...props} ref={ref} overflow="none">
      <LeftGraph />
      <AxisResizer
        orientation="Y"
        tickLabelSize={tickLabelSize}
        setTickLabelSize={setTickLabelSize}
        visible={props.shouldRenderChildren}
      />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  MiddleLeftPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
