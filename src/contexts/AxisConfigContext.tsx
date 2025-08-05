import { temporal } from "zundo";
import { createStore } from "zustand";
import { createTemporalStoreContext } from "../utils/zustand";

export interface AxisConfig {
  label: string;
  createHref?: (tick: string) => string;
  createSubtitle?: (
    value: string,
    metadataValues?: Record<string, string | number>,
  ) => string;
  icon?: React.ReactElement<unknown>;
  // Plural label for the axis, used in tooltips and other places
  // where the axis label is used in plural form.
  // If not provided, defaults to `${label}s`.
  pluralLabel?: string;
}

interface AxisConfigActions {
  setLabel: (label: string) => void;
  setCreateHref: (createHref: (tick: string) => string) => void;
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
        get pluralLabel() {
          return initialArgs.pluralLabel ?? `${this.label}s`;
        },
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
