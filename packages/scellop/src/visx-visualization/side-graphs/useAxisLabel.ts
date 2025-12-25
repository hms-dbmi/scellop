import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useColumns, useData, useRows } from "../../contexts/DataContext";

type AxisType = "x" | "y";

export function useAxisLabel(axis: AxisType) {
  const columnConfig = useColumnConfig();
  const rowConfig = useRowConfig();
  const axisConfig = axis === "x" ? columnConfig : rowConfig;
  const { label } = axisConfig;

  const items = axis === "x" ? useColumns() : useRows();
  const filteredCount = items.length;
  const allCount = useData((s) =>
    axis === "x" ? s.columnOrder.length : s.rowOrder.length,
  );

  const labelWithCounts =
    filteredCount !== allCount
      ? `${label} (${filteredCount}/${allCount})`
      : `${label} (${allCount})`;

  return labelWithCounts;
}
