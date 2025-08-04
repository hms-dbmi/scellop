import { useCallback, useEffect, useRef, useState } from "react";
import { ScaleBand } from "../../contexts/types";

export interface DragState {
  /**
   * Indicates if the user is currently dragging.
   * This is set to true when the user has moved the mouse a certain distance
   */
  isDragging: boolean;
  /**
   * Indicates if the user has started a click.
   * This is set to true when the mouse button is pressed down.
   * It helps differentiate between a click and a drag.
   */
  isClicking: boolean; // Indicates if the user has started a click
  draggedCell: { row: string; column: string } | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

export interface CanvasDragHandlerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  xScale: ScaleBand<string>;
  yScale: ScaleBand<string>;
  onReorder: (
    draggedCell: { row: string; column: string },
    targetCell: { row: string; column: string },
  ) => void;
  onDragMove?: (
    draggedCell: { row: string; column: string },
    targetCell: { row: string; column: string },
  ) => void;
  disabled?: boolean;
}

export function useCanvasDragHandler({
  canvasRef,
  xScale,
  yScale,
  onReorder,
  onDragMove,
  disabled = false,
}: CanvasDragHandlerOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isClicking: false,
    draggedCell: null,
    startPosition: null,
    currentPosition: null,
  });

  const dragStartTimeRef = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  const lastTargetCellRef = useRef<{ row: string; column: string } | null>(
    null,
  );

  // Get cell from mouse position
  const getCellFromPosition = useCallback(
    (x: number, y: number) => {
      const row = yScale.lookup(y);
      const column = xScale.lookup(x);
      return row && column ? { row, column } : null;
    },
    [xScale, yScale],
  );

  // Get mouse position relative to canvas
  const getRelativePosition = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [canvasRef],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (disabled) return;

      const position = getRelativePosition(e);
      if (!position) return;

      const cell = getCellFromPosition(position.x, position.y);
      if (!cell) return;

      dragStartTimeRef.current = Date.now();
      hasDraggedRef.current = false;

      setDragState({
        isDragging: false, // Don't set to true immediately to allow for click vs drag detection
        draggedCell: cell,
        startPosition: position,
        currentPosition: position,
        isClicking: true,
      });

      // Prevent default to avoid text selection
      e.preventDefault();
    },
    [disabled, getRelativePosition, getCellFromPosition],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedCell || !dragState.startPosition) return;

      const position = getRelativePosition(e);
      if (!position) return;

      // Calculate distance moved
      const dx = position.x - dragState.startPosition.x;
      const dy = position.y - dragState.startPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Start dragging if moved enough distance and enough time has passed
      const timeElapsed = Date.now() - dragStartTimeRef.current;
      const shouldStartDrag = distance > 5 && timeElapsed > 100; // 5px threshold, 100ms delay

      if (shouldStartDrag && !dragState.isDragging) {
        hasDraggedRef.current = true;
        setDragState((prev) => ({
          ...prev,
          isDragging: true,
          currentPosition: position,
        }));
      } else if (dragState.isDragging) {
        // Update current position during drag
        setDragState((prev) => ({
          ...prev,
          currentPosition: position,
        }));

        // Call onDragMove if target cell has changed
        if (onDragMove) {
          const targetCell = getCellFromPosition(position.x, position.y);
          if (
            targetCell &&
            (targetCell.row !== dragState.draggedCell.row ||
              targetCell.column !== dragState.draggedCell.column)
          ) {
            const lastTarget = lastTargetCellRef.current;
            if (
              !lastTarget ||
              lastTarget.row !== targetCell.row ||
              lastTarget.column !== targetCell.column
            ) {
              lastTargetCellRef.current = targetCell;
              onDragMove(dragState.draggedCell, targetCell);
            }
          }
        }
      }
    },
    [dragState, getRelativePosition, onDragMove, getCellFromPosition],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedCell) return;

      const position = getRelativePosition(e);

      if (dragState.isDragging && position) {
        // Handle drop - only call onReorder if we haven't been calling onDragMove
        if (!onDragMove) {
          const targetCell = getCellFromPosition(position.x, position.y);
          if (
            targetCell &&
            (targetCell.row !== dragState.draggedCell.row ||
              targetCell.column !== dragState.draggedCell.column)
          ) {
            onReorder(dragState.draggedCell, targetCell);
          }
        }
      }

      // Reset drag state and references
      setDragState({
        isDragging: false,
        isClicking: false,
        draggedCell: null,
        startPosition: null,
        currentPosition: null,
      });

      lastTargetCellRef.current = null;
      hasDraggedRef.current = false;
    },
    [
      dragState,
      getRelativePosition,
      getCellFromPosition,
      onReorder,
      onDragMove,
    ],
  );

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, disabled]);

  return {
    isClicking: dragState.isClicking,
    dragState,
    isDragging: dragState.isDragging,
    draggedCell: dragState.draggedCell,
    currentPosition: dragState.currentPosition,
  };
}
