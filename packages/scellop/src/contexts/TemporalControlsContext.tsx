import { useEventCallback } from "@mui/material/utils";
import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TemporalState } from "zundo";
import type { StoreApi } from "zustand";
import { createContext, useContext } from "../utils/context";
import {
  useColumnConfigHistory,
  useRowConfigHistory,
} from "./AxisConfigContext";
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
import { useThemeHistory } from "./ThemeContext";

function useTemporalActions() {
  const themeHistory = useThemeHistory();
  const selectedDimensionHistory = useSelectedDimensionHistory();
  const graphTypeHistory = useIndividualGraphTypeHistory();
  const dataHistory = useDataHistory();
  const expandedHistory = useExpandedValuesHistory();
  const normalizationHistory = useNormalizationHistory();
  const rowHistory = useRowConfigHistory();
  const columnHistory = useColumnConfigHistory();

  // Store history objects in refs to avoid triggering effects
  const historyRef = useRef({
    themeHistory,
    selectedDimensionHistory,
    graphTypeHistory,
    dataHistory,
    expandedHistory,
    normalizationHistory,
    rowHistory,
    columnHistory,
  });

  // Update refs on each render
  historyRef.current = {
    themeHistory,
    selectedDimensionHistory,
    graphTypeHistory,
    dataHistory,
    expandedHistory,
    normalizationHistory,
    rowHistory,
    columnHistory,
  };

  const themeIsDisabled = useThemeControlIsDisabled();
  const graphTypeIsDisabled = useGraphTypeControlIsDisabled();
  const selectionTypeisDisabled = useSelectionControlIsDisabled();
  const normalizationIsDisabled = useNormalizationControlIsDisabled();

  const undoQueue = useRef<TemporalState<StoreApi<unknown>>[]>([]);
  const redoQueue = useRef<TemporalState<StoreApi<unknown>>[]>([]);

  // Use a counter to force re-renders when queues change, avoiding direct state checks
  const [_queueVersion, setQueueVersion] = useState(0);
  const forceUpdate = useEventCallback(() => setQueueVersion((v) => v + 1));

  const trackEvent = useTrackEvent();

  useEffect(() => {
    const history = historyRef.current;
    const onSave = (state: TemporalState<StoreApi<unknown>>) => () => {
      undoQueue.current.push(state);
      redoQueue.current = [];
      forceUpdate();
    };
    if (!themeIsDisabled) {
      history.themeHistory.setOnSave(onSave(history.themeHistory));
    }
    if (!selectionTypeisDisabled) {
      history.selectedDimensionHistory.setOnSave(
        onSave(history.selectedDimensionHistory),
      );
    }
    if (!graphTypeIsDisabled) {
      history.graphTypeHistory.setOnSave(onSave(history.graphTypeHistory));
    }
    if (!normalizationIsDisabled) {
      history.normalizationHistory.setOnSave(
        onSave(history.normalizationHistory),
      );
    }
    history.dataHistory.setOnSave(onSave(history.dataHistory));
    history.expandedHistory.setOnSave(onSave(history.expandedHistory));
    history.rowHistory.setOnSave(onSave(history.rowHistory));
    history.columnHistory.setOnSave(onSave(history.columnHistory));
    return () => {
      history.themeHistory.setOnSave(undefined);
      history.selectedDimensionHistory.setOnSave(undefined);
      history.graphTypeHistory.setOnSave(undefined);
      history.dataHistory.setOnSave(undefined);
      history.expandedHistory.setOnSave(undefined);
      history.normalizationHistory.setOnSave(undefined);
      history.rowHistory.setOnSave(undefined);
      history.columnHistory.setOnSave(undefined);
    };
  }, [
    themeIsDisabled,
    graphTypeIsDisabled,
    selectionTypeisDisabled,
    normalizationIsDisabled,
    forceUpdate,
  ]);

  const undo = useEventCallback(() => {
    const last = undoQueue.current.pop();
    if (last) {
      last.undo();
      redoQueue.current.push(last);
      forceUpdate();
      trackEvent("Undo Last Action", "");
    }
  });

  const redo = useEventCallback(() => {
    const last = redoQueue.current.pop();
    if (last) {
      last.redo();
      undoQueue.current.push(last);
      forceUpdate();
      trackEvent("Redo Last Action", "");
    }
  });

  const restoreToDefault = useEventCallback(() => {
    const history = historyRef.current;
    history.themeHistory.undo(history.themeHistory.pastStates.length);
    history.selectedDimensionHistory.undo(
      history.selectedDimensionHistory.pastStates.length,
    );
    history.graphTypeHistory.undo(history.graphTypeHistory.pastStates.length);
    history.dataHistory.undo(history.dataHistory.pastStates.length);
    history.expandedHistory.undo(history.expandedHistory.pastStates.length);
    history.normalizationHistory.undo(
      history.normalizationHistory.pastStates.length,
    );
    undoQueue.current = [];
    redoQueue.current = [];
    history.rowHistory.undo(history.rowHistory.pastStates.length);
    history.columnHistory.undo(history.columnHistory.pastStates.length);
    forceUpdate();
    trackEvent("Restore to Default", "");
  });

  // Compute these based on current queue state (will update when queueVersion changes)
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
