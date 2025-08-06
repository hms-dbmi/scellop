import { useCallback, useEffect, useRef, useState } from "react";
import { ScaleBand } from "../../contexts/types";

export interface BarDragState {
  /**
   * Indicates if the user is currently dragging.
   */
  isDragging: boolean;
  /**
   * Indicates if the user has started a click.
   */
  isClicking: boolean;
  draggedValue: string | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

export interface BarsDragHandlerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: ScaleBand<string>;
  orientation: "rows" | "columns";
  onReorder: (draggedValue: string, targetValue: string) => void;
  onDragMove?: (draggedValue: string, targetValue: string) => void;
  disabled?: boolean;
  scrollOffset?: number;
  isZoomed?: boolean;
}

export function useBarsDragHandler({
  canvasRef,
  scale,
  orientation,
  onReorder,
  onDragMove,
  disabled = false,
  scrollOffset = 0,
  isZoomed = false,
}: BarsDragHandlerOptions) {
  const [dragState, setDragState] = useState<BarDragState>({
    isDragging: false,
    isClicking: false,
    draggedValue: null,
    startPosition: null,
    currentPosition: null,
  });

  const dragStartTimeRef = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  const lastTargetValueRef = useRef<string | null>(null);

  // Get value from mouse position
  const getValueFromPosition = useCallback(
    (x: number, y: number) => {
      // For horizontal bars, we use Y position; for vertical bars, we use X position
      let position = orientation === "rows" ? y : x;

      // Adjust for scroll offset when zoomed
      if (isZoomed) {
        position += scrollOffset;
      }

      // Use the scale's lookup method if available (for complex scales like expanded rows)
      if (scale.lookup) {
        return scale.lookup(position);
      }

      // Fallback: Manual lookup for simple uniform scales
      const domain = scale.domain();
      const bandwidth = scale.bandwidth();
      const [rangeStart, rangeEnd] = scale.range();

      // For horizontal bars with inverted Y scale (range goes from height to 0)
      // we need to adjust the position calculation
      let adjustedPosition = position;
      if (orientation === "rows" && rangeStart > rangeEnd) {
        // Inverted scale - adjust position relative to the start of range
        adjustedPosition = rangeStart - position;
      }

      const index = Math.floor(adjustedPosition / bandwidth);
      return domain[index] || null;
    },
    [scale, orientation, scrollOffset, isZoomed],
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

      const value = getValueFromPosition(position.x, position.y);
      if (!value) return;

      dragStartTimeRef.current = Date.now();
      hasDraggedRef.current = false;

      setDragState({
        isDragging: false,
        draggedValue: value,
        startPosition: position,
        currentPosition: position,
        isClicking: true,
      });

      // Prevent default to avoid text selection
      e.preventDefault();
    },
    [disabled, getRelativePosition, getValueFromPosition],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedValue || !dragState.startPosition) return;

      const position = getRelativePosition(e);
      if (!position) return;

      // Calculate distance moved
      const dx = position.x - dragState.startPosition.x;
      const dy = position.y - dragState.startPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Start dragging if moved enough distance and enough time has passed
      const timeElapsed = Date.now() - dragStartTimeRef.current;
      const shouldStartDrag = distance > 5 && timeElapsed > 100;

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

        // Call onDragMove if target value has changed
        if (onDragMove) {
          const targetValue = getValueFromPosition(position.x, position.y);
          if (targetValue && targetValue !== dragState.draggedValue) {
            const lastTarget = lastTargetValueRef.current;
            if (lastTarget !== targetValue) {
              lastTargetValueRef.current = targetValue;
              onDragMove(dragState.draggedValue, targetValue);
            }
          }
        }
      }
    },
    [dragState, getRelativePosition, onDragMove, getValueFromPosition],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedValue) return;

      const position = getRelativePosition(e);

      if (dragState.isDragging && position) {
        // Handle drop - only call onReorder if we haven't been calling onDragMove
        if (!onDragMove) {
          const targetValue = getValueFromPosition(position.x, position.y);
          if (targetValue && targetValue !== dragState.draggedValue) {
            onReorder(dragState.draggedValue, targetValue);
          }
        }
      }

      // Reset drag state and references
      setDragState({
        isDragging: false,
        isClicking: false,
        draggedValue: null,
        startPosition: null,
        currentPosition: null,
      });

      lastTargetValueRef.current = null;
      hasDraggedRef.current = false;
    },
    [
      dragState,
      getRelativePosition,
      getValueFromPosition,
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
    isDragging: dragState.isDragging,
    draggedValue: dragState.draggedValue,
    currentPosition: dragState.currentPosition,
  };
}
