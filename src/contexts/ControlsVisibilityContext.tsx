import React, { PropsWithChildren } from "react";
import useBoolean from "../hooks/useBoolean";
import { createContext, useContext } from "../utils/context";

interface ControlsVisibilityContextType {
  isControlsVisible: boolean;
}

interface ControlsVisibilityContextActions {
  showControls: () => void;
  hideControls: () => void;
  setControls: (visible: boolean) => void;
  toggleControls: () => void;
}

const ControlsVisibilityContext = createContext<ControlsVisibilityContextType>(
  "ControlsVisibilityContext",
);

const ControlsVisibilityActionsContext =
  createContext<ControlsVisibilityContextActions | null>(
    "ControlsVisibilityActionsContext",
  );

export default function ControlsVisibilityProvider({
  children,
}: PropsWithChildren) {
  const [
    isControlsVisible,
    showControls,
    hideControls,
    toggleControls,
    setControls,
  ] = useBoolean(false);

  const contextValue: ControlsVisibilityContextType = {
    isControlsVisible,
  };

  const actionsValue: ControlsVisibilityContextActions = {
    setControls,
    showControls,
    hideControls,
    toggleControls,
  };

  return (
    <ControlsVisibilityContext.Provider value={contextValue}>
      <ControlsVisibilityActionsContext.Provider value={actionsValue}>
        {children}
      </ControlsVisibilityActionsContext.Provider>
    </ControlsVisibilityContext.Provider>
  );
}

export const useControlsVisibility = () =>
  useContext(ControlsVisibilityContext);

export const useControlsVisibilityActions = () =>
  useContext(ControlsVisibilityActionsContext);
