import React from "react";

import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { useViewType } from "../../contexts/ViewTypeContext";
import ControlsModalTrigger from "../controls/ControlsModalTrigger";
import { TopGraphScale } from "../side-graphs/TopGraph";
import TraditionalViewRowLegend from "../TraditionalViewRowLegend";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

function TopRightPanel(
  props: VisualizationPanelProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const viewType = useViewType((state) => state.viewType);
  const { width, height } = usePanelDimensions("right_top");
  return (
    <VisualizationPanel {...props} ref={ref}>
      <TopGraphScale />
      {viewType === "traditional" ? (
        <>
          <TraditionalViewRowLegend width={width} height={height} />
          <ControlsModalTrigger />
        </>
      ) : null}
    </VisualizationPanel>
  );
}

export default React.forwardRef(
  TopRightPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
