import { createContext, useContext } from "../utils/context";
import type { MappedPanelSection } from "./types";

const PanelRefContext =
  createContext<
    Record<MappedPanelSection, React.RefObject<HTMLDivElement> | null>
  >("Panel Ref Context");

export function usePanelRefContext() {
  return useContext(PanelRefContext);
}

export function usePanelRef(section: MappedPanelSection) {
  const context = usePanelRefContext();
  return context[section] || null;
}

export const PanelRefProvider = PanelRefContext.Provider;
