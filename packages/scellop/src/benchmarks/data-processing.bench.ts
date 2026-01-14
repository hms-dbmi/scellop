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
  generateSyntheticData,
  getDatasetStats,
} from "./fixtures/synthetic-datasets";
import { getBenchmarkDatasets } from "./setup-benchmarks";

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

describe("Data Processing Benchmarks", async () => {
  // BENCHMARK_DATASETS is populated by setup-benchmarks.ts beforeAll hook
  // and includes both synthetic and real-world datasets
  const datasets = await getBenchmarkDatasets();
  console.log(`Running Data Processing Benchmarks on ${datasets.size} datasets`);

  describe("DataMap Creation (Raw Counts)", () => {
    for (const [name, data] of datasets) {
      bench(
        `${name}`,
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
      bench(
        `${name}`,
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
      const store = createDataStore(data);
      const state = store.getState();
      const { rowCounts } = calculateDerivedStates(state);

      bench(
        `${name}`,
        () => {
          calculateRowFractionDataMap(state, rowCounts);
        },
      );
    }
  });

  describe("Log Normalization", () => {
    for (const [name, data] of datasets) {
      bench(
        `${name}`,
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
});
