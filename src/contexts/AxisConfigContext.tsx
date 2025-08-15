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

  // Whether to expand the axis in the UI.
  zoomed?: boolean;
  // What size (in pixels) to set the scale bandwidth to when it is zoomed.
  // Defaults to 32.
  zoomedBandwidth?: number;
}

interface InitializedAxisConfig extends AxisConfig {
  pluralLabel: string;
}

interface AxisConfigActions {
  setLabel: (label: string) => void;
  setCreateHref: (createHref: (tick: string) => string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleZoom: () => void;
  setZoomBandwidth: (zoomSize: number) => void;
}

export type AxisConfigStore = InitializedAxisConfig & AxisConfigActions;

const createAxisConfigStore =
  (direction: "Row" | "Column") => (initialArgs: AxisConfig) => {
    return createStore<AxisConfigStore>()(
      temporal((set, get) => ({
        ...initialArgs,
        label: initialArgs.label ?? direction,
        zoomedBandwidth: initialArgs.zoomedBandwidth ?? 32,
        setLabel: (label: string) => set({ label }),
        setCreateHref: (createHref: (tick: string) => string) =>
          set({ createHref }),
        get pluralLabel() {
          return initialArgs.pluralLabel ?? `${this.label}s`;
        },
        setZoomBandwidth: (zoomedBandwidth: number) => set({ zoomedBandwidth }),
        zoomIn: () => set({ zoomed: true }),
        zoomOut: () => set({ zoomed: false }),
        toggleZoom: () => set({ zoomed: !get().zoomed }),
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

export const useRowZoomed = () =>
  useRowConfig((s) => [s.zoomed, s.zoomedBandwidth] as const);
export const useColumnZoomed = () =>
  useColumnConfig((s) => [s.zoomed, s.zoomedBandwidth] as const);
