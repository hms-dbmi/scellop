import React, { PropsWithChildren } from "react";

import Divider from "@mui/material/Divider";
import { DisplayControls } from "./DisplayControls";
import { JumpToSection } from "./JumpToSection";
import {
  PlotControlsSection,
  PlotControlsSectionProvider,
} from "./PlotControlsContext";
import { SortControls } from "./SortControls";

interface PlotControlSectionProps extends PropsWithChildren {
  value: PlotControlsSection;
}

export function PlotControlSection({ value }: PlotControlSectionProps) {
  return (
    <PlotControlsSectionProvider value={value}>
      <JumpToSection section={value} />
      <SortControls />
      <Divider />
      <DisplayControls />
    </PlotControlsSectionProvider>
  );
}
