import { useEffect } from "react";
import { useColumnConfig, useRowConfig } from "../contexts/AxisConfigContext";
import { useColumns, useRows } from "../contexts/DataContext";
import { initializeDefaultColors } from "../utils/axis-colors";

/**
 * Hook that automatically assigns default colors to rows and columns
 * if they don't already have colors configured.
 * This runs once when the component mounts or when the data changes.
 * @param enabled - Whether auto color assignment should be enabled (default: true)
 */
export function useAutoColorAssignment(enabled = true) {
  const rows = useRows();
  const columns = useColumns();
  const rowConfig = useRowConfig();
  const columnConfig = useColumnConfig();

  useEffect(() => {
    // Skip auto-assignment if disabled
    if (!enabled) return;

    // Auto-assign colors for rows if none are configured
    if (rows.length > 0) {
      const hasRowColors =
        rowConfig.colors &&
        Object.values(rowConfig.colors).some(
          (color) => color && color.length > 0,
        );
      if (!hasRowColors) {
        const defaultRowColors = initializeDefaultColors(
          rows,
          rowConfig.colors,
        );
        rowConfig.setColors(defaultRowColors);
      }
    }
  }, [rows, rowConfig, enabled]);

  useEffect(() => {
    // Skip auto-assignment if disabled
    if (!enabled) return;

    // Auto-assign colors for columns if none are configured
    if (columns.length > 0) {
      const hasColumnColors =
        columnConfig.colors &&
        Object.values(columnConfig.colors).some(
          (color) => color && color.length > 0,
        );
      if (!hasColumnColors) {
        const defaultColumnColors = initializeDefaultColors(
          columns,
          columnConfig.colors,
        );
        columnConfig.setColors(defaultColumnColors);
      }
    }
  }, [columns, columnConfig, enabled]);
}
