import { temporal } from "zundo";
import { createStore } from "zustand";
import type { ViewType } from "../utils/view-types";
import { createTemporalStoreContext } from "../utils/zustand";

interface ViewTypeContextDataInput {
  viewType?: ViewType;
}

interface ViewTypeContextActions {
  setViewType: (viewType: ViewType) => void;
  setTraditional: () => void;
  setDefault: () => void;
}

type ViewTypeContextStore = Required<ViewTypeContextDataInput> &
  ViewTypeContextActions;

const createViewTypeStore = ({ viewType }: ViewTypeContextDataInput) => {
  return createStore<ViewTypeContextStore>()(
    temporal((set) => ({
      viewType: viewType ?? "default",
      setViewType: (viewType: ViewType) => set({ viewType }),
      setTraditional: () => set({ viewType: "traditional" }),
      setDefault: () => set({ viewType: "default" }),
    })),
  );
};

export const [ViewTypeProvider, useViewType, , useViewTypeHistory] =
  createTemporalStoreContext<ViewTypeContextStore, ViewTypeContextDataInput>(
    createViewTypeStore,
    "ViewTypeContext",
  );
