/**
 * Data Processing Benchmarks
 * Tests performance of Zustand selectors, data transformations, and derived state calculations
 */

import type { ScellopData } from "@scellop/data-loading";
import { bench, describe } from "vitest";
import { temporal } from "zundo";
import { createStore } from "zustand";
import type { DatasetConfig } from "./fixtures/synthetic-datasets";
import {
  generateAllDatasets,
  generateSyntheticData,
  getDatasetStats,
} from "./fixtures/synthetic-datasets";

// Import the same memoized selectors used in DataContext
// We'll recreate them here for benchmarking
type DataMapKey = `${string}-${string}`;

interface DataContextStore {
  data: ScellopData;
  removedRows: Set<string>;
  removedColumns: Set<string>;
  rowOrder: string[];
  columnOrder: string[];
  filteredRows: Set<string>;
  filteredColumns: Set<string>;
}

function createDataStore(data: ScellopData) {
  return createStore<DataContextStore>()(
    temporal(
      () => ({
        data,
        removedRows: new Set<string>(),
        removedColumns: new Set<string>(),
        rowOrder: data.rowNames,
        columnOrder: data.colNames,
        filteredRows: new Set<string>(),
        filteredColumns: new Set<string>(),
      }),
      { limit: 100 },
    ),
  );
}

// Recreate the memoized selectors from DataContext
function calculateDataMap(state: DataContextStore): Record<DataMapKey, number> {
  const dataMap: Record<DataMapKey, number> = {};
  state.data.countsMatrix.forEach(([row, col, value]) => {
    dataMap[`${row}-${col}`] = value;
  });
  return dataMap;
}

function calculateDerivedStates(state: DataContextStore) {
  const rowCounts: Record<string, number> = {};
  const columnCounts: Record<string, number> = {};
  const rowMaxes: Record<string, number> = {};
  const columnMaxes: Record<string, number> = {};
  let maxCount = 0;

  state.data.countsMatrix.forEach(([row, col, value]) => {
    rowCounts[row] = (rowCounts[row] || 0) + value;
    columnCounts[col] = (columnCounts[col] || 0) + value;
    rowMaxes[row] = Math.max(rowMaxes[row] || 0, value);
    columnMaxes[col] = Math.max(columnMaxes[col] || 0, value);
    maxCount = Math.max(maxCount, value);
  });

  return { rowCounts, columnCounts, rowMaxes, columnMaxes, maxCount };
}

function calculateRowFractionDataMap(
  state: DataContextStore,
  rowCounts: Record<string, number>,
): Record<DataMapKey, number> {
  const dataMap: Record<DataMapKey, number> = {};
  state.data.countsMatrix.forEach(([row, col, value]) => {
    dataMap[`${row}-${col}`] = value / rowCounts[row];
  });
  return dataMap;
}

function calculateLogDataMap(
  state: DataContextStore,
): Record<DataMapKey, number> {
  const dataMap: Record<DataMapKey, number> = {};
  state.data.countsMatrix.forEach(([row, col, value]) => {
    dataMap[`${row}-${col}`] = Math.log(value + 1);
  });
  return dataMap;
}

describe("Data Processing Benchmarks", () => {
  const datasets = generateAllDatasets();

  describe("DataMap Creation (Raw Counts)", () => {
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);
      bench(
        `${name} (${stats.rows}×${stats.cols}, ${stats.nonZeroCells} cells)`,
        () => {
          const store = createDataStore(data);
          const state = store.getState();
          calculateDataMap(state);
        },
      );
    }
  });

  describe("Derived States Calculation", () => {
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);
      bench(
        `${name} (${stats.rows}×${stats.cols}, ${stats.nonZeroCells} cells)`,
        () => {
          const store = createDataStore(data);
          const state = store.getState();
          calculateDerivedStates(state);
        },
      );
    }
  });

  describe("Row Fraction Normalization", () => {
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);
      const store = createDataStore(data);
      const state = store.getState();
      const { rowCounts } = calculateDerivedStates(state);

      bench(
        `${name} (${stats.rows}×${stats.cols}, ${stats.nonZeroCells} cells)`,
        () => {
          calculateRowFractionDataMap(state, rowCounts);
        },
      );
    }
  });

  describe("Log Normalization", () => {
    for (const [name, data] of datasets) {
      const stats = getDatasetStats(data);
      bench(
        `${name} (${stats.rows}×${stats.cols}, ${stats.nonZeroCells} cells)`,
        () => {
          const store = createDataStore(data);
          const state = store.getState();
          calculateLogDataMap(state);
        },
      );
    }
  });

  describe("Metadata Processing", () => {
    for (const [name, data] of datasets) {
      if (!data.metadata) continue;

      bench(`Extract row metadata keys - ${name}`, () => {
        const metadataValues = Object.values(data.metadata?.rows || {});
        const set = metadataValues.reduce<Set<string>>(
          (acc: Set<string>, curr: object) => {
            Object.keys(curr).forEach((key) => {
              acc.add(key);
            });
            return acc;
          },
          new Set<string>(),
        );
        Array.from(set);
      });

      bench(`Extract column metadata keys - ${name}`, () => {
        const metadataValues = Object.values(data.metadata?.cols || {});
        const set = metadataValues.reduce<Set<string>>(
          (acc: Set<string>, curr: object) => {
            Object.keys(curr).forEach((key) => {
              acc.add(key);
            });
            return acc;
          },
          new Set<string>(),
        );
        Array.from(set);
      });
    }
  });

  describe("Scalability Analysis", () => {
    const scaleConfigs: DatasetConfig[] = [
      { name: "scale-10", rowCount: 10, colCount: 10, density: 0.8 },
      { name: "scale-50", rowCount: 50, colCount: 50, density: 0.6 },
      { name: "scale-100", rowCount: 100, colCount: 100, density: 0.4 },
      { name: "scale-200", rowCount: 200, colCount: 200, density: 0.3 },
      { name: "scale-500", rowCount: 500, colCount: 500, density: 0.2 },
    ];

    describe("DataMap creation scales with cell count", () => {
      for (const config of scaleConfigs) {
        const data = generateSyntheticData(config);
        const stats = getDatasetStats(data);
        bench(
          `${config.rowCount}×${config.colCount} = ${stats.nonZeroCells} cells`,
          () => {
            const store = createDataStore(data);
            const state = store.getState();
            calculateDataMap(state);
          },
        );
      }
    });

    describe("DerivedStates scales with cell count", () => {
      for (const config of scaleConfigs) {
        const data = generateSyntheticData(config);
        const stats = getDatasetStats(data);
        bench(
          `${config.rowCount}×${config.colCount} = ${stats.nonZeroCells} cells`,
          () => {
            const store = createDataStore(data);
            const state = store.getState();
            calculateDerivedStates(state);
          },
        );
      }
    });

    describe("Asymmetrical dataset performance", () => {
      const asymmetricalConfigs: DatasetConfig[] = [
        { name: "square-50", rowCount: 50, colCount: 50, density: 0.3 },
        { name: "wide-50x500", rowCount: 50, colCount: 500, density: 0.3 },
        { name: "tall-500x50", rowCount: 500, colCount: 50, density: 0.3 },
        {
          name: "extraWide-20x1000",
          rowCount: 20,
          colCount: 1000,
          density: 0.25,
        },
        {
          name: "extraTall-1000x20",
          rowCount: 1000,
          colCount: 20,
          density: 0.25,
        },
      ];

      for (const config of asymmetricalConfigs) {
        const data = generateSyntheticData(config);
        const stats = getDatasetStats(data);
        bench(
          `${config.name}: ${stats.rows}×${stats.cols} (${stats.nonZeroCells} cells)`,
          () => {
            const store = createDataStore(data);
            const state = store.getState();
            calculateDataMap(state);
            calculateDerivedStates(state);
          },
        );
      }
    });
  });
});
