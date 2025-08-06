import { useCallback, useEffect, useRef, useState } from "react";

export interface MetadataBarDragState {
  isDragging: boolean;
  isClicking: boolean;
  draggedSegment: BarHelper | null;
  targetSegment: BarHelper | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

export interface BarHelper {
  value: string | number;
  height: number;
  width: number;
  color: string;
  x: number;
  y: number;
  keys: string[];
}

export interface MetadataValueBarDragHandlerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  bars: BarHelper[];
  axis: "X" | "Y";
  onSegmentReorder: (draggedKeys: string[], targetKeys: string[]) => void;
  onDragMove?: (draggedKeys: string[], targetKeys: string[]) => void;
  disabled?: boolean;
  scrollOffset?: number;
  isZoomed?: boolean;
}

export interface MetadataValueBarDragHandlerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  bars: BarHelper[];
  axis: "X" | "Y";
  onSegmentReorder: (draggedKeys: string[], targetKeys: string[]) => void;
  disabled?: boolean;
  scrollOffset?: number;
  isZoomed?: boolean;
}

export function useMetadataValueBarDragHandler({
  canvasRef,
  bars,
  axis,
  onSegmentReorder,
  onDragMove,
  disabled = false,
  scrollOffset = 0,
  isZoomed = false,
}: MetadataValueBarDragHandlerOptions) {
  const [dragState, setDragState] = useState<MetadataBarDragState>({
    isDragging: false,
    isClicking: false,
    draggedSegment: null,
    targetSegment: null,
    startPosition: null,
    currentPosition: null,
  });

  const dragStartTimeRef = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  const lastUpdateTimeRef = useRef<number>(0);

  // Get segment from mouse position
  const getSegmentFromPosition = useCallback(
    (clientX: number, clientY: number): BarHelper | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Adjust for scroll offset
      const adjustedX = axis === "X" && isZoomed ? x + scrollOffset : x;
      const adjustedY = axis === "Y" && isZoomed ? y + scrollOffset : y;

      // Find segment at position
      for (const bar of bars) {
        if (
          adjustedX >= bar.x &&
          adjustedX <= bar.x + bar.width &&
          adjustedY >= bar.y &&
          adjustedY <= bar.y + bar.height
        ) {
          return bar;
        }
      }
      return null;
    },
    [bars, axis, isZoomed, scrollOffset, canvasRef],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (disabled) return;

      const segment = getSegmentFromPosition(e.clientX, e.clientY);
      if (!segment) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      dragStartTimeRef.current = Date.now();
      lastUpdateTimeRef.current = 0; // Reset throttling
      hasDraggedRef.current = false;

      setDragState({
        isDragging: false,
        isClicking: true,
        draggedSegment: segment,
        targetSegment: null,
        startPosition: position,
        currentPosition: position,
      });

      // Prevent default to avoid text selection
      e.preventDefault();
    },
    [disabled, getSegmentFromPosition, canvasRef],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedSegment || !dragState.startPosition) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

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
        // Throttle updates during drag to improve performance
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

        if (timeSinceLastUpdate < 16) {
          // Skip update if less than ~60fps (16ms)
          return;
        }

        lastUpdateTimeRef.current = now;

        // Find target segment at current position
        const targetSegment = getSegmentFromPosition(e.clientX, e.clientY);

        // Update target segment if changed
        if (targetSegment && targetSegment !== dragState.draggedSegment) {
          if (dragState.targetSegment !== targetSegment) {
            setDragState((prev) => ({
              ...prev,
              targetSegment,
              currentPosition: position,
            }));
          }
        } else if (!targetSegment && dragState.targetSegment) {
          // Clear target when not over any segment
          setDragState((prev) => ({
            ...prev,
            targetSegment: null,
            currentPosition: position,
          }));
        } else {
          // Just update position if target hasn't changed
          setDragState((prev) => ({
            ...prev,
            currentPosition: position,
          }));
        }
      }
    },
    [dragState, canvasRef],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedSegment) return;

      if (dragState.isDragging) {
        // Find target segment at drop position
        const targetSegment = getSegmentFromPosition(e.clientX, e.clientY);

        if (targetSegment && targetSegment !== dragState.draggedSegment) {
          // Perform segment reorder
          onSegmentReorder(dragState.draggedSegment.keys, targetSegment.keys);
        }
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        isClicking: false,
        draggedSegment: null,
        targetSegment: null,
        startPosition: null,
        currentPosition: null,
      });

      hasDraggedRef.current = false;
    },
    [dragState, getSegmentFromPosition, onSegmentReorder],
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
    draggedSegment: dragState.draggedSegment,
    targetSegment: dragState.targetSegment,
    currentPosition: dragState.currentPosition,
  };
}
