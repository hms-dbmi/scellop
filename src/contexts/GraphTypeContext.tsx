import { temporal } from "zundo";
import { createStore } from "zustand";
import { createTemporalStoreContext } from "../utils/zustand";

export const GRAPH_TYPES = ["Bars", "Stacked Bars", "Violins"] as const;
export type GraphType = (typeof GRAPH_TYPES)[number];

export const GRAPH_TYPE_DESCRIPTIONS: Record<GraphType, string> = {
  Bars: "Standard bar charts displaying the total values for each category.",
  "Stacked Bars":
    "Stacked bar charts showing the breakdown of values within each category.",
  Violins:
    "Violin plots displaying the distribution of values for each category.",
};

interface GraphTypeProps {
  initialGraphType?: GraphType;
}
interface GraphTypeStore {
  graphType: GraphType;
  setGraphType: (graphType: GraphType) => void;
}

const createGraphTypeStore = ({
  initialGraphType = "Bars",
}: GraphTypeProps) => {
  return createStore<GraphTypeStore>()(
    temporal((set) => ({
      graphType: initialGraphType,
      setGraphType: (graphType: GraphType) => set({ graphType }),
    })),
  );
};

export const [GraphTypeProvider, useGraphType, , useGraphTypeHistory] =
  createTemporalStoreContext<GraphTypeStore, GraphTypeProps>(
    createGraphTypeStore,
    "GraphTypeContext",
  );

export const useIsViolins = () =>
  useGraphType((s) => s.graphType === "Violins");
export const useIsBars = () => useGraphType((s) => s.graphType === "Bars");
export const useIsStackedBars = () =>
  useGraphType((s) => s.graphType === "Stacked Bars");
