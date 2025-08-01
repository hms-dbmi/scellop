import React, { PropsWithChildren, useMemo, useRef } from "react";
import { useXScale, useYScale } from "../../contexts/ScaleContext";

import { useSelectedDimension } from "../../contexts/SelectedDimensionContext";

import {
  CollisionDetection,
  DndContext,
  DragOverEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEventCallback } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useParentRef } from "../../contexts/ContainerRefContext";
import {
  useColumnMetadataKeys,
  useDataHistory,
  useDataMap,
  useFractionDataMap,
  useMetadataLookup,
  useRowMetadataKeys,
} from "../../contexts/DataContext";
import {
  useDimensions,
  useHeatmapDimensions,
} from "../../contexts/DimensionsContext";
import { useTooltipFields } from "../../contexts/MetadataConfigContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import { ScaleBand } from "../../contexts/types";

interface DragOverlayContainerProps extends PropsWithChildren {
  items: string[];
  setItems: (prevState: string[]) => void;
  resetSort: () => void;
}
const customCollisionDetectionAlgorithm: CollisionDetection = (args) => {
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args);

  // Collision detection algorithms return an array of collisions
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // If there are no collisions with the pointer, return rectangle intersections
  return rectIntersection(args);
};

const indicatorProps = (
  x: ScaleBand<string>,
  y: ScaleBand<string>,
  width: number,
  height: number,
) =>
  ({
    X: {
      width: x.bandwidth() ?? 0,
      height,
      left: (item: string) => x(item) ?? 0,
      top: () => 0,
    } as const,
    Y: {
      width,
      height: (item: string) => y.bandwidth(item) ?? 0,
      left: () => 0,
      top: (item: string) => y(item) ?? 0,
    } as const,
  }) as const;

/**
 * Wrapper for the heatmap which allows for dragging and dropping of rows or columns.
 * @param props.items The items to be sorted.
 * @param props.setItems Setter for the items.
 * @returns
 */
function DragOverlayContainer({
  children,
  items,
  setItems,
}: DragOverlayContainerProps) {
  const { selectedDimension } = useSelectedDimension();

  const dataHistory = useDataHistory();

  const hasPastStates = dataHistory.pastStates.length > 0;

  const { scale: x } = useXScale();
  const { scale: y } = useYScale();
  const { width, height } = useHeatmapDimensions();

  const strategy = useMemo(() => {
    return selectedDimension === "X"
      ? verticalListSortingStrategy
      : horizontalListSortingStrategy;
  }, [selectedDimension]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const initialItemOrder = useRef<string[]>(items);
  const lastOver = useRef<string | number | null>(null);

  const startDrag = useEventCallback(() => {
    initialItemOrder.current = items;
    lastOver.current = null;

    if (hasPastStates) {
      dataHistory.pause();
    }
  });

  const cancelDrag = useEventCallback(() => {
    setItems(initialItemOrder.current);
    dataHistory.resume();
  });

  const handleDrag = useEventCallback(({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id || lastOver.current === over.id) {
      if (over) lastOver.current = over.id;
      return;
    }
    lastOver.current = over.id;
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);

    if (hasPastStates) {
      dataHistory.pause();
    }
    setItems(arrayMove(items, oldIndex, newIndex));
  });

  const handleDragEnd = useEventCallback(() => {
    dataHistory.resume();
    setItems(items);
  });

  if (items.length === 0) {
    return children;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm}
      onDragStart={startDrag}
      onDragCancel={cancelDrag}
      onDragMove={handleDrag}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.BeforeDragging,
        },
      }}
    >
      <SortableContext items={items} strategy={strategy}>
        {items.map((item) => (
          <DragIndicator
            key={item}
            item={item}
            {...indicatorProps(x, y, width, height)[selectedDimension]}
          />
        ))}
        {children}
      </SortableContext>
    </DndContext>
  );
}

function DragIndicator({
  item,
  width: itemWidth,
  height: itemHeight,
  left,
  top,
}: {
  item: string;
  width: number;
  height: number | ((item: string) => number);
  left: (item: string) => number;
  top: (item: string) => number;
}) {
  const { selectedDimension } = useSelectedDimension();
  const { scale: x } = useXScale();
  const { scale: y } = useYScale();

  const { columnSizes, rowSizes } = useDimensions();
  const dataMap = useDataMap();
  const normalization = useNormalization((store) => store.normalization);
  const normalizedDataMap = useFractionDataMap(normalization);

  const xOffset = columnSizes[0];
  const yOffset = rowSizes[0];

  const theme = useTheme();
  const rowLabel = useRowConfig((store) => store.label);
  const columnLabel = useColumnConfig((store) => store.label);
  const { height } = useHeatmapDimensions();
  const rowMetadataKeys = useRowMetadataKeys();
  const columnMetadataKeys = useColumnMetadataKeys();
  const rowTooltipFields = useTooltipFields(rowMetadataKeys);
  const columnTooltipFields = useTooltipFields(columnMetadataKeys);

  const lookupMetadata = useMetadataLookup();

  const strategy =
    selectedDimension === "X"
      ? verticalListSortingStrategy
      : horizontalListSortingStrategy;
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: item,
    strategy,
  });
  const parentRef = useParentRef();
  const { openTooltip, closeTooltip } = useSetTooltipData();

  const onMouseMove = useEventCallback((e: React.MouseEvent) => {
    const visualizationBounds = parentRef.current?.getBoundingClientRect();
    if (!visualizationBounds) {
      return;
    }
    // e.clientX = mouse position relative to the viewport
    // xOffset = position of the heatmap relative to the bounds of the cellpop container
    // visualizationBounds.left = position of the cellpop container relative to the viewport
    const xValue = e.clientX - xOffset - visualizationBounds.left;

    // y position is inverted to match the y scale
    const visualizationTotalHeight = yOffset + height + visualizationBounds.top;
    const yMousePosition = e.clientY;
    const yValue = height - (visualizationTotalHeight - yMousePosition);

    const columnKey = x.lookup(xValue);
    const rowKey = y.lookup(yValue);

    if (!rowKey || !columnKey) {
      return;
    }

    const key = `${rowKey}-${columnKey}` as keyof typeof dataMap;

    const normalizationInfo =
      normalization !== "None"
        ? {
            [`Percentage of total cells in ${normalization}`]:
              (normalizedDataMap[key] * 100).toFixed(2) + "%",
          }
        : {};

    const columnMetadata = lookupMetadata(
      columnKey,
      "cols",
      columnTooltipFields,
    );
    const rowMetadata = lookupMetadata(rowKey, "rows", rowTooltipFields);

    openTooltip(
      {
        title: `${rowKey} - ${columnKey}`,
        data: {
          "Cell Count": dataMap[`${rowKey}-${columnKey}`],
          [rowLabel]: rowKey,
          [columnLabel]: columnKey,
          ...normalizationInfo,
          ...columnMetadata,
          ...rowMetadata,
        },
      },
      e.clientX,
      e.clientY,
    );
  });

  return (
    <div
      key={item}
      style={{
        width: itemWidth,
        height: itemHeight instanceof Function ? itemHeight(item) : itemHeight,
        position: "absolute",
        zIndex: 1,
        left: left(item),
        top: top(item),
        outline: isDragging
          ? `3px solid ${theme.palette.text.primary}`
          : "none",
      }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseMove={onMouseMove}
      onMouseOut={closeTooltip}
    />
  );
}

export default DragOverlayContainer;
