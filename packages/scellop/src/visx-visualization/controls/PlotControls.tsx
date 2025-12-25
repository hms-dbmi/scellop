import Divider from "@mui/material/Divider";
import type { PropsWithChildren } from "react";
import { DisplayControls } from "./DisplayControls";
import { FilterControls } from "./FilterControls";
import {
  type PlotControlsSection,
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
