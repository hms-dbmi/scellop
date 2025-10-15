import { Theme } from "@mui/material";
import React, { PropsWithChildren } from "react";
import { ScellopData, ScellopTheme } from "../cellpop-schema";
import { GraphType } from "../utils/graph-types";
import { ViewType } from "../utils/view-types";
import { AutoColorAssignment } from "./AutoColorAssignment";
import {
  AxisConfig,
  ColumnConfigProvider,
  RowConfigProvider,
} from "./AxisConfigContext";
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
import { ScellopThemeProvider } from "./ThemeContext";
import { TooltipDataProvider } from "./TooltipDataContext";
import { ViewTypeProvider } from "./ViewTypeContext";

interface CellPopConfigProps extends PropsWithChildren {
  data: ScellopData;
  dimensions: Dimensions;
  theme: ScellopTheme;
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
  filterableFields?: string[];
  tooltipFields?: string[];
  trackEvent?: (
    event: string,
    detail: string,
    extra?: Record<string, unknown>,
  ) => void;
  viewType?: ViewType;
  autoColor?: boolean;
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
  filterableFields,
  tooltipFields,
  trackEvent,
  viewType,
  autoColor = true,
}: CellPopConfigProps) {
  return (
    <EventTrackerProvider trackEvent={trackEvent}>
      <DisabledControlProvider disabledControls={disabledControls}>
        <ViewTypeProvider viewType={viewType}>
          <DataProvider initialData={data}>
            <SelectedValuesProvider initialSelectedValues={selectedValues}>
              <RowConfigProvider {...yAxisConfig}>
                <ColumnConfigProvider {...xAxisConfig}>
                  <AutoColorAssignment enabled={autoColor}>
                    <TooltipDataProvider>
                      <ScellopThemeProvider
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
                                      filterableFields={filterableFields}
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
                      </ScellopThemeProvider>
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
