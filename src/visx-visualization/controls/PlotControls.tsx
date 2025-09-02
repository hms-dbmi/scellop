import React, { PropsWithChildren } from "react";

import Divider from "@mui/material/Divider";
import { DisplayControls } from "./DisplayControls";
import { FilterControls } from "./FilterControls";
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
      <SortControls />
      <Divider />
      <FilterControls />
      <Divider />
      <DisplayControls />
    </PlotControlsSectionProvider>
  );
}
