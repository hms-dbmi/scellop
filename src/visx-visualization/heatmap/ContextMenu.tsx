import { useEventCallback } from "@mui/material";
import { Portal, Sub as SubMenu } from "@radix-ui/react-context-menu";
import React from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import {
  useColumnSorts,
  useData,
  useMoveColumnToEnd,
  useMoveColumnToStart,
  useMoveRowToEnd,
  useMoveRowToStart,
  useRowSorts,
} from "../../contexts/DataContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import {
  useSetTooltipData,
  useTooltipData,
} from "../../contexts/TooltipDataContext";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  RightSlot,
} from "./ContextMenu.styles";

const HideRow = () => {
  const { tooltipData } = useTooltipData();
  const rowLabel = useRowConfig((store) => store.label);
  const { removeRow } = useData();
  const { deselectValue, selectedValues } = useSelectedValues();
  const trackEvent = useTrackEvent();

  const onClick = useEventCallback(() => {
    const rowValue = tooltipData?.data[rowLabel] as string;
    if (selectedValues.has(tooltipData?.data[rowLabel] as string)) {
      deselectValue(tooltipData?.data[rowLabel] as string);
      trackEvent(`Collapse ${rowLabel}`, rowValue);
    }
    trackEvent(`Hide ${rowLabel}`, rowValue);
    removeRow(rowValue);
  });

  if (!tooltipData?.data) {
    return null;
  }

  if (tooltipData.data[rowLabel]) {
    const rowValue = tooltipData.data[rowLabel] as string;
    return (
      <ContextMenuItem onClick={onClick}>
        Hide {rowLabel} ({rowValue})
      </ContextMenuItem>
    );
  }
};

const HideColumn = () => {
  const { tooltipData } = useTooltipData();
  const columnLabel = useColumnConfig((store) => store.label);
  const { removeColumn } = useData();
  const trackEvent = useTrackEvent();

  if (!tooltipData?.data) {
    return null;
  }

  const columnValue = tooltipData?.data?.[columnLabel] as string;

  if (columnValue) {
    const onClick = () => {
      removeColumn(columnValue);
      trackEvent(`Hide ${columnLabel}`, columnValue);
    };
    return (
      <ContextMenuItem onClick={onClick}>
        Hide {columnLabel} ({columnValue})
      </ContextMenuItem>
    );
  }
  return null;
};

const RestoreHiddenRows = () => {
  const { removedRows, resetRemovedRows } = useData();
  const rowLabel = useRowConfig((store) => store.label);

  const trackEvent = useTrackEvent();

  const onClick = useEventCallback(() => {
    resetRemovedRows();
    trackEvent(`Restore Hidden ${rowLabel}s`, "");
  });

  if (!removedRows.size) {
    return null;
  }

  return (
    <ContextMenuItem onClick={onClick}>
      Restore Hidden {rowLabel}s
    </ContextMenuItem>
  );
};

const RestoreHiddenColumns = () => {
  const { removedColumns, resetRemovedColumns } = useData();
  const columnLabel = useColumnConfig((store) => store.label);
  const trackEvent = useTrackEvent();

  const onClick = useEventCallback(() => {
    resetRemovedColumns();
    trackEvent(`Restore Hidden ${columnLabel}s`, "");
  });

  if (!removedColumns.size) {
    return null;
  }

  return (
    <ContextMenuItem onClick={onClick}>
      Restore Hidden {columnLabel}s
    </ContextMenuItem>
  );
};

const ExpandRow = () => {
  const { tooltipData } = useTooltipData();
  const label = useRowConfig((store) => store.label);
  const expandRow = useSelectedValues((s) => s.toggleValue);
  const expandedRows = useSelectedValues((s) => s.selectedValues);
  const { closeContextMenu } = useSetTooltipData();

  const trackEvent = useTrackEvent();
  const rowValue = tooltipData?.data?.[label] as string;

  const onClick = useEventCallback(() => {
    expandRow(rowValue);
    closeContextMenu();
    trackEvent(`Expand ${label}`, rowValue);
  });

  if (!rowValue || expandedRows.has(rowValue)) {
    return null;
  }

  return <ContextMenuItem onClick={onClick}>Expand {label}</ContextMenuItem>;
};

const CollapseRows = () => {
  const expandedRows = useSelectedValues((s) => s.selectedValues);
  const reset = useSelectedValues((s) => s.reset);
  const trackEvent = useTrackEvent();
  const label = useRowConfig((store) => store.label);

  const onClick = useEventCallback(() => {
    reset();
    trackEvent(`Collapse All ${label}s`, "");
  });

  if (expandedRows.size === 0) {
    return null;
  }
  return <ContextMenuItem onClick={onClick}>Clear Selection</ContextMenuItem>;
};

const MoveToStart = ({ dimension }: { dimension: "row" | "column" }) => {
  const moveRowToStart = useMoveRowToStart();
  const moveColumnToStart = useMoveColumnToStart();
  const { tooltipData } = useTooltipData();

  const rowLabel = useRowConfig((store) => store.label);
  const columnLabel = useColumnConfig((store) => store.label);

  const move = dimension === "row" ? moveRowToStart : moveColumnToStart;
  const label = dimension === "row" ? rowLabel : columnLabel;
  const moveLabel = dimension === "row" ? "Top" : "Left";

  const value = tooltipData?.data?.[label] as string;

  const trackEvent = useTrackEvent();

  const onClick = useEventCallback(() => {
    move(value);
    trackEvent(`Move ${label} to ${moveLabel}`, value);
  });

  if (!value) {
    return null;
  }

  return (
    <ContextMenuItem onClick={onClick}>Move to {moveLabel}</ContextMenuItem>
  );
};

const MoveToEnd = ({ dimension }: { dimension: "row" | "column" }) => {
  const moveRowToEnd = useMoveRowToEnd();
  const moveColumnToEnd = useMoveColumnToEnd();

  const { tooltipData } = useTooltipData();
  const rowLabel = useRowConfig((store) => store.label);

  const columnLabel = useColumnConfig((store) => store.label);

  const move = dimension === "row" ? moveRowToEnd : moveColumnToEnd;
  const label = dimension === "row" ? rowLabel : columnLabel;
  const moveLabel = dimension === "row" ? "Bottom" : "Right";

  const value = tooltipData?.data?.[label] as string;

  const trackEvent = useTrackEvent();

  const onClick = useEventCallback(() => {
    move(value);
    trackEvent(`Move ${label} to ${moveLabel}`, value);
  });

  if (!value) {
    return null;
  }

  return (
    <ContextMenuItem onClick={onClick}>Move to {moveLabel}</ContextMenuItem>
  );
};

const SortDimension = ({ dimension }: { dimension: "row" | "column" }) => {
  const { sortColumns, sortRows, colSortOrder, rowSortOrder } = useData((s) => {
    return {
      sortColumns: s.setColumnSortOrder,
      sortRows: s.setRowSortOrder,
      colSortOrder: s.columnSortOrder,
      rowSortOrder: s.rowSortOrder,
    };
  });
  const rowSortOrders = useRowSorts();
  const colSortOrders = useColumnSorts();

  const sort = dimension === "row" ? sortRows : sortColumns;
  const sortOrders = dimension === "row" ? rowSortOrders : colSortOrders;
  const { label: rowLabel } = useRowConfig();
  const columnLabel = useColumnConfig((store) => store.label);
  const label = dimension === "row" ? rowLabel : columnLabel;
  const currentSortOrder = dimension === "row" ? rowSortOrder : colSortOrder;

  const trackEvent = useTrackEvent();

  return (
    <SubMenu>
      <ContextMenuSubTrigger>
        Sort {label}s <RightSlot>&rsaquo;</RightSlot>
      </ContextMenuSubTrigger>
      <Portal>
        <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
          {sortOrders.map((order) => (
            <ContextMenuItem
              key={order.key + order.direction}
              onClick={() => {
                sort([order]);
                trackEvent(`Sort ${label}s`, `${order.key} ${order.direction}`);
              }}
            >
              {order.key.charAt(0).toUpperCase()}
              {order.key.slice(1).replace("_", " ")}{" "}
              {order.direction === "asc" ? "Ascending" : "Descending"}
              {currentSortOrder.includes(order) && <RightSlot>✓</RightSlot>}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </Portal>
    </SubMenu>
  );
};

const ContextMenuComponent = () => {
  const { label: rowLabel } = useRowConfig();
  const columnLabel = useColumnConfig((store) => store.label);

  const { tooltipData, contextMenuOpen } = useTooltipData();
  if (!tooltipData || !contextMenuOpen) {
    return null;
  }

  const hasColumn = Object.keys(tooltipData.data).some((key) =>
    key.includes(columnLabel),
  );

  const hasRow = Object.keys(tooltipData.data).some((key) =>
    key.includes(rowLabel),
  );

  return (
    <Portal>
      <ContextMenuContent>
        <ContextMenuLabel>Global Actions</ContextMenuLabel>
        <RestoreHiddenRows />
        <SortDimension dimension="row" />
        <RestoreHiddenColumns />
        <SortDimension dimension="column" />
        {hasRow && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel>Rows ({rowLabel}s)</ContextMenuLabel>
            <HideRow />
            <MoveToStart dimension="row" />
            <MoveToEnd dimension="row" />
            <ExpandRow />
            <CollapseRows />
          </>
        )}
        {hasColumn && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel>Columns ({columnLabel}s)</ContextMenuLabel>
            <HideColumn />
            <MoveToStart dimension="column" />
            <MoveToEnd dimension="column" />
          </>
        )}
      </ContextMenuContent>
    </Portal>
  );
};

export default ContextMenuComponent;
