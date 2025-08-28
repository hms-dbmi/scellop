import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Theme } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { withParentSize, WithParentSizeProvidedProps } from "@visx/responsive";
import { CellPopData, CellPopTheme } from "./cellpop-schema";
import { AxisConfig } from "./contexts/AxisConfigContext";
import { OuterContainerRefProvider } from "./contexts/ContainerRefContext";
import { Dimensions, GridSizeTuple } from "./contexts/DimensionsContext";
import { Providers } from "./contexts/Providers";
import { loadHuBMAPData } from "./dataLoading";
import VizContainer from "./visx-visualization/layout";

type DisableableControls = "fraction" | "selection" | "theme";

interface CellPopConfig {
  yAxis: AxisConfig;
  xAxis: AxisConfig;
  onClick?: (e: React.MouseEvent) => void;
  dimensions?: Dimensions;
  theme?: CellPopTheme;
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
}

export interface CellPopProps
  extends WithParentSizeProvidedProps,
    CellPopConfig {
  data?: CellPopData;
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

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
    tooltipFields,
    trackEvent,
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
        stopPropagation(e);
        onClick?.(e);
      },
      [onClick],
    );

    const outerContainerRef = React.useRef<HTMLDivElement | null>(null);

    if (!data) {
      return <Skeleton height="100%" width="100%" />;
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
            tooltipFields={tooltipFields}
            trackEvent={trackEvent}
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
