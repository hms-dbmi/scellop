import { useTooltip } from "@visx/tooltip";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { createContext, useContext } from "../utils/context";

export interface TooltipData {
  title: string;
  data: Record<string, unknown>;
}

interface TooltipDataContextType {
  tooltipData?: TooltipData;
  tooltipOpen: boolean;
  tooltipLeft: number;
  tooltipTop: number;
  contextMenuOpen: boolean;
}

const TooltipDataContext = createContext<TooltipDataContextType>("TooltipData");

interface TooltipActionsContextType {
  openTooltip: (data: TooltipData, left: number, top: number) => void;
  closeTooltip: () => void;
  openContextMenu: () => void;
  closeContextMenu: () => void;
}

const TooltipActionsContext =
  createContext<TooltipActionsContextType>("SetTooltipData");

export const useTooltipData = () => useContext(TooltipDataContext);
export const useSetTooltipData = () => useContext(TooltipActionsContext);

/**
 * Provider which manages the tooltip data and actions for displaying tooltips.
 */
export function TooltipDataProvider({ children }: PropsWithChildren) {
  const {
    showTooltip,
    hideTooltip,
    updateTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<TooltipData>({
    tooltipOpen: false,
    tooltipData: undefined,
  });

  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  const tooltipDataContext = useMemo(
    () => ({
      tooltipData,
      tooltipOpen,
      contextMenuOpen,
      tooltipLeft,
      tooltipTop,
    }),
    [tooltipData, tooltipOpen, tooltipLeft, tooltipTop, contextMenuOpen],
  );

  const tooltipActionsContext = useMemo(() => {
    const openTooltip = (data: TooltipData, left: number, top: number) => {
      if (contextMenuOpen) {
        return;
      }
      showTooltip({ tooltipData: data, tooltipLeft: left, tooltipTop: top });
    };
    const closeTooltip = () => {
      if (contextMenuOpen) {
        return;
      }
      hideTooltip();
    };
    const openContextMenu = () => {
      setContextMenuOpen(true);
    };
    const closeContextMenu = () => {
      setContextMenuOpen(false);
      hideTooltip();
    };
    return { openTooltip, closeTooltip, openContextMenu, closeContextMenu };
  }, [updateTooltip, contextMenuOpen]);

  return (
    <TooltipDataContext.Provider value={tooltipDataContext}>
      <TooltipActionsContext.Provider value={tooltipActionsContext}>
        {children}
      </TooltipActionsContext.Provider>
    </TooltipDataContext.Provider>
  );
}
