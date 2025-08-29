import React, { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { createContext, useContext } from "../utils/context";

import { useEventCallback } from "@mui/material/utils";

import { TemporalState } from "zundo";
import { StoreApi } from "zustand";
import {
  useColumnConfigHistory,
  useRowConfigHistory,
} from "./AxisConfigContext";
import { useThemeHistory } from "./CellPopThemeContext";
import { useDataHistory } from "./DataContext";
import {
  useGraphTypeControlIsDisabled,
  useNormalizationControlIsDisabled,
  useSelectionControlIsDisabled,
  useThemeControlIsDisabled,
} from "./DisabledControlProvider";
import { useTrackEvent } from "./EventTrackerProvider";
import { useExpandedValuesHistory } from "./ExpandedValuesContext";
import { useIndividualGraphTypeHistory } from "./IndividualGraphTypeContext";
import { useNormalizationHistory } from "./NormalizationContext";
import { useSelectedDimensionHistory } from "./SelectedDimensionContext";

function useTemporalActions() {
  const themeHistory = useThemeHistory();
  const selectedDimensionHistory = useSelectedDimensionHistory();
  const graphTypeHistory = useIndividualGraphTypeHistory();
  const dataHistory = useDataHistory();
  const expandedHistory = useExpandedValuesHistory();
  const normalizationHistory = useNormalizationHistory();
  const rowHistory = useRowConfigHistory();
  const columnHistory = useColumnConfigHistory();

  const themeIsDisabled = useThemeControlIsDisabled();
  const graphTypeIsDisabled = useGraphTypeControlIsDisabled();
  const selectionTypeisDisabled = useSelectionControlIsDisabled();
  const normalizationIsDisabled = useNormalizationControlIsDisabled();

  const undoQueue = useRef<TemporalState<StoreApi<unknown>>[]>([]);
  const redoQueue = useRef<TemporalState<StoreApi<unknown>>[]>([]);

  const trackEvent = useTrackEvent();

  useEffect(() => {
    const onSave = (state: TemporalState<StoreApi<unknown>>) => () => {
      undoQueue.current.push(state);
      redoQueue.current = [];
    };
    if (!themeIsDisabled) {
      themeHistory.setOnSave(onSave(themeHistory));
    }
    if (!selectionTypeisDisabled) {
      selectedDimensionHistory.setOnSave(onSave(selectedDimensionHistory));
    }
    if (!graphTypeIsDisabled) {
      graphTypeHistory.setOnSave(onSave(graphTypeHistory));
    }
    if (!normalizationIsDisabled) {
      normalizationHistory.setOnSave(onSave(normalizationHistory));
    }
    dataHistory.setOnSave(onSave(dataHistory));
    expandedHistory.setOnSave(onSave(expandedHistory));
    rowHistory.setOnSave(onSave(rowHistory));
    columnHistory.setOnSave(onSave(columnHistory));
    return () => {
      themeHistory.setOnSave(undefined);
      selectedDimensionHistory.setOnSave(undefined);
      graphTypeHistory.setOnSave(undefined);
      dataHistory.setOnSave(undefined);
      expandedHistory.setOnSave(undefined);
      normalizationHistory.setOnSave(undefined);
      rowHistory.setOnSave(undefined);
      columnHistory.setOnSave(undefined);
    };
  }, [
    themeIsDisabled,
    graphTypeIsDisabled,
    graphTypeIsDisabled,
    selectionTypeisDisabled,
  ]);

  const undo = useEventCallback(() => {
    const last = undoQueue.current.pop();
    if (last) {
      last.undo();
      redoQueue.current.push(last);
      trackEvent("Undo Last Action", "");
    }
  });

  const redo = useEventCallback(() => {
    const last = redoQueue.current.pop();
    if (last) {
      last.redo();
      undoQueue.current.push(last);
      trackEvent("Redo Last Action", "");
    }
  });

  const restoreToDefault = useEventCallback(() => {
    themeHistory.undo(themeHistory.pastStates.length);
    selectedDimensionHistory.undo(selectedDimensionHistory.pastStates.length);
    graphTypeHistory.undo(graphTypeHistory.pastStates.length);
    dataHistory.undo(dataHistory.pastStates.length);
    expandedHistory.undo(expandedHistory.pastStates.length);
    normalizationHistory.undo(normalizationHistory.pastStates.length);
    undoQueue.current = [];
    redoQueue.current = [];
    rowHistory.undo(rowHistory.pastStates.length);
    columnHistory.undo(columnHistory.pastStates.length);
    trackEvent("Restore to Default", "");
  });

  const canUndo = undoQueue.current.length > 0;
  const canRedo = redoQueue.current.length > 0;

  return { undo, redo, canUndo, canRedo, restoreToDefault };
}

interface TemporalControlsContextProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  restoreToDefault: () => void;
}

const TemporalControlsContext = createContext<TemporalControlsContextProps>(
  "TemporalControlsContext",
);

export function useTemporalControls() {
  return useContext(TemporalControlsContext);
}

export default function TemporalControlsProvider({
  children,
}: PropsWithChildren) {
  const { undo, redo, canUndo, canRedo, restoreToDefault } =
    useTemporalActions();

  const value = useMemo(() => {
    return { undo, redo, canUndo, canRedo, restoreToDefault };
  }, [undo, redo, canUndo, canRedo, restoreToDefault]);

  return (
    <TemporalControlsContext.Provider value={value}>
      {children}
    </TemporalControlsContext.Provider>
  );
}
