import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createContext, useContext } from "../utils/context";
import { Setter } from "../utils/types";
import { useViewType } from "./ViewTypeContext";
import {
  HorizontalPanelSection,
  MappedPanelSection,
  VerticalPanelSection,
} from "./types";

export interface Dimensions {
  width: number;
  height: number;
}

interface DimensionsContextType extends Dimensions {
  columnSizes: GridSizeTuple;
  rowSizes: GridSizeTuple;
  resizeColumn: (newSize: number, index: number) => void;
  resizeRow: (newSize: number, index: number) => void;
}

const DimensionsContext = createContext<DimensionsContextType | null>(
  "CellPopDimensions",
);

export type GridSizeTuple = [number, number, number];

export const INITIAL_PROPORTIONS: GridSizeTuple = [0.3, 0.4, 0.3];
export const TRADITIONAL_COLUMN_PROPORTIONS: GridSizeTuple = [0.05, 0.9, 0.05];
export const TRADITIONAL_ROW_PROPORTIONS: GridSizeTuple = [1, 0, 0];
const MIN_PANEL_SIZE = 48;

// Helper function to get the initial size of the panels
function getInitialSize(
  total: number,
  initialProportions: GridSizeTuple = INITIAL_PROPORTIONS,
): GridSizeTuple {
  return initialProportions.map((prop) => total * prop) as GridSizeTuple;
}

function calculateProportions(total: number, sizes: GridSizeTuple) {
  return sizes.map((size) => size / total) as GridSizeTuple;
}

interface DimensionsProviderProps extends PropsWithChildren {
  dimensions: Dimensions;
  initialProportions?: [GridSizeTuple, GridSizeTuple];
}

/**
 * Main provider for visualization dimensions
 * @param props.dimensions Initial dimensions for the visualization
 */
export function DimensionsProvider({
  children,
  dimensions: { width, height },
  initialProportions: [initialColumnProportions, initialRowProportions] = [
    INITIAL_PROPORTIONS,
    INITIAL_PROPORTIONS,
  ],
}: DimensionsProviderProps) {
  const { viewType } = useViewType();

  // Determine the appropriate proportions based on view type
  const getProportionsForViewType = useCallback(() => {
    if (viewType === "traditional") {
      return [TRADITIONAL_COLUMN_PROPORTIONS, TRADITIONAL_ROW_PROPORTIONS];
    }
    return [initialColumnProportions, initialRowProportions];
  }, [viewType, initialColumnProportions, initialRowProportions]);

  const [currentProportions, setCurrentProportions] = useState(() => {
    const [colProps, rowProps] = getProportionsForViewType();
    return { column: colProps, row: rowProps };
  });

  const [columnSizes, setColumnSizes] = useState<GridSizeTuple>(
    getInitialSize(width, currentProportions.column),
  );
  const [rowSizes, setRowSizes] = useState<GridSizeTuple>(
    getInitialSize(height, currentProportions.row),
  );

  const dimensionsRef = useRef({ width, height });

  // Update proportions when view type changes
  useEffect(() => {
    const [newColProps, newRowProps] = getProportionsForViewType();
    setCurrentProportions({ column: newColProps, row: newRowProps });
    setColumnSizes(getInitialSize(width, newColProps));
    setRowSizes(getInitialSize(height, newRowProps));
  }, [viewType, getProportionsForViewType, width, height]);

  // Update the column and row sizes when container dimensions change,
  // keeping proportions between the panels
  useEffect(() => {
    const previous = dimensionsRef.current;
    setColumnSizes((columnSizes) =>
      getInitialSize(width, calculateProportions(previous.width, columnSizes)),
    );
    setRowSizes((rowSizes) =>
      getInitialSize(height, calculateProportions(previous.height, rowSizes)),
    );
    dimensionsRef.current = { width, height };
  }, [width, height]);

  const resize = useCallback(
    (setter: Setter<GridSizeTuple>) => (newSize: number, index: number) => {
      if (newSize < 0) {
        return;
      }
      setter((prev) => {
        const newSizes = [...prev];
        const oldSize = newSizes[index];
        const totalSize = newSizes.reduce((acc, size) => acc + size, 0);
        if (newSize > totalSize) {
          return prev;
        }

        // Calculate the minimum total space needed for all panels
        const minTotalNeeded = MIN_PANEL_SIZE * 3;
        if (totalSize < minTotalNeeded) {
          return prev; // Not enough space to maintain minimums
        }

        switch (index) {
          case 0: {
            // Resizing the first panel
            const clampedNewSize = Math.max(
              MIN_PANEL_SIZE,
              Math.min(newSize, totalSize - 2 * MIN_PANEL_SIZE),
            );
            const deltaChange = clampedNewSize - oldSize;

            newSizes[0] = clampedNewSize;
            // Distribute the change to panel 1, but ensure it stays above minimum
            const newPanel1Size = newSizes[1] - deltaChange;
            if (newPanel1Size >= MIN_PANEL_SIZE) {
              newSizes[1] = newPanel1Size;
            } else {
              // If panel 1 would go below minimum, take from panel 2
              newSizes[1] = MIN_PANEL_SIZE;
              newSizes[2] = totalSize - newSizes[0] - newSizes[1];
            }
            break;
          }
          case 1: {
            // Resizing based on the cumulative size of panels 0 and 1
            const maxCumulative = totalSize - MIN_PANEL_SIZE; // Leave space for panel 2
            const minCumulative = MIN_PANEL_SIZE + MIN_PANEL_SIZE; // Both panels 0 and 1 need minimum
            const clampedCumulative = Math.max(
              minCumulative,
              Math.min(newSize, maxCumulative),
            );

            newSizes[1] = clampedCumulative - newSizes[0];
            newSizes[2] = totalSize - clampedCumulative;

            // Ensure panel 1 doesn't go below minimum
            if (newSizes[1] < MIN_PANEL_SIZE) {
              newSizes[1] = MIN_PANEL_SIZE;
              newSizes[0] = clampedCumulative - MIN_PANEL_SIZE;
              newSizes[2] = totalSize - clampedCumulative;
            }
            break;
          }
        }
        return newSizes as [number, number, number];
      });
    },
    [],
  );

  const resizeColumn = useCallback(resize(setColumnSizes), [resize]);
  const resizeRow = useCallback(resize(setRowSizes), [resize]);

  return (
    <DimensionsContext.Provider
      value={{
        width,
        height,
        columnSizes,
        rowSizes,
        resizeColumn,
        resizeRow,
      }}
    >
      {children}
    </DimensionsContext.Provider>
  );
}

export const useDimensions = () => useContext(DimensionsContext);

export const usePanelDimensions = (section: MappedPanelSection) => {
  const { columnSizes, rowSizes } = useDimensions();
  const [horizontal, vertical] = section.split("_") as [
    HorizontalPanelSection,
    VerticalPanelSection,
  ];
  const column = columnSizes[["left", "center", "right"].indexOf(horizontal)];
  const row = rowSizes[["top", "middle", "bottom"].indexOf(vertical)];
  return { width: column, height: row };
};

export const useHeatmapDimensions = () => usePanelDimensions("center_middle");
