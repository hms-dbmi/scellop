import { Theme } from "@mui/material";
import React, { PropsWithChildren } from "react";
import { CellPopData, CellPopTheme } from "../cellpop-schema";
import { GraphType } from "../utils/graph-types";
import { ViewType } from "../utils/view-types";
import { AutoColorAssignment } from "./AutoColorAssignment";
import {
  AxisConfig,
  ColumnConfigProvider,
  RowConfigProvider,
} from "./AxisConfigContext";
import { CellPopThemeProvider } from "./CellPopThemeContext";
import { ColorScaleProvider } from "./ColorScaleContext";
import ControlsVisibilityProvider from "./ControlsVisibilityContext";
import { DataProvider } from "./DataContext";
import {
  Dimensions,
  DimensionsProvider,
  GridSizeTuple,
  INITIAL_PROPORTIONS,
} from "./DimensionsContext";
import {
  DisableableControls,
  DisabledControlProvider,
} from "./DisabledControlProvider";
import { EventTrackerProvider } from "./EventTrackerProvider";
import { SelectedValuesProvider } from "./ExpandedValuesContext";
import { IndividualGraphTypeProvider } from "./IndividualGraphTypeContext";
import { MetadataConfigProvider } from "./MetadataConfigContext";
import { NormalizationProvider } from "./NormalizationContext";
import { ScaleProvider } from "./ScaleContext";
import { SelectedDimensionProvider } from "./SelectedDimensionContext";
import TemporalControlsProvider from "./TemporalControlsContext";
import { TooltipDataProvider } from "./TooltipDataContext";
import { ViewTypeProvider } from "./ViewTypeContext";

interface CellPopConfigProps extends PropsWithChildren {
  data: CellPopData;
  dimensions: Dimensions;
  theme: CellPopTheme;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  selectedDimension?: "X" | "Y";
  leftGraphType?: GraphType;
  topGraphType?: GraphType;
  selectedValues?: string[];
  normalization?: "Row" | "Column" | "Log";
  customTheme?: Theme;
  disabledControls?: DisableableControls[];
  initialProportions?: [GridSizeTuple, GridSizeTuple];
  fieldDisplayNames?: Record<string, string>;
  sortableFields?: string[];
  tooltipFields?: string[];
  trackEvent?: (
    event: string,
    detail: string,
    extra?: Record<string, unknown>,
  ) => void;
  viewType?: ViewType;
}

export function Providers({
  children,
  data,
  dimensions,
  theme,
  leftGraphType = "Bars",
  topGraphType = "Bars",
  selectedValues = [],
  selectedDimension = "Y",
  xAxis: xAxisConfig,
  yAxis: yAxisConfig,
  customTheme,
  disabledControls = [],
  normalization: initialNormalization,
  initialProportions = [INITIAL_PROPORTIONS, INITIAL_PROPORTIONS],
  fieldDisplayNames,
  sortableFields,
  tooltipFields,
  trackEvent,
  viewType,
}: CellPopConfigProps) {
  return (
    <EventTrackerProvider trackEvent={trackEvent}>
      <DisabledControlProvider disabledControls={disabledControls}>
        <ViewTypeProvider viewType={viewType}>
          <DataProvider initialData={data}>
            <SelectedValuesProvider initialSelectedValues={selectedValues}>
              <RowConfigProvider {...yAxisConfig}>
                <ColumnConfigProvider {...xAxisConfig}>
                  <AutoColorAssignment>
                    <TooltipDataProvider>
                      <CellPopThemeProvider
                        theme={theme}
                        customTheme={customTheme}
                      >
                        <DimensionsProvider
                          dimensions={dimensions}
                          initialProportions={initialProportions}
                        >
                          <IndividualGraphTypeProvider
                            initialLeftGraphType={leftGraphType}
                            initialTopGraphType={topGraphType}
                          >
                            <NormalizationProvider
                              initialNormalization={initialNormalization}
                            >
                              <ScaleProvider>
                                <ColorScaleProvider>
                                  <SelectedDimensionProvider
                                    initialSelectedDimension={selectedDimension}
                                  >
                                    <MetadataConfigProvider
                                      fieldDisplayNames={fieldDisplayNames}
                                      sortableFields={sortableFields}
                                      tooltipFields={tooltipFields}
                                    >
                                      <ControlsVisibilityProvider>
                                        <TemporalControlsProvider>
                                          {children}
                                        </TemporalControlsProvider>
                                      </ControlsVisibilityProvider>
                                    </MetadataConfigProvider>
                                  </SelectedDimensionProvider>
                                </ColorScaleProvider>
                              </ScaleProvider>
                            </NormalizationProvider>
                          </IndividualGraphTypeProvider>
                        </DimensionsProvider>
                      </CellPopThemeProvider>
                    </TooltipDataProvider>
                  </AutoColorAssignment>
                </ColumnConfigProvider>
              </RowConfigProvider>
            </SelectedValuesProvider>
          </DataProvider>
        </ViewTypeProvider>
      </DisabledControlProvider>
    </EventTrackerProvider>
  );
}
