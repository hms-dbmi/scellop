import { memoize } from "proxy-memoize";
import { useCallback, useMemo } from "react";
import { temporal } from "zundo";
import { createStore } from "zustand";
import { ScellopData } from "../scellop-schema";
import { moveToEnd, moveToStart } from "../utils/array-reordering";
import { Normalization } from "../utils/normalizations";
import { createTemporalStoreContext } from "../utils/zustand";

interface DataContextProps {
  initialData: ScellopData;
}

type RowKey = string;
type ColumnKey = string;
type DataMapKey = `${RowKey}-${ColumnKey}`;

export type SortDirection = "asc" | "desc";
export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export interface SortOrder<T> {
  key: T | "count" | "alphabetical";
  direction: SortDirection;
}

export interface Filter<T> {
  key: T;
  values: (string | number | boolean)[];
}

export const DEFAULT_SORTS = ["count", "alphabetical"] as const;

interface DataContextState {
  data: ScellopData;
  removedRows: Set<string>;
  removedColumns: Set<string>;
  rowOrder: string[];
  columnOrder: string[];
  rowSortOrder: SortOrder<string>[];
  columnSortOrder: SortOrder<string>[];
  rowFilters: Filter<string>[];
  columnFilters: Filter<string>[];
  filteredRows: Set<string>;
  filteredColumns: Set<string>;
  rowSortInvalidated: boolean;
  columnSortInvalidated: boolean;
  isTransposed: boolean;
}

interface DataContextActions {
  /**
   * Restores the removed rows to the visualization.
   */
  resetRemovedRows: () => void;
  /**
   * Restores the removed columns to the visualization.
   */
  resetRemovedColumns: () => void;
  /**
   * Removes a row from the visualization and updates counts accordingly.
   * @param row the row to remove
   */
  removeRow: (row: string) => void;
  /**
   * Removes a column from the visualization and updates counts accordingly.
   * @param column the column to remove
   * @returns
   */
  removeColumn: (column: string) => void;
  /**
   * Removes multiple rows from the visualization and updates counts accordingly.
   * @param rows the rows to remove
   */
  removeRows: (rows: string[]) => void;
  /**
   * Removes multiple columns from the visualization and updates counts accordingly.
   * @param columns the columns to remove
   */
  removeColumns: (columns: string[]) => void;
  /**
   * Restores a row to the visualization.
   * @param row the row to restore
   */
  restoreRow: (row: string) => void;
  /**
   * Restores a column to the visualization.
   * @param column the column to restore
   */
  restoreColumn: (column: string) => void;
  /**
   * Sets the sort order for the rows and updates the row order accordingly.
   */
  setRowSortOrder: (sortOrder: SortOrder<string>[]) => void;
  /**
   * Sets the sort order for the columns and updates the column order accordingly.
   */
  setColumnSortOrder: (sortOrder: SortOrder<string>[]) => void;
  /**
   * Adds a sort order to the rows and updates the row order accordingly.
   */
  addRowSortOrder: (sortOrder: SortOrder<string>) => void;
  /**
   * Adds a sort order to the columns and updates the column order accordingly.
   */
  addColumnSortOrder: (sortOrder: SortOrder<string>) => void;
  /**
   * Updates a sort order for the rows at a given index and updates the row order accordingly.
   * e.g. toggling the direction of the sort order or switching to a different metadata key.
   */
  editRowSortOrder: (index: number, sortOrder: SortOrder<string>) => void;
  /**
   * Updates a sort order for the columns at a given index and updates the column order accordingly.
   * e.g. toggling the direction of the sort order or switching to a different metadata key.
   */
  editColumnSortOrder: (index: number, sortOrder: SortOrder<string>) => void;
  /**
   * Removes the sort order with the given sort key and updates the row order accordingly.
   */
  removeRowSortOrder: (key: string) => void;
  /**
   * Removes the sort order with the given sort key and updates the column order accordingly.
   */
  removeColumnSortOrder: (key: string) => void;
  /**
   * Removes all sort orders for the rows.
   */
  clearRowSortOrder: () => void;
  /**
   * Removes all sort orders for the columns.
   */
  clearColumnSortOrder: () => void;
  /**
   * Updates the order of the rows and clears the current sort orders.
   */
  setRowOrder: (order: string[]) => void;
  /**
   * Updates the order of the columns and clears the current sort orders.
   */
  setColumnOrder: (order: string[]) => void;
  /**
   * Revalidates the column sort order, updating the column order to match the current sort order.
   */
  revalidateColumnSort: () => void;
  /**
   * Revalidates the row sort order, updating the row order to match the current sort order.
   */
  revalidateRowSort: () => void;
  /**
   * Removes all rows that have zero values across the indicated column
   */
  removeZeroedValuesFromColumn: (column: string) => void;
  /**
   * Removes all columns that have zero values across the indicated row
   */
  removeZeroedValuesFromRow: (row: string) => void;
  /**
   * Transposes the data by swapping rows and columns
   */
  transposeData: () => void;
   /**
   *
   */
  setRowFilters: (filters: Filter<string>[]) => void;
  /**
   *
   */
  setColumnFilters: (filters: Filter<string>[]) => void;
  /**
   * Add filter Row
   */
  addRowFilter: (key: string) => void;
  /**
   * Add filter Column
   */
  addColumnFilter: (key: string) => void;
  /**
   *
   */
  editRowFilter: (index: number, newKey: string) => void;
  /**
   *
   */
  editColumnFilter: (index: number, newKey: string) => void;
  /**
   *
   */
  editRowSubFilters: (
    key: string,
    values: (string | number | boolean)[],
  ) => void;
  /**
   *
   */
  editColumnSubFilters: (
    key: string,
    values: (string | number | boolean)[],
  ) => void;
  /**
   *
   */
  removeRowFilter: (key: string) => void;
  /**
   *
   */
  removeColumnFilter: (key: string) => void;
  /**
   *
   */
  clearRowFilters: () => void;
  /**
   *
   */
  clearColumnFilters: () => void;
}

type DataContextStore = DataContextState & DataContextActions;

/**
 * Helper method for applying multiple sort orders to an array.
 * @param array The array to sort
 * @param sorts The sort orders to apply
 * @param metadata The metadata object to use for sorting
 * @param state The data context store
 * @returns The sorted array
 */
const applySortOrders = (
  array: string[],
  sorts: SortOrder<string>[],
  state: DataContextStore,
  row: boolean,
): string[] => {
  const metadata = row ? state.data.metadata.rows : state.data.metadata.cols;
  // Avoid mutating the original array by creating a copy
  const arrayCopy = [...array];
  // Consolidate the sort orders into a single comparison function by converting
  // them into a recursive function that calls the next comparison function
  // if the current comparison returns 0.
  const comparisonFunction = sorts.reduceRight(
    (acc, { key, direction }) => {
      switch (key) {
        case "alphabetical":
          return (a: string, b: string) => {
            const compare =
              direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
            if (compare === 0) {
              return acc(a, b);
            }
            return compare;
          };
        case "count": {
          const { rowCounts, columnCounts } = getDerivedStatesSelector(state);
          const counts = row ? rowCounts : columnCounts;
          return (a: string, b: string) => {
            const aValue = counts[a] as number;
            const bValue = counts[b] as number;
            const compare =
              direction === "asc" ? aValue - bValue : bValue - aValue;
            if (compare === 0) {
              return acc(a, b);
            }
            return compare;
          };
        }
        default:
          return (a: string, b: string) => {
            const aValue =
              metadata?.[a][key as keyof (typeof metadata)[typeof a]];
            const bValue =
              metadata?.[b][key as keyof (typeof metadata)[typeof b]];
            if (aValue === undefined || bValue === undefined) {
              return aValue === bValue ? 0 : aValue === undefined ? 1 : -1;
            }
            if (typeof aValue === "number" && typeof bValue === "number") {
              return direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            const compare =
              direction === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
            if (compare === 0) {
              return acc(a, b);
            }

            return compare;
          };
      }
    },
    (a: string, b: string) => a.localeCompare(b),
  );
  return arrayCopy.sort(comparisonFunction);
};

const applyFilters = (
  array: string[],
  filters: Filter<string>[],
  state: DataContextStore,
  row: boolean,
): Set<string> => {
  const metadata = row ? state.data.metadata.rows : state.data.metadata.cols;
  const discarded = new Set<string>();

  const activeFilters = filters.filter((f) => f.values.length !== 0);

  if (activeFilters.length === 0) {
    return discarded;
  }

  for (const item of array) {
    for (const filter of activeFilters) {
      const itemMetadata = metadata?.[item];
      const itemValue = itemMetadata?.[filter.key] ?? "undefined";
      if (filter.values.includes(itemValue)) {
        discarded.add(item);
        break;
      }
    }
  }
  return discarded;
};

const createDataContextStore = ({ initialData }: DataContextProps) =>
  createStore<DataContextStore>()(
    temporal((set, get) => ({
      data: initialData,
      removedRows: new Set<string>(),
      removedColumns: new Set<string>(),
      rowSortOrder: [] as SortOrder<RowKey>[],
      columnSortOrder: [] as SortOrder<ColumnKey>[],
      rowOrder: initialData.rowNames,
      columnOrder: initialData.colNames,
      rowSortInvalidated: false,
      columnSortInvalidated: false,
      rowFilters: [] as Filter<RowKey>[],
      columnFilters: [] as Filter<ColumnKey>[],
      filteredRows: new Set<string>(),
      filteredColumns: new Set<string>(),
      isTransposed: false,
      resetRemovedRows: () => {
        set({ removedRows: new Set<string>() });
      },
      resetRemovedColumns: () => {
        set({ removedColumns: new Set<string>() });
      },
      removeRow: (row: string) => {
        set((state) => {
          const removedRows = new Set(state.removedRows);
          removedRows.add(row);
          return { removedRows };
        });
      },
      removeColumn: (column: string) => {
        set((state) => {
          const removedColumns = new Set(state.removedColumns);
          removedColumns.add(column);
          return { removedColumns };
        });
      },
      restoreRow: (row: string) => {
        set((state) => {
          const removedRows = new Set(state.removedRows);
          removedRows.delete(row);
          return { removedRows };
        });
      },
      restoreColumn: (column: string) => {
        set((state) => {
          const removedColumns = new Set(state.removedColumns);
          removedColumns.delete(column);
          return { removedColumns };
        });
      },
      removeRows: (rows: string[]) => {
        set((state) => {
          const removedRows = new Set(state.removedRows);
          rows.forEach((row) => removedRows.add(row));
          return { removedRows };
        });
      },
      removeColumns: (columns: string[]) => {
        set((state) => {
          const removedColumns = new Set(state.removedColumns);
          columns.forEach((column) => removedColumns.add(column));
          return { removedColumns };
        });
      },
      setColumnSortOrder: (sortOrder: SortOrder<ColumnKey>[]) => {
        const columnOrder = applySortOrders(
          initialData.colNames,
          sortOrder,
          get(),
          false,
        );
        set({ columnSortOrder: sortOrder, columnOrder });
      },
      setRowSortOrder: (sortOrder: SortOrder<RowKey>[]) => {
        const rowOrder = applySortOrders(
          initialData.rowNames,
          sortOrder,
          get(),
          true,
        );
        set({ rowSortOrder: sortOrder, rowOrder });
      },
      addRowSortOrder: (sortOrder: SortOrder<RowKey>) => {
        set((state) => {
          const rowSortOrder = [...state.rowSortOrder, sortOrder];
          const rowOrder = applySortOrders(
            state.rowOrder,
            rowSortOrder,
            get(),
            true,
          );
          return { rowSortOrder, rowOrder, rowSortInvalidated: false };
        });
      },
      addColumnSortOrder: (sortOrder: SortOrder<ColumnKey>) => {
        set((state) => {
          const columnSortOrder = [...state.columnSortOrder, sortOrder];
          const columnOrder = applySortOrders(
            state.columnOrder,
            columnSortOrder,
            get(),
            false,
          );
          return { columnSortOrder, columnOrder, columnSortInvalidated: false };
        });
      },
      editRowSortOrder: (index: number, sortOrder: SortOrder<RowKey>) => {
        set((state) => {
          const rowSortOrder = [...state.rowSortOrder];
          rowSortOrder[index] = sortOrder;
          const rowOrder = applySortOrders(
            state.rowOrder,
            rowSortOrder,
            get(),
            true,
          );
          return { rowSortOrder, rowOrder, rowSortInvalidated: false };
        });
      },
      editColumnSortOrder: (index: number, sortOrder: SortOrder<ColumnKey>) => {
        set((state) => {
          const columnSortOrder = [...state.columnSortOrder];
          columnSortOrder[index] = sortOrder;
          const columnOrder = applySortOrders(
            state.columnOrder,
            columnSortOrder,
            get(),
            false,
          );
          return { columnSortOrder, columnOrder, columnSortInvalidated: false };
        });
      },
      removeRowSortOrder: (key: string) => {
        set((state) => {
          const rowSortOrder = state.rowSortOrder.filter((s) => s.key !== key);
          const rowOrder = applySortOrders(
            state.rowOrder,
            rowSortOrder,
            get(),
            true,
          );
          return { rowSortOrder, rowOrder, rowSortInvalidated: false };
        });
      },
      removeColumnSortOrder: (key: string) => {
        set((state) => {
          const columnSortOrder = state.columnSortOrder.filter(
            (s) => s.key !== key,
          );
          const columnOrder = applySortOrders(
            state.columnOrder,
            columnSortOrder,
            get(),
            false,
          );
          return { columnSortOrder, columnOrder, columnSortInvalidated: false };
        });
      },
      clearRowSortOrder: () => {
        set({ rowSortOrder: [], rowSortInvalidated: false });
      },
      clearColumnSortOrder: () => {
        set({ columnSortOrder: [], columnSortInvalidated: false });
      },
      setRowOrder: (order: string[]) => {
        const rowSortOrder = get().rowSortOrder;
        set({ rowOrder: order, rowSortInvalidated: rowSortOrder.length > 0 });
      },
      setColumnOrder: (order: string[]) => {
        const columnSortOrder = get().columnSortOrder;
        set({
          columnOrder: order,
          columnSortInvalidated: columnSortOrder.length > 0,
        });
      },
      revalidateColumnSort: () => {
        set((state) => {
          const columnOrder = applySortOrders(
            state.columnOrder,
            state.columnSortOrder,
            state,
            false,
          );
          return { columnOrder, columnSortInvalidated: false };
        });
      },
      revalidateRowSort: () => {
        set((state) => {
          const rowOrder = applySortOrders(
            state.rowOrder,
            state.rowSortOrder,
            state,
            true,
          );
          return { rowOrder, rowSortInvalidated: false };
        });
      },
      removeZeroedValuesFromColumn: (column: string) => {
        const { data, removedRows } = get();
        const rowsToRemove = new Set<string>();
        data.countsMatrix.forEach(([row, col, value]) => {
          if (col === column && value === 0 && !removedRows.has(row)) {
            rowsToRemove.add(row);
          }
        });
        if (rowsToRemove.size > 0) {
          set((state) => {
            const newRemovedRows = new Set(state.removedRows);
            rowsToRemove.forEach((row) => newRemovedRows.add(row));
            return { removedRows: newRemovedRows };
          });
        }
      },
      removeZeroedValuesFromRow: (row: string) => {
        const { data, removedColumns } = get();
        const columnsToRemove = new Set<string>();
        data.countsMatrix.forEach(([r, col, value]) => {
          if (r === row && value === 0 && !removedColumns.has(col)) {
            columnsToRemove.add(col);
          }
        });
        if (columnsToRemove.size > 0) {
          set((state) => {
            const newRemovedColumns = new Set(state.removedColumns);
            columnsToRemove.forEach((col) => newRemovedColumns.add(col));
            return { removedColumns: newRemovedColumns };
          });
        }
      },
      transposeData: () => {
        set((state) => {
          // Create transposed counts matrix: [row, col, value] becomes [col, row, value]
          const transposedCountsMatrix: [string, string, number][] =
            state.data.countsMatrix.map(([row, col, value]) => [
              col,
              row,
              value,
            ]);

          // Swap row and column names
          const newRowNames = state.data.colNames;
          const newColNames = state.data.rowNames;

          // Swap metadata
          const newMetadata = {
            rows: state.data.metadata?.cols,
            cols: state.data.metadata?.rows,
          };

          // Create new data object
          const newData: ScellopData = {
            ...state.data,
            rowNames: newRowNames,
            colNames: newColNames,
            countsMatrix: transposedCountsMatrix,
            metadata: newMetadata,
          };

          // Swap orders and removed sets
          const newRowOrder = state.columnOrder;
          const newColumnOrder = state.rowOrder;
          const newRemovedRows = new Set(state.removedColumns);
          const newRemovedColumns = new Set(state.removedRows);

          // Swap sort orders
          const newRowSortOrder = state.columnSortOrder;
          const newColumnSortOrder = state.rowSortOrder;

          return {
            data: newData,
            rowOrder: newRowOrder,
            columnOrder: newColumnOrder,
            removedRows: newRemovedRows,
            removedColumns: newRemovedColumns,
            rowSortOrder: newRowSortOrder,
            columnSortOrder: newColumnSortOrder,
            rowSortInvalidated: state.columnSortInvalidated,
            columnSortInvalidated: state.rowSortInvalidated,
            isTransposed: !state.isTransposed,
          };
        });
      },
      setRowFilters: (filters: Filter<string>[]) => {
        set((state) => {
          const rowFilters = filters;
          const filteredRows = applyFilters(
            state.data.rowNames,
            rowFilters,
            state,
            true,
          );
          return { rowFilters, filteredRows };
        });
      },
      setColumnFilters: (filters: Filter<string>[]) => {
        set((state) => {
          const columnFilters = filters;
          const filteredColumns = applyFilters(
            state.data.colNames,
            columnFilters,
            state,
            false,
          );
          return { columnFilters, filteredColumns };
        });
      },
      addRowFilter: (key: string) => {
        set((state) => {
          const rowFilters = [...state.rowFilters, { key, values: [] }];
          return { rowFilters };
        });
      },
      addColumnFilter: (key: string) => {
        set((state) => {
          const columnFilters = [...state.columnFilters, { key, values: [] }];
          return { columnFilters };
        });
      },
      editRowSubFilters: (
        key: string,
        values: (string | number | boolean)[],
      ) => {
        set((state) => {
          const rowFilters = state.rowFilters.map((filter) => {
            if (filter.key === key) {
              return { key, values };
            }
            return filter;
          });
          const filteredRows = applyFilters(
            state.data.rowNames,
            rowFilters,
            state,
            true,
          );
          return { rowFilters, filteredRows };
        });
      },
      editColumnSubFilters: (
        key: string,
        values: (string | number | boolean)[],
      ) => {
        set((state) => {
          const columnFilters = state.columnFilters.map((filter) => {
            if (filter.key === key) {
              return { key, values };
            }
            return filter;
          });
          const filteredColumns = applyFilters(
            state.data.colNames,
            columnFilters,
            state,
            false,
          );
          return { columnFilters, filteredColumns };
        });
      },
      editRowFilter: (index: number, newKey: string) => {
        set((state) => {
          const rowFilters = [...state.rowFilters];
          rowFilters[index] = { key: newKey, values: [] };
          const filteredRows = applyFilters(
            state.data.rowNames,
            rowFilters,
            state,
            true,
          );
          return { rowFilters, filteredRows };
        });
      },
      editColumnFilter: (index: number, newKey: string) => {
        set((state) => {
          const columnFilters = [...state.columnFilters];
          columnFilters[index] = { key: newKey, values: [] };
          const filteredColumns = applyFilters(
            state.data.colNames,
            columnFilters,
            state,
            false,
          );
          return { columnFilters, filteredColumns };
        });
      },
      removeRowFilter: (key: string) => {
        set((state) => {
          const rowFilters = state.rowFilters.filter((s) => s.key !== key);
          const filteredRows = applyFilters(
            state.data.rowNames,
            rowFilters,
            state,
            true,
          );
          return { rowFilters, filteredRows };
        });
      },
      removeColumnFilter: (key: string) => {
        set((state) => {
          const columnFilters = state.columnFilters.filter(
            (s) => s.key !== key,
          );
          const filteredColumns = applyFilters(
            state.data.colNames,
            columnFilters,
            state,
            false,
          );
          return { columnFilters, filteredColumns };
        });
      },
      clearRowFilters: () => {
        set((state) => {
          return { rowFilters: [], filteredRows: new Set(state.data.rowNames) };
        });
      },
      clearColumnFilters: () => {
        set((state) => {
          return {
            columnFilters: [],
            filteredColumns: new Set(state.data.colNames),
          };
        });
      },
    })),
  );

export const [DataProvider, useData, , useDataHistory] =
  createTemporalStoreContext<DataContextStore, DataContextProps>(
    createDataContextStore,
    "DataContextStore",
  );

const getDerivedStatesSelector = (state: DataContextStore) => {
  const rowCounts: Record<string, number> = {};
  const columnCounts: Record<string, number> = {};
  const rowMaxes: Record<string, number> = {};
  const columnMaxes: Record<string, number> = {};
  let maxCount = 0;
  const { removedRows, removedColumns } = state;
  state.data.countsMatrix.forEach(([row, col, value]) => {
    if (removedRows.has(row) || removedColumns.has(col)) {
      return;
    }
    rowCounts[row] = (rowCounts[row] || 0) + value;
    columnCounts[col] = (columnCounts[col] || 0) + value;
    rowMaxes[row] = Math.max(rowMaxes[row] || 0, value);
    columnMaxes[col] = Math.max(columnMaxes[col] || 0, value);
    maxCount = Math.max(maxCount, value);
  });
  return {
    rowCounts,
    columnCounts,
    rowMaxes,
    columnMaxes,
    maxCount,
  };
};

const getDerivedStatesMemo = memoize(getDerivedStatesSelector);

const getDataMap = memoize((state: DataContextStore) => {
  const dataMap: Record<DataMapKey, number> = {};
  state.data.countsMatrix.forEach(([row, col, value]) => {
    dataMap[`${row}-${col}`] = value;
  });
  return dataMap;
});

const getRowFractionDataMap = memoize((state: DataContextStore) => {
  const dataMap: Record<DataMapKey, number> = {};
  const { rowCounts } = getDerivedStatesSelector(state);
  state.data.countsMatrix.forEach(([row, col, value]) => {
    dataMap[`${row}-${col}`] = value / rowCounts[row];
  });
  return dataMap;
});

const getColumnFractionDataMap = memoize((state: DataContextStore) => {
  const dataMap: Record<DataMapKey, number> = {};
  const { columnCounts } = getDerivedStatesSelector(state);
  state.data.countsMatrix.forEach(([row, col, value]) => {
    dataMap[`${row}-${col}`] = value / columnCounts[col];
  });
  return dataMap;
});

const getLogDataMap = memoize((state: DataContextStore) => {
  const dataMap: Record<DataMapKey, number> = {};
  state.data.countsMatrix.forEach(([row, col, value]) => {
    dataMap[`${row}-${col}`] = Math.log(value + 1);
  });
  return dataMap;
});

const getRowNames = memoize((state: DataContextStore) => {
  const { rowOrder, removedRows, filteredRows } = state;
  return rowOrder.filter(
    (row) => !removedRows.has(row) && !filteredRows.has(row),
  );
});

const getColumnNames = memoize((state: DataContextStore) => {
  const { columnOrder, removedColumns, filteredColumns } = state;
  return columnOrder.filter(
    (column) => !removedColumns.has(column) && !filteredColumns.has(column),
  );
});

const getMetadataKeys = (
  metadata: Record<string, Record<string, string | number>> | undefined,
) => {
  if (!metadata) {
    return [];
  }
  const metadataValues = Object.values(metadata);
  const set = metadataValues.reduce<Set<string>>(
    (acc: Set<string>, curr: object) => {
      Object.keys(curr).forEach((key) => {
        acc.add(key);
      });
      return acc;
    },
    new Set<string>(),
  );
  return [...set];
};

const getMetadataObject = (
  metadata: Record<string, Record<string, string | number>> | undefined,
) => {
  if (!metadata) {
    return [];
  }
  const metadataValues = Object.values(metadata);
  const set = metadataValues.reduce<Record<string, Set<string | number>>>(
    (acc, curr) => {
      Object.entries(curr).forEach(([key, value]) => {
        if (!acc[key]) acc[key] = new Set();
        acc[key].add(value === undefined ? "undefined" : value);
      });
      return acc;
    },
    {},
  );
  return Object.entries(set);
};

const getRowSortKeys = memoize((state: DataContextStore) => {
  return getMetadataKeys(state.data.metadata?.rows);
});

const getColumnSortKeys = memoize((state: DataContextStore) => {
  return getMetadataKeys(state.data.metadata?.cols);
});

const getRowFilterKeys = memoize((state: DataContextStore) => {
  return getMetadataObject(state.data.metadata?.rows);
});

const getColumnFilterKeys = memoize((state: DataContextStore) => {
  return getMetadataObject(state.data.metadata?.cols);
});

export const useMetadataLookup = () => {
  const metadata = useData((s) => s.data.metadata);
  return useCallback(
    (key: string, direction: "rows" | "cols", allowedKeys?: string[]) => {
      const md = metadata[direction]?.[key];
      if (!md) {
        return {};
      }
      if (!allowedKeys) {
        return md;
      }
      const filteredMetadata = Object.entries(md).reduce<
        Record<string, string | number>
      >((acc, [k, v]) => {
        if (allowedKeys.includes(k)) {
          acc[k] = v as string | number;
        }
        return acc;
      }, {});
      return filteredMetadata;
    },
    [metadata],
  );
};

export const useMetadataKeys = (direction: "Row" | "Column") => {
  return useData(direction === "Row" ? getRowSortKeys : getColumnSortKeys);
};

const useSortKeys = (direction: "Row" | "Column") => {
  const metadataKeys = useMetadataKeys(direction);
  return useMemo(
    () => ["count", "alphabetical", ...metadataKeys],
    [metadataKeys],
  );
};

export const useRowSortKeys = () => {
  return useSortKeys("Row");
};

export const useRowMetadataKeys = () => {
  return useMetadataKeys("Row");
};

export const useColumnMetadataKeys = () => {
  return useMetadataKeys("Column");
};

export const useColumnSortKeys = () => {
  return useSortKeys("Column");
};

export const useDataMap = () => {
  return useData(getDataMap);
};

export const useRowFractionDataMap = () => {
  return useData(getRowFractionDataMap);
};

export const useColumnFractionDataMap = () => {
  return useData(getColumnFractionDataMap);
};

export const useLogDataMap = () => {
  return useData(getLogDataMap);
};

export const useRowCounts = () => {
  return useData(getDerivedStatesMemo).rowCounts;
};

export const useColumnCounts = () => {
  return useData(getDerivedStatesMemo).columnCounts;
};

export const useRowMaxes = () => {
  return useData(getDerivedStatesMemo).rowMaxes;
};

export const useColumnMaxes = () => {
  return useData(getDerivedStatesMemo).columnMaxes;
};

export const useMaxCount = () => {
  return useData(getDerivedStatesMemo).maxCount;
};

export const useRows = () => {
  return useData(getRowNames);
};

export const useColumns = () => {
  return useData(getColumnNames);
};

export const useAvailableRowSorts = () => {
  const rowSortKeys = useRowSortKeys();
  const rowSortOrder = useData((s) => s.rowSortOrder);
  return rowSortKeys.filter(
    (key) => !rowSortOrder.some((sort) => sort.key === key),
  );
};

export const useAvailableColumnSorts = () => {
  const columnSortKeys = useColumnSortKeys();
  const columnSortOrder = useData((s) => s.columnSortOrder);
  return columnSortKeys.filter(
    (key) => !columnSortOrder.some((sort) => sort.key === key),
  );
};

export function sortFilterValues(values: (string | number | boolean)[]) {
  const valuesCopy = [...values];
  valuesCopy.sort((a, b) => {
    if (typeof a === "boolean") {
      a = a ? 1 : 0;
    }
    if (typeof b === "boolean") {
      b = b ? 1 : 0;
    }
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });
  return valuesCopy;
}

// export const useAllFilters = (direction: "row" | "column") => {
//   return useData(direction === "row" ? getRowFilterKeys : getColumnFilterKeys);
// };

export const useAvailableRowFilters = () => {
  const rowFilterKeys = useData(getRowFilterKeys);
  const currentRowFilters = useData((s) => s.rowFilters);

  return useMemo(() => {
    return rowFilterKeys
      .filter(([key]) => !currentRowFilters.some((f) => f.key === key))
      .map(([key]) => key);
  }, [rowFilterKeys, currentRowFilters]);
};

export const useAllRowSubFilters = (key: string) => {
  const rowFilterKeys = useData(getRowFilterKeys);

  const entry = rowFilterKeys.find(([k]) => k === key);
  return entry ? sortFilterValues(Array.from(entry[1])) : [];
};

export const useAvailableColumnFilters = () => {
  const columnFilterKeys = useData(getColumnFilterKeys);
  const currentColumnFilters = useData((s) => s.columnFilters);

  return useMemo(() => {
    return columnFilterKeys
      .filter(([key]) => !currentColumnFilters.some((f) => f.key === key))
      .map(([key]) => key);
  }, [columnFilterKeys, currentColumnFilters]);
};

export const useAllColumnSubFilters = (key: string) => {
  const columnFilterKeys = useData(getColumnFilterKeys);

  const entry = columnFilterKeys.find(([k]) => k === key);
  return entry ? sortFilterValues(Array.from(entry[1])) : [];
};

export const useHighestColumnCount = () => {
  const columnCounts = useColumnCounts();
  return Math.max(
    ...Object.values(columnCounts).filter((count) => !isNaN(count)),
  );
};

export const useHighestRowCount = () => {
  const rowCounts = useRowCounts();
  return Math.max(...Object.values(rowCounts).filter((count) => !isNaN(count)));
};

export const useMoveRowToEnd = () => {
  const setRowOrder = useData((s) => s.setRowOrder);
  const rowOrder = useData((s) => s.rowOrder);
  return (row: string) => {
    setRowOrder(moveToEnd(rowOrder, row));
  };
};

export const useMoveRowToStart = () => {
  const setRowOrder = useData((s) => s.setRowOrder);
  const rowOrder = useData((s) => s.rowOrder);
  return (row: string) => {
    setRowOrder(moveToStart(rowOrder, row));
  };
};

export const useMoveColumnToEnd = () => {
  const setColumnOrder = useData((s) => s.setColumnOrder);
  const columnOrder = useData((s) => s.columnOrder);
  return (column: string) => {
    setColumnOrder(moveToEnd(columnOrder, column));
  };
};

export const useMoveColumnToStart = () => {
  const setColumnOrder = useData((s) => s.setColumnOrder);
  const columnOrder = useData((s) => s.columnOrder);
  return (column: string) => {
    setColumnOrder(moveToStart(columnOrder, column));
  };
};

export const useFractionDataMap = (normalization: Normalization) => {
  const selector = useMemo(() => {
    switch (normalization) {
      case "Row":
        return getRowFractionDataMap;
      case "Column":
        return getColumnFractionDataMap;
      case "Log":
        return getLogDataMap;
      default:
        return getDataMap;
    }
  }, [normalization]);
  return useData(selector);
};

export const useTranspose = () => {
  return useData((s) => s.transposeData);
};

export const useIsTransposed = () => {
  return useData((s) => s.isTransposed);
}
