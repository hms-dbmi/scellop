import { temporal } from "zundo";
import { createStore } from "zustand";
import { createTemporalStoreContext } from "../utils/zustand";

interface SelectedDimensionContextProps {
  initialSelectedDimension: "X" | "Y";
}

interface SelectedDimensionContext {
  selectedDimension: "X" | "Y";
  setSelectedDimension: (dimension: "X" | "Y") => void;
}

const createSelectedDimensionContext = ({
  initialSelectedDimension,
}: SelectedDimensionContextProps) => {
  return createStore<SelectedDimensionContext>()(
    temporal((set) => ({
      selectedDimension: initialSelectedDimension,
      setSelectedDimension: (dimension: "X" | "Y") =>
        set({ selectedDimension: dimension }),
    })),
  );
};

export const [
  SelectedDimensionProvider,
  useSelectedDimension,
  ,
  useSelectedDimensionHistory,
] = createTemporalStoreContext<
  SelectedDimensionContext,
  SelectedDimensionContextProps
>(createSelectedDimensionContext, "SelectedDimensionContext");
