import { temporal } from "zundo";
import { createStore } from "zustand";
import { createTemporalStoreContext } from "../utils/zustand";

export interface AxisConfig {
  label: string;
  createHref?: (tick: string) => string;
  flipAxisPosition?: boolean;
  createSubtitle?: (
    value: string,
    metadataValues?: Record<string, string | number>,
  ) => string;
  icon?: React.ReactElement<unknown>;
}

interface AxisConfigActions {
  setLabel: (label: string) => void;
  setCreateHref: (createHref: (tick: string) => string) => void;
  setFlipAxisPosition: (flipAxisPosition: boolean) => void;
}

type AxisConfigStore = AxisConfig & AxisConfigActions;

const createAxisConfigStore =
  (direction: "Row" | "Column") => (initialArgs: AxisConfig) => {
    return createStore<AxisConfigStore>()(
      temporal((set) => ({
        ...initialArgs,
        label: initialArgs.label ?? direction,
        setLabel: (label: string) => set({ label }),
        setCreateHref: (createHref: (tick: string) => string) =>
          set({ createHref }),
        setFlipAxisPosition: (flipAxisPosition: boolean) =>
          set({ flipAxisPosition }),
      })),
    );
  };

export const [
  [RowConfigProvider, useRowConfig, , useRowConfigHistory],
  [ColumnConfigProvider, useColumnConfig, , useColumnConfigHistory],
] = (["Row", "Column"] as const).map((direction) =>
  createTemporalStoreContext<AxisConfigStore, AxisConfig>(
    createAxisConfigStore(direction),
    `${direction}ConfigContext`,
  ),
);
