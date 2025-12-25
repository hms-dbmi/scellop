import { temporal } from "zundo";
import { createStore } from "zustand";
import type { GraphType } from "../utils/graph-types";
import { createTemporalStoreContext } from "../utils/zustand";

interface IndividualGraphTypeProps {
  initialLeftGraphType?: GraphType;
  initialTopGraphType?: GraphType;
}

interface IndividualGraphTypeStore {
  leftGraphType: GraphType;
  topGraphType: GraphType;
  previousTopGraphType: GraphType | null;
  setLeftGraphType: (graphType: GraphType) => void;
  setTopGraphType: (graphType: GraphType) => void;
  setTopGraphTypeForTraditional: (graphType: GraphType) => void;
  restorePreviousTopGraphType: () => void;
}

const createIndividualGraphTypeStore = ({
  initialLeftGraphType = "Bars",
  initialTopGraphType = "Bars",
}: IndividualGraphTypeProps) => {
  return createStore<IndividualGraphTypeStore>()(
    temporal((set) => ({
      leftGraphType: initialLeftGraphType,
      topGraphType: initialTopGraphType,
      previousTopGraphType: null,
      setLeftGraphType: (graphType: GraphType) =>
        set({ leftGraphType: graphType }),
      setTopGraphType: (graphType: GraphType) =>
        set({ topGraphType: graphType }),
      setTopGraphTypeForTraditional: (graphType: GraphType) =>
        set((state) => ({
          previousTopGraphType: state.topGraphType,
          topGraphType: graphType,
        })),
      restorePreviousTopGraphType: () =>
        set((state) => ({
          topGraphType: state.previousTopGraphType || state.topGraphType,
          previousTopGraphType: null,
        })),
    })),
  );
};

export const [
  IndividualGraphTypeProvider,
  useIndividualGraphType,
  ,
  useIndividualGraphTypeHistory,
] = createTemporalStoreContext<
  IndividualGraphTypeStore,
  IndividualGraphTypeProps
>(createIndividualGraphTypeStore, "IndividualGraphTypeContext");

// Convenience hooks for specific graphs
export const useLeftGraphType = () =>
  useIndividualGraphType((s) => s.leftGraphType);

export const useTopGraphType = () =>
  useIndividualGraphType((s) => s.topGraphType);

export const useSetLeftGraphType = () =>
  useIndividualGraphType((s) => s.setLeftGraphType);

export const useSetTopGraphType = () =>
  useIndividualGraphType((s) => s.setTopGraphType);

export const useSetTopGraphTypeForTraditional = () =>
  useIndividualGraphType((s) => s.setTopGraphTypeForTraditional);

export const useRestorePreviousTopGraphType = () =>
  useIndividualGraphType((s) => s.restorePreviousTopGraphType);

// Type checking hooks for left graph
export const useIsLeftViolins = () =>
  useIndividualGraphType((s) => s.leftGraphType === "Violins");

export const useIsLeftBars = () =>
  useIndividualGraphType((s) => s.leftGraphType === "Bars");

export const useIsLeftStackedBars = () =>
  useIndividualGraphType(
    (s) =>
      s.leftGraphType === "Stacked Bars (Continuous)" ||
      s.leftGraphType === "Stacked Bars (Categorical)",
  );

// Type checking hooks for top graph
export const useIsTopViolins = () =>
  useIndividualGraphType((s) => s.topGraphType === "Violins");

export const useIsTopBars = () =>
  useIndividualGraphType((s) => s.topGraphType === "Bars");

export const useIsTopStackedBars = () =>
  useIndividualGraphType(
    (s) =>
      s.topGraphType === "Stacked Bars (Continuous)" ||
      s.topGraphType === "Stacked Bars (Categorical)",
  );
