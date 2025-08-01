import React, { useMemo } from "react";

import { useTheme } from "@mui/material/styles";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { area } from "@visx/shape";
import { curveNatural } from "d3";
import {
  useColumns,
  useFractionDataMap,
  useRows,
} from "../../contexts/DataContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import { ScaleBand } from "../../contexts/types";
import { BackgroundStripe } from "./BackgroundStripe";
import { LEFT_MARGIN, TOP_MARGIN } from "./constants";

type Side = "top" | "left";

interface ViolinsProps {
  side?: Side;
}

// X scale is categorical for the top graph, Y scale is categorical for the left graph
function useCategoricalScale(side: Side) {
  const x = useXScale();
  const y = useYScale();
  switch (side) {
    case "top":
      return x;
    case "left":
      return y;
    default:
      console.error("Invalid side in Violin.useCategoricalScale: ", side);
      return x;
  }
}

/**
 * Casts NaN and Undefined to 0
 * @param value The value to handle
 * @returns The value if it is not NaN or undefined, 0 otherwise
 */
function handleNaN(value?: number) {
  return !value || isNaN(value) ? 0 : value;
}
/**
 * Returns the domain categories for the given side
 * The domain for the top violins is the rows (since they show the proportion of each cell as a fraction of the row total)
 * The domain for the left violins is the columns (since they show the proportion of each cell as a fraction of the column total)
 */
const useDomainCategories = (side: Side) => {
  const rows = useRows();
  const columns = useColumns();
  switch (side) {
    case "top":
      return rows;
    case "left":
      return columns;
    default:
      console.error("Invalid side in Violin.useDomainCategories: ", side);
      return columns;
  }
};

/**
 * Returns the scale for the violin's height axis.
 * @param side The side to get the scale for.
 * @returns The scale for the violin's height axis.
 */
function useViolinScale(side: Side) {
  const { width, height } = useViolinPanelDimensions(side);
  const { tickLabelSize } = useCategoricalScale(side);

  const categories = useDomainCategories(side);

  return useMemo(() => {
    const topViolins = side === "top";
    const rangeEnd = topViolins ? height : width;
    const rangeStart = tickLabelSize;
    const margin = topViolins ? TOP_MARGIN : LEFT_MARGIN;
    const range: [number, number] = [rangeStart, rangeEnd + margin];
    return scaleBand({
      range,
      domain: categories,
    });
  }, [side, categories, width, height, tickLabelSize]);
}

/**
 * Returns the violin fraction entries for the given side.
 * Each entry is an array of fractions for the corresponding category.
 * @param side The side to get the entries for.
 * @returns The fraction entry order for the given side as a map of keys to fractions.
 */
const useEntries = (side: Side) => {
  const rows = useRows();
  const columns = useColumns();
  // Top violins show the proportion of each cell as a fraction of the row total
  // Left violins show the proportion of each cell as a fraction of the column total
  const normalization = side === "top" ? "Row" : "Column";
  const dataMap = useFractionDataMap(normalization);
  return useMemo(() => {
    if (side === "top") {
      return columns.reduce((acc, col) => {
        const colData = rows.map((row) => {
          const key: `${string}-${string}` = `${row}-${col}`;
          return [row, dataMap[key]];
        });
        return {
          ...acc,
          [col]: colData,
        };
      }, {});
    } else {
      return rows.reduce((acc, row) => {
        const rowData = columns.map((col) => {
          const key: `${string}-${string}` = `${row}-${col}`;
          return [col, dataMap[key]];
        });
        return {
          ...acc,
          [row]: rowData,
        };
      }, {});
    }
  }, [dataMap, columns, rows]) as Record<string, [string, number][]>;
};

function useViolinPanelDimensions(side: Side) {
  return usePanelDimensions(side === "top" ? "center_top" : "left_middle");
}

export default function RevisedViolins({ side = "top" }: ViolinsProps) {
  const topViolins = side === "top";
  const entries = useEntries(side);
  const { scale: categoricalScale, tickLabelSize } = useCategoricalScale(side);
  const { width, height } = useViolinPanelDimensions(side);

  const violinScale = useViolinScale(side);
  const densityScale = scaleLinear({
    domain: [0, 1], // Fractions are between 0 and 1
    range: [0, categoricalScale.bandwidth() / 2], // Total violin width is equal to the categorical scale bandwidth
  });

  const violinAreaGenerator = useMemo(() => {
    if (side === "top") {
      return area<[string, number]>()
        .y((d) => handleNaN(violinScale(d[0]) as number))
        .x0(
          (d) =>
            handleNaN(densityScale(-d[1])) + categoricalScale.bandwidth() / 2,
        )
        .x1(
          (d) =>
            handleNaN(densityScale(d[1])) + categoricalScale.bandwidth() / 2,
        )
        .curve(curveNatural);
    } else {
      return area<[string, number]>()
        .x((d) => handleNaN(violinScale(d[0])) as number)
        .y0(
          (d) =>
            handleNaN(densityScale(-d[1])) + categoricalScale.bandwidth() / 2,
        )
        .y1(
          (d) =>
            handleNaN(densityScale(d[1])) + categoricalScale.bandwidth() / 2,
        )
        .curve(curveNatural);
    }
  }, [densityScale, violinScale, side]);

  const backgroundDimensions = useMemo(() => {
    const rangeStart = topViolins ? height : width;
    const rangeEnd = tickLabelSize;

    const y = topViolins ? rangeEnd : 0;
    const x = topViolins ? 0 : rangeEnd;

    const w = topViolins
      ? categoricalScale.bandwidth()
      : rangeStart + LEFT_MARGIN;

    const h = topViolins
      ? rangeStart + TOP_MARGIN
      : categoricalScale.bandwidth();

    return { x, y, width: w, height: h };
  }, [width, height, topViolins, categoricalScale, tickLabelSize]);

  return (
    <svg
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
    >
      {Object.entries(entries).map(([key, entry]) => (
        <Violin
          key={key}
          entries={entry}
          group={key}
          areaGenerator={violinAreaGenerator}
          side={side}
          backgroundDimensions={backgroundDimensions}
        />
      ))}
    </svg>
  );
}

interface ViolinProps {
  entries: [string, number][];
  group: string;
  areaGenerator: ReturnType<typeof area<[string, number]>>;
  side: Side;
  backgroundDimensions: { x: number; y: number; width: number; height: number };
}

function getTransform(scale: ScaleBand<string>, side: Side, group: string) {
  const transformCoordinate = scale(group);
  const transform =
    side === "top"
      ? `translate(${transformCoordinate}, 0)`
      : `translate(0, ${transformCoordinate})`;
  return transform;
}

function Violin({
  entries,
  group,
  areaGenerator,
  side,
  backgroundDimensions,
}: ViolinProps) {
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const { scale: categoricalScale } = useCategoricalScale(side);
  const theme = useTheme();
  const { openTooltip, closeTooltip } = useSetTooltipData();
  if (selectedValues.has(group)) {
    return null;
  }

  return (
    <Group transform={getTransform(categoricalScale, side, group)}>
      <BackgroundStripe
        onMouseMove={(e) => {
          const tooltip = {
            title: group,
            data: [...entries]
              .sort((a, b) => b[1] - a[1])
              .reduce((acc, [key, value]) => {
                if (value === 0) {
                  return acc;
                }
                return { ...acc, [key]: (value * 100).toFixed(2) + "%" };
              }, {}),
          };
          openTooltip(tooltip, e.clientX, e.clientY);
        }}
        onMouseOut={closeTooltip}
        {...backgroundDimensions}
        value={group}
        orientation={side === "top" ? "vertical" : "horizontal"}
      />
      <path
        key={group}
        d={areaGenerator(entries) ?? ""}
        opacity={1}
        fill={theme.palette.text.primary}
        fillOpacity={0.6}
        pointerEvents="none"
      />
    </Group>
  );
}
