import { temporal } from "zundo";
import { createStore } from "zustand";
import { createTemporalStoreContext } from "../utils/zustand";

export interface AxisConfig {
  label: string;
  createHref?: (
    tick: string,
    metadataValues?: Record<string, string | number>,
  ) => string;
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
  // A mapping of item names to their assigned colors.
  // This ensures colors remain stable regardless of item order.
  colors?: Record<string, string>;
}

interface InitializedAxisConfig extends AxisConfig {
  pluralLabel: string;
}

interface AxisConfigActions {
  setLabel: (label: string) => void;
  setCreateHref: (
    createHref: (
      tick: string,
      metadataValues?: Record<string, string | number>,
    ) => string,
  ) => void;
  setCreateSubtitle: (
    createSubtitle: (
      value: string,
      metadataValues?: Record<string, string | number>,
    ) => string,
  ) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleZoom: () => void;
  setZoomBandwidth: (zoomSize: number) => void;
  setColors: (colors: Record<string, string>) => void;
  setColor: (itemName: string, color: string) => void;
  removeColor: (itemName: string) => void;
  setPluralLabel: (pluralLabel: string) => void;
  setAllColors: (color: string, items: string[]) => void;
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
        setCreateHref: (
          createHref: (
            tick: string,
            metadataValues?: Record<string, string | number>,
          ) => string,
        ) => set({ createHref }),
        setCreateSubtitle: (
          createSubtitle: (
            value: string,
            metadataValues?: Record<string, string | number>,
          ) => string,
        ) => set({ createSubtitle }),
        get pluralLabel() {
          return initialArgs.pluralLabel ?? `${this.label}s`;
        },
        setPluralLabel: (pluralLabel: string) => set({ pluralLabel }),
        setZoomBandwidth: (zoomedBandwidth: number) => set({ zoomedBandwidth }),
        zoomIn: () => set({ zoomed: true }),
        zoomOut: () => set({ zoomed: false }),
        toggleZoom: () => set({ zoomed: !get().zoomed }),
        setColors: (colors: Record<string, string>) => set({ colors }),
        setColor: (itemName: string, color: string) => {
          const colors = get().colors ?? {};
          set({ colors: { ...colors, [itemName]: color } });
        },
        removeColor: (itemName: string) => {
          const colors = get().colors ?? {};
          const newColors = { ...colors };
          delete newColors[itemName];
          set({ colors: newColors });
        },
        setAllColors: (color: string, items: string[]) => {
          const colors: Record<string, string> = {};
          items.forEach((item) => {
            colors[item] = color;
          });
          set({ colors });
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

export const useRowZoomed = () =>
  useRowConfig((s) => [s.zoomed, s.zoomedBandwidth] as const);
export const useColumnZoomed = () =>
  useColumnConfig((s) => [s.zoomed, s.zoomedBandwidth] as const);

export const useSwapAxisConfigs = () => {
  const rowConfigState = useRowConfig();
  const columnConfigState = useColumnConfig();

  return () => {
    // Get current states
    const currentRowState = {
      label: rowConfigState.label,
      createHref: rowConfigState.createHref,
      createSubtitle: rowConfigState.createSubtitle,
      icon: rowConfigState.icon,
      pluralLabel: rowConfigState.pluralLabel,
      zoomed: rowConfigState.zoomed,
      zoomedBandwidth: rowConfigState.zoomedBandwidth,
      colors: rowConfigState.colors,
    };

    const currentColumnState = {
      label: columnConfigState.label,
      createHref: columnConfigState.createHref,
      createSubtitle: columnConfigState.createSubtitle,
      icon: columnConfigState.icon,
      pluralLabel: columnConfigState.pluralLabel,
      zoomed: columnConfigState.zoomed,
      zoomedBandwidth: columnConfigState.zoomedBandwidth,
      colors: columnConfigState.colors,
    };

    // Apply swapped configurations
    rowConfigState.setLabel(currentColumnState.label);
    rowConfigState.setPluralLabel(currentColumnState.pluralLabel);
    if (currentColumnState.createHref) {
      rowConfigState.setCreateHref(currentColumnState.createHref);
    }
    rowConfigState.setZoomBandwidth(currentColumnState.zoomedBandwidth ?? 32);
    if (currentColumnState.zoomed !== rowConfigState.zoomed) {
      rowConfigState.toggleZoom();
    }
    if (currentColumnState.colors) {
      rowConfigState.setColors(currentColumnState.colors);
    }
    if (currentColumnState.createSubtitle) {
      rowConfigState.setCreateSubtitle(currentColumnState.createSubtitle);
    }

    columnConfigState.setLabel(currentRowState.label);
    columnConfigState.setPluralLabel(currentRowState.pluralLabel);
    if (currentRowState.createHref) {
      columnConfigState.setCreateHref(currentRowState.createHref);
    }
    columnConfigState.setZoomBandwidth(currentRowState.zoomedBandwidth ?? 32);
    if (currentRowState.zoomed !== columnConfigState.zoomed) {
      columnConfigState.toggleZoom();
    }
    if (currentRowState.colors) {
      columnConfigState.setColors(currentRowState.colors);
    }
    if (currentRowState.createSubtitle) {
      columnConfigState.setCreateSubtitle(currentRowState.createSubtitle);
    }
  };
};
