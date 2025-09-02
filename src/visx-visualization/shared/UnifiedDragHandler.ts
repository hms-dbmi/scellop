import { useCallback, useEffect, useRef, useState } from "react";
import { ScaleBand } from "../../contexts/types";

// Common drag state interface
export interface DragState<T = unknown> {
  isDragging: boolean;
  isClicking: boolean;
  draggedItem: T | null;
  targetItem?: T | null; // Optional target item for enhanced drag feedback
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

// Position resolver interface - handles converting mouse coordinates to draggable items
export interface PositionResolver<T> {
  getItemFromPosition: (x: number, y: number) => T | null;
}

// Scale-based position resolver for 1D scales
export class ScalePositionResolver implements PositionResolver<string> {
  constructor(
    private scale: ScaleBand<string>,
    private axis: "x" | "y",
    private scrollOffset: number = 0,
    private isZoomed: boolean = false,
  ) {}

  getItemFromPosition(x: number, y: number): string | null {
    let position = this.axis === "x" ? x : y;

    // Adjust for scroll offset when zoomed
    if (this.isZoomed) {
      position += this.scrollOffset;
    }

    // Use the scale's lookup method if available
    if (this.scale.lookup) {
      return this.scale.lookup(position);
    }

    // Fallback: Manual lookup for simple uniform scales
    const domain = this.scale.domain();
    const bandwidth = this.scale.bandwidth();
    const [rangeStart, rangeEnd] = this.scale.range();

    // Handle inverted scales
    let adjustedPosition = position;
    if (rangeStart > rangeEnd) {
      adjustedPosition = rangeStart - position;
    }

    const index = Math.floor(adjustedPosition / bandwidth);
    return domain[index] || null;
  }
}

// 2D scale position resolver for heatmap cells
export class HeatmapPositionResolver
  implements PositionResolver<{ row: string; column: string }>
{
  constructor(
    private xScale: ScaleBand<string>,
    private yScale: ScaleBand<string>,
    private xScrollOffset: number = 0,
    private yScrollOffset: number = 0,
    private xZoomed: boolean = false,
    private yZoomed: boolean = false,
  ) {}

  getItemFromPosition(
    x: number,
    y: number,
  ): { row: string; column: string } | null {
    // Adjust for scroll offsets when zoomed
    const adjustedX = this.xZoomed ? x + this.xScrollOffset : x;
    const adjustedY = this.yZoomed ? y + this.yScrollOffset : y;

    const row = this.yScale.lookup(adjustedY);
    const column = this.xScale.lookup(adjustedX);
    return row && column ? { row, column } : null;
  }
}

// Custom position resolver for arbitrary items (like metadata bars)
export class CustomPositionResolver<T> implements PositionResolver<T> {
  constructor(private resolver: (x: number, y: number) => T | null) {}

  getItemFromPosition(x: number, y: number): T | null {
    return this.resolver(x, y);
  }
}

// Metadata bar segment interface (moved from MetadataValueBarDragHandler)
export interface BarSegment {
  value: string | number;
  height: number;
  width: number;
  color: string;
  x: number;
  y: number;
  keys: string[];
}

// Metadata bar position resolver
export class MetadataBarPositionResolver
  implements PositionResolver<BarSegment>
{
  constructor(
    private bars: BarSegment[],
    private scrollOffset: number = 0,
    private isZoomed: boolean = false,
    private axis: "X" | "Y" = "X",
  ) {}

  getItemFromPosition(x: number, y: number): BarSegment | null {
    // x and y are already canvas-relative coordinates from the unified drag handler
    // Adjust for scroll offset
    const adjustedX =
      this.axis === "X" && this.isZoomed ? x + this.scrollOffset : x;
    const adjustedY =
      this.axis === "Y" && this.isZoomed ? y + this.scrollOffset : y;

    // Find segment at position
    for (const bar of this.bars) {
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
  }
}

// Main drag handler options
export interface UnifiedDragHandlerOptions<T> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  positionResolver: PositionResolver<T>;
  onReorder: (draggedItem: T, targetItem: T) => void;
  onDragMove?: (draggedItem: T, targetItem: T) => void;
  disabled?: boolean;
  dragThreshold?: number; // pixels to move before starting drag
  timeThreshold?: number; // milliseconds to wait before starting drag
  throttleMs?: number; // throttle onDragMove calls
  itemComparator?: (a: T, b: T) => boolean; // custom equality check
}

const defaultItemComparator = <T>(a: T, b: T): boolean => {
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return a === b;
};

export function useUnifiedDragHandler<T>({
  canvasRef,
  positionResolver,
  onReorder,
  onDragMove,
  disabled = false,
  dragThreshold = 5,
  timeThreshold = 100,
  throttleMs = 16, // ~60fps
  itemComparator = defaultItemComparator,
}: UnifiedDragHandlerOptions<T>) {
  const [dragState, setDragState] = useState<DragState<T>>({
    isDragging: false,
    isClicking: false,
    draggedItem: null,
    targetItem: null,
    startPosition: null,
    currentPosition: null,
  });

  const dragStartTimeRef = useRef<number>(0);
  const hasDraggedRef = useRef(false);
  const lastTargetItemRef = useRef<T | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

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

      const item = positionResolver.getItemFromPosition(position.x, position.y);
      if (!item) return;

      dragStartTimeRef.current = Date.now();
      lastUpdateTimeRef.current = 0;
      hasDraggedRef.current = false;

      setDragState({
        isDragging: false,
        isClicking: true,
        draggedItem: item,
        startPosition: position,
        currentPosition: position,
      });

      // Prevent default to avoid text selection
      e.preventDefault();
    },
    [disabled, getRelativePosition, positionResolver],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedItem || !dragState.startPosition) return;

      const position = getRelativePosition(e);
      if (!position) return;

      // Calculate distance moved
      const dx = position.x - dragState.startPosition.x;
      const dy = position.y - dragState.startPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Start dragging if moved enough distance and enough time has passed
      const timeElapsed = Date.now() - dragStartTimeRef.current;
      const shouldStartDrag =
        distance > dragThreshold && timeElapsed > timeThreshold;

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

        if (timeSinceLastUpdate < throttleMs) {
          // Skip update if within throttle window
          return;
        }

        lastUpdateTimeRef.current = now;

        // Update current position during drag
        setDragState((prev) => ({
          ...prev,
          currentPosition: position,
        }));

        // Update target item for visual feedback
        const targetItem = positionResolver.getItemFromPosition(
          position.x,
          position.y,
        );

        // Only update target if it's different from dragged item
        const newTargetItem =
          targetItem && !itemComparator(targetItem, dragState.draggedItem)
            ? targetItem
            : null;

        // Update target item in state if it has changed
        if (
          !dragState.targetItem ||
          !newTargetItem ||
          !itemComparator(dragState.targetItem, newTargetItem)
        ) {
          setDragState((prev) => ({
            ...prev,
            targetItem: newTargetItem,
          }));
        }

        // Call onDragMove if target item has changed
        if (
          onDragMove &&
          targetItem &&
          !itemComparator(targetItem, dragState.draggedItem)
        ) {
          const lastTarget = lastTargetItemRef.current;
          if (!lastTarget || !itemComparator(lastTarget, targetItem)) {
            lastTargetItemRef.current = targetItem;
            onDragMove(dragState.draggedItem, targetItem);
          }
        }
      }
    },
    [
      dragState,
      getRelativePosition,
      onDragMove,
      positionResolver,
      dragThreshold,
      timeThreshold,
      throttleMs,
      itemComparator,
    ],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragState.draggedItem) return;

      const position = getRelativePosition(e);

      if (dragState.isDragging && position) {
        // Handle drop - only call onReorder if we haven't been calling onDragMove
        if (!onDragMove) {
          const targetItem = positionResolver.getItemFromPosition(
            position.x,
            position.y,
          );
          if (
            targetItem &&
            !itemComparator(targetItem, dragState.draggedItem)
          ) {
            onReorder(dragState.draggedItem, targetItem);
          }
        }
      }

      // Reset drag state and references
      setDragState({
        isDragging: false,
        isClicking: false,
        draggedItem: null,
        targetItem: null,
        startPosition: null,
        currentPosition: null,
      });

      lastTargetItemRef.current = null;
      hasDraggedRef.current = false;
    },
    [
      dragState,
      getRelativePosition,
      positionResolver,
      onReorder,
      onDragMove,
      itemComparator,
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
    draggedItem: dragState.draggedItem,
    targetItem: dragState.targetItem,
    currentPosition: dragState.currentPosition,
    dragState, // Expose full state for backwards compatibility
  };
}

// Convenience hooks for specific use cases
export function useBarsDragHandler({
  canvasRef,
  scale,
  orientation,
  onReorder,
  onDragMove,
  disabled = false,
  scrollOffset = 0,
  isZoomed = false,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: ScaleBand<string>;
  orientation: "rows" | "columns";
  onReorder: (draggedValue: string, targetValue: string) => void;
  onDragMove?: (draggedValue: string, targetValue: string) => void;
  disabled?: boolean;
  scrollOffset?: number;
  isZoomed?: boolean;
}) {
  const positionResolver = new ScalePositionResolver(
    scale,
    orientation === "rows" ? "y" : "x",
    scrollOffset,
    isZoomed,
  );

  const result = useUnifiedDragHandler({
    canvasRef,
    positionResolver,
    onReorder,
    onDragMove,
    disabled,
  });

  return {
    isClicking: result.isClicking,
    isDragging: result.isDragging,
    draggedValue: result.draggedItem,
    currentPosition: result.currentPosition,
  };
}

export function useViolinDragHandler({
  canvasRef,
  scale,
  side,
  onReorder,
  onDragMove,
  scrollOffset = 0,
  disabled = false,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: ScaleBand<string>;
  side: "top" | "left";
  onReorder: (draggedValue: string, targetValue: string) => void;
  onDragMove?: (draggedValue: string, targetValue: string) => void;
  disabled?: boolean;
  scrollOffset?: number;
}) {
  const positionResolver = new ScalePositionResolver(
    scale,
    side === "top" ? "x" : "y",
    scrollOffset,
    false, // Violins don't use zoom currently
  );

  const result = useUnifiedDragHandler({
    canvasRef,
    positionResolver,
    onReorder,
    onDragMove,
    disabled,
  });

  return {
    isClicking: result.isClicking,
    isDragging: result.isDragging,
    draggedValue: result.draggedItem,
    currentPosition: result.currentPosition,
  };
}

export function useCanvasDragHandler({
  canvasRef,
  xScale,
  yScale,
  onReorder,
  onDragMove,
  disabled = false,
  xScrollOffset = 0,
  yScrollOffset = 0,
  xZoomed = false,
  yZoomed = false,
}: {
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
  xScrollOffset?: number;
  yScrollOffset?: number;
  xZoomed?: boolean;
  yZoomed?: boolean;
}) {
  const positionResolver = new HeatmapPositionResolver(
    xScale,
    yScale,
    xScrollOffset,
    yScrollOffset,
    xZoomed,
    yZoomed,
  );

  const cellComparator = (
    a: { row: string; column: string },
    b: { row: string; column: string },
  ): boolean => {
    return a.row === b.row && a.column === b.column;
  };

  const result = useUnifiedDragHandler({
    canvasRef,
    positionResolver,
    onReorder,
    onDragMove,
    disabled,
    itemComparator: cellComparator,
  });

  return {
    isClicking: result.isClicking,
    isDragging: result.isDragging,
    draggedCell: result.draggedItem,
    currentPosition: result.currentPosition,
    dragState: result.dragState, // For backwards compatibility
  };
}

export function useMetadataValueBarDragHandler({
  canvasRef,
  bars,
  axis,
  onSegmentReorder,
  disabled = false,
  scrollOffset = 0,
  isZoomed = false,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  bars: BarSegment[];
  axis: "X" | "Y";
  onSegmentReorder: (draggedKeys: string[], targetKeys: string[]) => void;
  disabled?: boolean;
  scrollOffset?: number;
  isZoomed?: boolean;
}) {
  const positionResolver = new MetadataBarPositionResolver(
    bars,
    scrollOffset,
    isZoomed,
    axis,
  );

  const segmentComparator = (a: BarSegment, b: BarSegment): boolean => {
    return (
      a.value === b.value &&
      a.x === b.x &&
      a.y === b.y &&
      a.width === b.width &&
      a.height === b.height
    );
  };

  const handleReorder = (
    draggedSegment: BarSegment,
    targetSegment: BarSegment,
  ) => {
    onSegmentReorder(draggedSegment.keys, targetSegment.keys);
  };

  const result = useUnifiedDragHandler({
    canvasRef,
    positionResolver,
    onReorder: handleReorder,
    disabled,
    itemComparator: segmentComparator,
    throttleMs: 16, // 60fps for metadata bars for smoother interaction
  });

  return {
    isClicking: result.isClicking,
    isDragging: result.isDragging,
    draggedSegment: result.draggedItem,
    targetSegment: result.targetItem,
    currentPosition: result.currentPosition,
  };
}
