import { createContext, useContext } from "../../utils/context";

export type PlotControlsSection = "Column" | "Row";

const PlotControlsContext = createContext<PlotControlsSection>("PlotControls");

export const PlotControlsSectionProvider = PlotControlsContext.Provider;

export const usePlotControlsContext = () => useContext(PlotControlsContext);
