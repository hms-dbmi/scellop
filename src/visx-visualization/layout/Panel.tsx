import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { ForwardedRef, PropsWithChildren } from "react";

export interface VisualizationPanelProps extends PropsWithChildren, BoxProps {
  shouldRenderChildren?: boolean;
  isTransitioning?: boolean;
}

const VisualizationPanelComponent = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
});

const propsToSkip = ["shouldRender", "isTransitioning"];

const PanelContentWrapper = styled(Box, {
  shouldForwardProp: (prop) =>
    !propsToSkip.includes(prop as (typeof propsToSkip)[number]),
})<{
  shouldRender: boolean;
  isTransitioning: boolean;
}>(({ shouldRender, isTransitioning }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  opacity: shouldRender ? 1 : 0,
  visibility: shouldRender ? "visible" : "hidden",
  transition: isTransitioning
    ? "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    : "none",
  pointerEvents: shouldRender ? "auto" : "none",
}));

export function VisualizationPanel(
  {
    children,
    shouldRenderChildren = true,
    isTransitioning = false,
    ...rest
  }: VisualizationPanelProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <VisualizationPanelComponent ref={ref} {...rest}>
      <PanelContentWrapper
        shouldRender={shouldRenderChildren}
        isTransitioning={isTransitioning}
      >
        {children}
      </PanelContentWrapper>
    </VisualizationPanelComponent>
  );
}

export default React.forwardRef(
  VisualizationPanel,
) as React.ForwardRefExoticComponent<
  VisualizationPanelProps & React.RefAttributes<HTMLDivElement>
>;
