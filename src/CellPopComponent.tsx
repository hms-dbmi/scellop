import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Theme } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { withParentSize, WithParentSizeProvidedProps } from "@visx/responsive";
import { CellPopData, ScellopTheme } from "./cellpop-schema";
import { AxisConfig } from "./contexts/AxisConfigContext";
import { OuterContainerRefProvider } from "./contexts/ContainerRefContext";
import { Dimensions, GridSizeTuple } from "./contexts/DimensionsContext";
import { DisableableControls } from "./contexts/DisabledControlProvider";
import { Providers } from "./contexts/Providers";
import { loadHuBMAPData } from "./dataLoading";
import { ViewType } from "./utils/view-types";
import VizContainer from "./visx-visualization/layout";

interface CellPopConfig {
  yAxis: AxisConfig;
  xAxis: AxisConfig;
  onClick?: (e: React.MouseEvent) => void;
  dimensions?: Dimensions;
  theme?: ScellopTheme;
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

export interface CellPopProps
  extends WithParentSizeProvidedProps,
    CellPopConfig {
  data?: CellPopData;
}

export const CellPop = withParentSize(
  ({
    theme = "light",
    dimensions: definedDimensions,
    data,
    xAxis,
    yAxis,
    onClick,
    parentHeight,
    parentWidth,
    customTheme,
    disabledControls,
    initialProportions,
    fieldDisplayNames,
    sortableFields,
    filterableFields,
    tooltipFields,
    trackEvent,
    viewType,
    autoColor,
  }: CellPopProps) => {
    // If dimensions are provided, use them.
    // Otherwise, fall back to using parentWidth and parentHeight.
    const dimensions = useMemo(() => {
      if (definedDimensions) {
        return definedDimensions;
      }
      return {
        width: parentWidth || 0,
        height: parentHeight || 0,
      };
    }, [definedDimensions, parentHeight, parentWidth]);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        onClick?.(e);
      },
      [onClick],
    );

    const outerContainerRef = React.useRef<HTMLDivElement | null>(null);

    if (!data) {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              initialProportions?.[0]
                .map((size) => `${size * 100}%`)
                .join(" ") || "repeat(3, 1fr)",
            gridTemplateRows:
              initialProportions?.[1]
                .map((size) => `${size * 100}%`)
                .join(" ") || "repeat(3, 1fr)",
            gap: "8px",
            height: "100%",
            width: "100%",
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} height="100%" width="100%" />
          ))}
        </div>
      );
    }

    return (
      <OuterContainerRefProvider value={outerContainerRef}>
        <div
          onClick={handleClick}
          ref={outerContainerRef}
          style={{ position: "relative", overflow: "hidden" }}
        >
          <Providers
            data={data}
            dimensions={dimensions}
            theme={theme}
            customTheme={customTheme}
            xAxis={xAxis}
            yAxis={yAxis}
            disabledControls={disabledControls}
            initialProportions={initialProportions}
            fieldDisplayNames={fieldDisplayNames}
            sortableFields={sortableFields}
            filterableFields={filterableFields}
            tooltipFields={tooltipFields}
            trackEvent={trackEvent}
            viewType={viewType}
            autoColor={autoColor}
          >
            <VizContainer />
          </Providers>
        </div>
      </OuterContainerRefProvider>
    );
  },
);

type CellPopLoaderProps = Omit<CellPopProps, "data"> & {
  uuids: string[];
};

export const CellPopHuBMAPLoader = ({
  uuids,
  ...props
}: CellPopLoaderProps) => {
  const [data, setData] = useState<CellPopData>();

  useEffect(() => {
    if (!data) {
      loadHuBMAPData(uuids)
        .then((data) => {
          setData(data as CellPopData);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [uuids]);

  return <CellPop data={data} {...props} />;
};
