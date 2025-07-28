import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { ForwardedRef, PropsWithChildren } from "react";

export interface VisualizationPanelProps extends PropsWithChildren, BoxProps {}

const VisualizationPanelComponent = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
});

export function VisualizationPanel(
  { children, ...rest }: VisualizationPanelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanelComponent ref={ref} {...rest}>
      {children}
    </VisualizationPanelComponent>
  );
}

export default React.forwardRef(VisualizationPanel);
