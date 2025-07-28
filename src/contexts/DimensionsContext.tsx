import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createContext, useContext } from "../utils/context";
import { Setter } from "../utils/types";
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
  const [columnSizes, setColumnSizes] = useState<GridSizeTuple>(
    getInitialSize(width, initialColumnProportions),
  );
  const [rowSizes, setRowSizes] = useState<GridSizeTuple>(
    getInitialSize(height, initialRowProportions),
  );

  const dimensionsRef = useRef({ width, height });

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
        switch (index) {
          case 0:
            newSizes[0] = newSize;
            newSizes[1] = newSizes[1] + oldSize - newSize;
            if (newSizes[0] < 0 || newSizes[1] < 0) {
              return prev;
            }
            break;
          case 1:
            newSizes[1] = newSize - newSizes[0];
            newSizes[2] = totalSize - newSize;
            if (newSizes[1] < 0 || newSizes[2] < 0) {
              return prev;
            }
            break;
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
