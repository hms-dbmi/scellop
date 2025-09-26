import {
  ArrowDownward,
  ArrowUpward,
  Close,
  Restore,
} from "@mui/icons-material";
import { Box, Stack, Typography, useEventCallback } from "@mui/material";
import {
  CheckboxItem,
  ItemIndicator,
  Portal,
  Sub as SubMenu,
} from "@radix-ui/react-context-menu";
import React from "react";
import {
  useColumnConfig,
  useRowConfig,
  useSwapAxisConfigs,
} from "../../contexts/AxisConfigContext";
import { useSetTheme } from "../../contexts/CellPopThemeContext";
import { useColorScale } from "../../contexts/ColorScaleContext";
import {
  useAllColumnSubFilters,
  useAllRowSubFilters,
  useColumnSortKeys,
  useData,
  useHasBeenTransposed,
  useMetadataKeys,
  useMoveColumnToEnd,
  useMoveColumnToStart,
  useMoveRowToEnd,
  useMoveRowToStart,
  useRowSortKeys,
  useTranspose,
  useTransposeToggle,
} from "../../contexts/DataContext";
import {
  useNormalizationControlIsDisabled,
  useThemeControlIsDisabled,
} from "../../contexts/DisabledControlProvider";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import {
  useRestorePreviousTopGraphType,
  useSetTopGraphTypeForTraditional,
} from "../../contexts/IndividualGraphTypeContext";
import { useGetFieldDisplayName } from "../../contexts/MetadataConfigContext";
import { useNormalization } from "../../contexts/NormalizationContext";
import { useXScale, useYScale } from "../../contexts/ScaleContext";
import {
  useSetTooltipData,
  useTooltipData,
} from "../../contexts/TooltipDataContext";
import { useViewType } from "../../contexts/ViewTypeContext";
import { HEATMAP_THEMES_LIST, HeatmapTheme } from "../../utils/heatmap-themes";
import { NORMALIZATIONS } from "../../utils/normalizations";
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

const HideZeroedRows = () => {
  const { removeZeroedValuesFromColumn } = useData();
  const { tooltipData } = useTooltipData();
  const pluralRowLabel = useRowConfig((store) => store.pluralLabel);
  const columnLabel = useColumnConfig((store) => store.label);

  const trackEvent = useTrackEvent();
  const columnValue = tooltipData?.data?.[columnLabel] as string;

  const onClick = useEventCallback(() => {
    trackEvent(
      `Hide Zeroed ${pluralRowLabel} from ${columnLabel}`,
      columnValue,
    );
    removeZeroedValuesFromColumn(columnValue);
  });

  if (columnValue) {
    return (
      <ContextMenuItem onClick={onClick}>
        Hide {pluralRowLabel} with no data for {columnLabel} {columnValue}
      </ContextMenuItem>
    );
  }
};

const HideZeroedColumns = () => {
  const { removeZeroedValuesFromRow } = useData();
  const { tooltipData } = useTooltipData();
  const rowLabel = useRowConfig((store) => store.label);
  const pluralColumnLabel = useColumnConfig((store) => store.pluralLabel);
  const trackEvent = useTrackEvent();
  const rowValue = tooltipData?.data?.[rowLabel] as string;

  const onClick = useEventCallback(() => {
    trackEvent(`Hide Zeroed ${pluralColumnLabel} from ${rowLabel}`, rowValue);
    removeZeroedValuesFromRow(rowValue);
  });

  if (rowValue) {
    return (
      <ContextMenuItem onClick={onClick}>
        Hide {pluralColumnLabel} with no data for {rowLabel} {rowValue}
      </ContextMenuItem>
    );
  }
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
const ResetSorts = () => {
  const { setRowSortOrder, setColumnSortOrder, rowSortOrder, columnSortOrder } =
    useData((s) => ({
      setRowSortOrder: s.setRowSortOrder,
      setColumnSortOrder: s.setColumnSortOrder,
      rowSortOrder: s.rowSortOrder,
      columnSortOrder: s.columnSortOrder,
    }));

  const trackEvent = useTrackEvent();

  const handleClick = useEventCallback(() => {
    setRowSortOrder([]);
    setColumnSortOrder([]);
    trackEvent("Reset Sorts", "");
  });

  if (!rowSortOrder.length && !columnSortOrder.length) {
    return null;
  }

  return <ContextMenuItem onClick={handleClick}>Reset Sorts</ContextMenuItem>;
};

const ResetFilters = () => {
  const { setRowFilters, setColumnFilters, rowFilters, columnFilters } =
    useData((s) => ({
      setRowFilters: s.setRowFilters,
      setColumnFilters: s.setColumnFilters,
      rowFilters: s.rowFilters,
      columnFilters: s.columnFilters,
    }));

  const trackEvent = useTrackEvent();

  const handleClick = useEventCallback(() => {
    setRowFilters([]);
    setColumnFilters([]);
    trackEvent("Reset Filters", "");
  });

  if (!rowFilters.length && !columnFilters.length) {
    return null;
  }

  return <ContextMenuItem onClick={handleClick}>Reset Filters</ContextMenuItem>;
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

const MoveToStart = ({ dimension }: { dimension: "Row" | "Column" }) => {
  const moveRowToStart = useMoveRowToStart();
  const moveColumnToStart = useMoveColumnToStart();
  const { tooltipData } = useTooltipData();

  const rowLabel = useRowConfig((store) => store.label);
  const columnLabel = useColumnConfig((store) => store.label);

  const move = dimension === "Row" ? moveRowToStart : moveColumnToStart;
  const label = dimension === "Row" ? rowLabel : columnLabel;
  const moveLabel = dimension === "Row" ? "Top" : "Left";

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

const MoveToEnd = ({ dimension }: { dimension: "Row" | "Column" }) => {
  const moveRowToEnd = useMoveRowToEnd();
  const moveColumnToEnd = useMoveColumnToEnd();

  const { tooltipData } = useTooltipData();
  const rowLabel = useRowConfig((store) => store.label);

  const columnLabel = useColumnConfig((store) => store.label);

  const move = dimension === "Row" ? moveRowToEnd : moveColumnToEnd;
  const label = dimension === "Row" ? rowLabel : columnLabel;
  const moveLabel = dimension === "Row" ? "Bottom" : "Right";

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

const SortDimension = ({ dimension }: { dimension: "Row" | "Column" }) => {
  const {
    sortColumns,
    sortRows,
    colSortOrder,
    rowSortOrder,
    rowSortInvalidated,
    columnSortInvalidated,
    revalidateRowSort,
    revalidateColumnSort,
  } = useData((s) => {
    return {
      sortColumns: s.setColumnSortOrder,
      sortRows: s.setRowSortOrder,
      colSortOrder: s.columnSortOrder,
      rowSortOrder: s.rowSortOrder,
      rowSortInvalidated: s.rowSortInvalidated,
      columnSortInvalidated: s.columnSortInvalidated,
      revalidateRowSort: s.revalidateRowSort,
      revalidateColumnSort: s.revalidateColumnSort,
    };
  });
  const rowSortOrders = useRowSortKeys();
  const colSortOrders = useColumnSortKeys();

  const sort = dimension === "Row" ? sortRows : sortColumns;
  const sortOrders = dimension === "Row" ? rowSortOrders : colSortOrders;
  const { label: rowLabel } = useRowConfig();
  const columnLabel = useColumnConfig((store) => store.label);
  const label = dimension === "Row" ? rowLabel : columnLabel;
  const currentSortOrder = dimension === "Row" ? rowSortOrder : colSortOrder;
  const isInvalidated =
    dimension === "Row" ? rowSortInvalidated : columnSortInvalidated;
  const revalidateSort =
    dimension === "Row" ? revalidateRowSort : revalidateColumnSort;

  const trackEvent = useTrackEvent();

  const getFieldDisplayName = useGetFieldDisplayName();

  const handleSelect = (order: string, direction: "asc" | "desc") => {
    const sortExists = currentSortOrder.some(
      (s) => s.key === order && s.direction === direction,
    );
    const sortOppositeExists = currentSortOrder.some(
      (s) => s.key === order && s.direction !== direction,
    );

    if (sortExists) {
      sort(
        currentSortOrder.filter(
          (s) => !(s.key === order && s.direction === direction),
        ),
      );
      trackEvent(`Sort ${label}s`, `Removed ${order} ${direction}`);
    } else if (sortOppositeExists) {
      sort(
        currentSortOrder.map((s) =>
          s.key === order ? { key: order, direction } : s,
        ),
      );
      trackEvent(`Sort ${label}s`, `Changed Direction ${order} ${direction}`);
    } else {
      sort([...currentSortOrder, { key: order, direction }]);
      trackEvent(`Sort ${label}s`, `Added ${order} ${direction}`);
    }
  };

  return (
    <SubMenu>
      <ContextMenuSubTrigger>
        Sort {label}s <RightSlot>&rsaquo;</RightSlot>
      </ContextMenuSubTrigger>
      <Portal>
        <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
          {currentSortOrder.length > 0 && (
            <>
              <ContextMenuLabel>{label} Sort Order</ContextMenuLabel>
              {isInvalidated && (
                <ContextMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    revalidateSort();
                    trackEvent(`Revalidate ${label} Sort`, "");
                  }}
                  style={{
                    opacity: 0.9,
                    cursor: "pointer",
                  }}
                >
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Restore />
                    <Typography>Revalidate Sorts</Typography>
                  </Stack>
                </ContextMenuItem>
              )}
              {currentSortOrder.map((sort, index) => (
                <ContextMenuItem
                  key={`current-sort-${sort.key}-${sort.direction}`}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (isInvalidated) return;
                    const newSortOrder = currentSortOrder.filter(
                      (s) =>
                        !(s.key === sort.key && s.direction === sort.direction),
                    );
                    (dimension === "Row" ? sortRows : sortColumns)(
                      newSortOrder,
                    );
                    trackEvent(
                      `Remove Sort ${label}`,
                      `${sort.key} ${sort.direction}`,
                    );
                  }}
                  style={{
                    opacity: isInvalidated ? 0.5 : 0.8,
                    cursor: isInvalidated ? "default" : "pointer",
                  }}
                >
                  <Stack alignItems="center" direction="row" width="100%">
                    <Box>
                      <Typography display="inline-block">
                        {index + 1}: {getFieldDisplayName(sort.key)}{" "}
                      </Typography>
                    </Box>

                    {sort.direction === "asc" ? (
                      <ArrowUpward />
                    ) : (
                      <ArrowDownward />
                    )}

                    <Box ml="auto">
                      <Close />
                    </Box>
                  </Stack>
                </ContextMenuItem>
              ))}
              <ContextMenuSeparator />
            </>
          )}
          {!isInvalidated &&
            sortOrders.map((order) => (
              <SubMenu key={order}>
                <ContextMenuSubTrigger>
                  {getFieldDisplayName(order)}
                </ContextMenuSubTrigger>
                <Portal>
                  <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
                    {(["asc", "desc"] as const).map((direction) => {
                      const sortIndex = currentSortOrder.findIndex(
                        (s) => s.key === order && s.direction === direction,
                      );
                      const sortOrder = sortIndex >= 0 ? sortIndex + 1 : null;

                      return (
                        <ContextMenuItem
                          key={order + direction}
                          onSelect={(e) => {
                            e.preventDefault();
                            handleSelect(order, direction);
                          }}
                        >
                          <span
                            style={{
                              minWidth: "20px",
                              display: "inline-block",
                            }}
                          >
                            {sortOrder ? `${sortOrder}.` : ""}
                          </span>
                          {direction === "asc" ? "Ascending" : "Descending"}
                        </ContextMenuItem>
                      );
                    })}
                  </ContextMenuSubContent>
                </Portal>
              </SubMenu>
            ))}
        </ContextMenuSubContent>
      </Portal>
    </SubMenu>
  );
};

const useAllSubFilters = (key: string, dimension: "Row" | "Column") => {
  const rows = useAllRowSubFilters(key);
  const columns = useAllColumnSubFilters(key);
  return dimension === "Row" ? rows : columns;
};

const FilterSubMenu = ({
  filter,
  dimension,
  getFieldDisplayName,
  currentFilterValues,
  handleSelect,
}: {
  filter: string;
  dimension: "Row" | "Column";
  getFieldDisplayName: (key: string) => string;
  currentFilterValues: (key: string) => (string | number | boolean)[];
  handleSelect: (filter: string, subfilter: string | number | boolean) => void;
}) => {
  const allSubFilters = useAllSubFilters(filter, dimension);

  return (
    <SubMenu key={filter}>
      <ContextMenuSubTrigger>
        {getFieldDisplayName(filter)}
      </ContextMenuSubTrigger>
      <Portal>
        <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
          {allSubFilters.map((subfilter) => (
            <ContextMenuItem
              key={filter + "-" + subfilter}
              onSelect={(e) => {
                e.preventDefault();
                handleSelect(filter, subfilter);
              }}
            >
              <CheckboxItem
                checked={!currentFilterValues(filter).includes(subfilter)}
              >
                <ItemIndicator>✓</ItemIndicator>
              </CheckboxItem>
              {subfilter}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </Portal>
    </SubMenu>
  );
};

const FilterDimension = ({ dimension }: { dimension: "Row" | "Column" }) => {
  const addFilter = useData((s) =>
    dimension === "Row" ? s.addRowFilter : s.addColumnFilter,
  );
  const removeFilter = useData((s) =>
    dimension === "Row" ? s.removeRowFilter : s.removeColumnFilter,
  );
  const editSubFilters = useData((s) =>
    dimension === "Row" ? s.editRowSubFilters : s.editColumnSubFilters,
  );

  const allFilters = useMetadataKeys(dimension);
  const currentFilters = useData((s) =>
    dimension === "Row" ? s.rowFilters : s.columnFilters,
  );
  const currentFilterKeys = currentFilters.map((f) => f.key);

  const currentFilterValues = (key: string) =>
    currentFilters.find((f) => f.key === key)?.values ?? [];

  const getFieldDisplayName = useGetFieldDisplayName();

  const { label: rowLabel } = useRowConfig();
  const columnLabel = useColumnConfig((store) => store.label);
  const label = dimension === "Row" ? rowLabel : columnLabel;

  const trackEvent = useTrackEvent();

  const handleSelect = (
    filter: string,
    subfilter: string | number | boolean,
  ) => {
    if (!currentFilterKeys.includes(filter)) {
      addFilter(filter);
      editSubFilters(filter, [subfilter]);
      trackEvent(`Filter ${label}s`, `Added ${filter} - ${subfilter}`);
    } else {
      const currValues = currentFilterValues(filter);
      if (currValues.includes(subfilter)) {
        const newValues = currValues.filter((item) => item !== subfilter);
        trackEvent(`Filter ${label}s`, `Removed ${filter} - ${subfilter}`);
        if (newValues.length === 0) {
          removeFilter(filter);
        } else {
          editSubFilters(filter, newValues);
        }
      } else {
        editSubFilters(filter, [...currValues, subfilter]);
        trackEvent(`Filter ${label}s`, `Added ${filter} - ${subfilter}`);
      }
    }
  };

  return (
    <SubMenu>
      <ContextMenuSubTrigger>
        Filter {label}s <RightSlot>&rsaquo;</RightSlot>
      </ContextMenuSubTrigger>
      <Portal>
        <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
          {allFilters.map((filter) => (
            <FilterSubMenu
              key={filter}
              filter={filter}
              dimension={dimension}
              getFieldDisplayName={getFieldDisplayName}
              currentFilterValues={currentFilterValues}
              handleSelect={handleSelect}
            />
          ))}
        </ContextMenuSubContent>
      </Portal>
    </SubMenu>
  );
};

const HeatmapThemeSelect = () => {
  const { setHeatmapTheme, heatmapTheme, isInverted, toggleInvert } =
    useColorScale();
  const trackEvent = useTrackEvent();

  const handleThemeChange = (theme: HeatmapTheme) => {
    setHeatmapTheme(theme);
    trackEvent("Change Heatmap Theme", theme);
  };

  const handleInvertToggle = () => {
    toggleInvert();
    trackEvent("Toggle Heatmap Theme Invert", isInverted ? "false" : "true");
  };

  return (
    <SubMenu>
      <ContextMenuSubTrigger>
        Heatmap Theme <RightSlot>&rsaquo;</RightSlot>
      </ContextMenuSubTrigger>
      <Portal>
        <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleInvertToggle();
            }}
          >
            <CheckboxItem checked={isInverted}>
              <ItemIndicator>✓</ItemIndicator>
            </CheckboxItem>
            Invert Theme
          </ContextMenuItem>
          <ContextMenuSeparator />
          {HEATMAP_THEMES_LIST.map((theme) => (
            <ContextMenuItem
              key={theme}
              onSelect={(e) => {
                e.preventDefault();
                handleThemeChange(theme);
              }}
            >
              <CheckboxItem checked={heatmapTheme === theme}>
                <ItemIndicator>✓</ItemIndicator>
              </CheckboxItem>
              <span style={{ textTransform: "capitalize" }}>{theme}</span>
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </Portal>
    </SubMenu>
  );
};

const NormalizationSelect = () => {
  const normalizationIsDisabled = useNormalizationControlIsDisabled();
  const { normalization, setNormalization } = useNormalization();
  const trackEvent = useTrackEvent();

  const handleNormalizationChange = (
    selectedNormalization: (typeof NORMALIZATIONS)[number],
  ) => {
    setNormalization(selectedNormalization);
    trackEvent("Change Heatmap Normalization", selectedNormalization);
  };

  if (normalizationIsDisabled) {
    return null;
  }

  return (
    <SubMenu>
      <ContextMenuSubTrigger>
        Normalization <RightSlot>&rsaquo;</RightSlot>
      </ContextMenuSubTrigger>
      <Portal>
        <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
          {NORMALIZATIONS.map((norm) => (
            <ContextMenuItem
              key={norm}
              onSelect={(e) => {
                e.preventDefault();
                handleNormalizationChange(norm);
              }}
            >
              <CheckboxItem checked={normalization === norm}>
                <ItemIndicator>✓</ItemIndicator>
              </CheckboxItem>
              <span style={{ textTransform: "capitalize" }}>{norm}</span>
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </Portal>
    </SubMenu>
  );
};

const ThemeToggle = () => {
  const themeIsDisabled = useThemeControlIsDisabled();
  const { currentTheme, setTheme } = useSetTheme();
  const trackEvent = useTrackEvent();

  const handleThemeToggle = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    trackEvent("Change Visualization Theme", newTheme);
  };

  if (themeIsDisabled) {
    return null;
  }

  return (
    <ContextMenuItem
      onSelect={(e) => {
        e.preventDefault();
        handleThemeToggle();
      }}
    >
      <CheckboxItem checked={currentTheme === "dark"}>
        <ItemIndicator>✓</ItemIndicator>
      </CheckboxItem>
      Dark Theme
    </ContextMenuItem>
  );
};

const ViewTypeSelect = () => {
  const { viewType, setTraditional, setDefault } = useViewType();
  const setTopGraphTypeForTraditional = useSetTopGraphTypeForTraditional();
  const restorePreviousTopGraphType = useRestorePreviousTopGraphType();
  const trackEvent = useTrackEvent();

  const transposeData = useTranspose();
  const swapAxisConfigs = useSwapAxisConfigs();

  const hasBeenTransposed = useHasBeenTransposed();
  
  const handleTranspose = useEventCallback(() => {
    transposeData();
    swapAxisConfigs();
  });

  const handleViewTypeChange = (newViewType: "traditional" | "default") => {
    if (newViewType === "traditional") {
      setTraditional();
      setTopGraphTypeForTraditional("Stacked Bars (Categorical)");
    } else {
      setDefault();
      restorePreviousTopGraphType();
    }
    if (!hasBeenTransposed) {
      handleTranspose();
    }
    trackEvent("Change View Type", newViewType);
  };

  return (
    <SubMenu>
      <ContextMenuSubTrigger>
        View Type <RightSlot>&rsaquo;</RightSlot>
      </ContextMenuSubTrigger>
      <Portal>
        <ContextMenuSubContent sideOffset={2} alignOffset={-5}>
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleViewTypeChange("default");
            }}
          >
            <CheckboxItem checked={viewType === "default"}>
              <ItemIndicator>✓</ItemIndicator>
            </CheckboxItem>
            Default
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleViewTypeChange("traditional");
            }}
          >
            <CheckboxItem checked={viewType === "traditional"}>
              <ItemIndicator>✓</ItemIndicator>
            </CheckboxItem>
            Traditional
          </ContextMenuItem>
        </ContextMenuSubContent>
      </Portal>
    </SubMenu>
  );
};

const TransposeAction = () => {
  const transposeData = useTranspose();
  const swapAxisConfigs = useSwapAxisConfigs();
  const trackEvent = useTrackEvent();

  const xScale = useXScale();
  const yScale = useYScale();
  const expandedValues = useSelectedValues();

  const toggleHasBeenTransposed = useTransposeToggle();

  const handleTranspose = () => {
    // First transpose the data
    transposeData();
    // Then swap the axis configurations
    swapAxisConfigs();
    // Reset scroll positions to avoid invalid states
    xScale.resetScroll();
    yScale.resetScroll();
    // Reset expanded rows since they no longer make sense after transpose
    expandedValues.reset();
     // Toggle transpose state
    toggleHasBeenTransposed();

    trackEvent("Transpose Data", "");
  };

  return (
    <ContextMenuItem
      onSelect={(e) => {
        e.preventDefault();
        handleTranspose();
      }}
    >
      Transpose Rows and Columns
    </ContextMenuItem>
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
        <RestoreHiddenColumns />
        <ResetSorts />
        <ResetFilters />
        <HeatmapThemeSelect />
        <NormalizationSelect />
        <ViewTypeSelect />
        <ThemeToggle />
        <TransposeAction />
        {hasRow && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel>Rows ({rowLabel}s)</ContextMenuLabel>
            <HideRow />
            <MoveToStart dimension="Row" />
            <MoveToEnd dimension="Row" />
            <ExpandRow />
            <CollapseRows />
            <HideZeroedColumns />
            <SortDimension dimension="Row" />
            <FilterDimension dimension="Row" />
          </>
        )}
        {hasColumn && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel>Columns ({columnLabel}s)</ContextMenuLabel>
            <HideColumn />
            <HideZeroedRows />
            <MoveToStart dimension="Column" />
            <MoveToEnd dimension="Column" />
            <SortDimension dimension="Column" />
            <FilterDimension dimension="Column" />
          </>
        )}
      </ContextMenuContent>
    </Portal>
  );
};

export default ContextMenuComponent;
