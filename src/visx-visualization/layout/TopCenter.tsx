import React from "react";

import { useXScale } from "../../contexts/ScaleContext";
import TopGraph from "../side-graphs/TopGraph";
import AxisResizer from "./AxisResizer";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function TopCenterPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { tickLabelSize, setTickLabelSize } = useXScale();

  return (
    <VisualizationPanel {...props} ref={ref}>
      <TopGraph />
      <AxisResizer
        orientation="X"
        tickLabelSize={tickLabelSize}
        setTickLabelSize={setTickLabelSize}
        visible={props.shouldRenderChildren}
      />
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  TopCenterPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
