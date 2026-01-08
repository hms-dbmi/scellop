/**
 * Synthetic datasets for benchmarking
 * These are procedurally generated to test different data sizes and characteristics
 */

import type { ScellopData } from "@scellop/data-loading";

export interface DatasetConfig {
  name: string;
  rowCount: number;
  colCount: number;
  density: number; // 0-1, percentage of non-zero cells
  withMetadata?: boolean;
}

/**
 * Generates a synthetic dataset with specified dimensions and density
 */
export function generateSyntheticData(config: DatasetConfig): ScellopData {
  const { rowCount, colCount, density, withMetadata = true } = config;

  const rowNames = Array.from({ length: rowCount }, (_, i) => `row_${i}`);
  const colNames = Array.from({ length: colCount }, (_, i) => `col_${i}`);

  const countsMatrix: [string, string, number][] = [];

  // Generate sparse counts based on density
  for (const row of rowNames) {
    for (const col of colNames) {
      if (Math.random() < density) {
        const count = Math.floor(Math.random() * 1000) + 1;
        countsMatrix.push([row, col, count]);
      }
    }
  }

  const data: ScellopData = {
    rowNames,
    colNames,
    countsMatrixOrder: ["row", "col", "value"],
    countsMatrix,
    metadata: {},
  };

  // Add metadata if requested
  if (withMetadata) {
    const tissueTypes = ["brain", "liver", "kidney", "heart", "lung"];
    const conditions = ["control", "treated", "diseased"];
    const donors = ["donor1", "donor2", "donor3", "donor4", "donor5"];

    data.metadata = {
      rows: Object.fromEntries(
        rowNames.map((name) => [
          name,
          {
            tissue: tissueTypes[Math.floor(Math.random() * tissueTypes.length)],
            condition:
              conditions[Math.floor(Math.random() * conditions.length)],
            donor: donors[Math.floor(Math.random() * donors.length)],
            batch: Math.floor(Math.random() * 3) + 1,
          },
        ]),
      ),
      cols: Object.fromEntries(
        colNames.map((name) => [
          name,
          {
            cellType: `type_${Math.floor(Math.random() * 10)}`,
            marker: `marker_${Math.floor(Math.random() * 5)}`,
            confidence: Math.random(),
          },
        ]),
      ),
    };
  }

  return data;
}

/**
 * Predefined dataset configurations for benchmarking
 */
export const DATASET_CONFIGS: DatasetConfig[] = [
  {
    name: "tiny",
    rowCount: 10,
    colCount: 10,
    density: 0.8,
    withMetadata: true,
  },
  {
    name: "small",
    rowCount: 50,
    colCount: 50,
    density: 0.6,
    withMetadata: true,
  },
  {
    name: "medium",
    rowCount: 100,
    colCount: 100,
    density: 0.4,
    withMetadata: true,
  },
  {
    name: "large",
    rowCount: 200,
    colCount: 300,
    density: 0.3,
    withMetadata: true,
  },
  {
    name: "huge",
    rowCount: 500,
    colCount: 500,
    density: 0.2,
    withMetadata: true,
  },
  {
    name: "xlarge",
    rowCount: 1000,
    colCount: 1000,
    density: 0.1,
    withMetadata: true,
  },
  // Asymmetrical datasets
  {
    name: "wide",
    rowCount: 50,
    colCount: 500,
    density: 0.3,
    withMetadata: true,
  },
  {
    name: "tall",
    rowCount: 500,
    colCount: 50,
    density: 0.3,
    withMetadata: true,
  },
  {
    name: "extraWide",
    rowCount: 20,
    colCount: 1000,
    density: 0.25,
    withMetadata: true,
  },
  {
    name: "extraTall",
    rowCount: 1000,
    colCount: 20,
    density: 0.25,
    withMetadata: true,
  },
];

/**
 * Generates all predefined datasets
 */
export function generateAllDatasets(): Map<string, ScellopData> {
  const datasets = new Map<string, ScellopData>();
  for (const config of DATASET_CONFIGS) {
    datasets.set(config.name, generateSyntheticData(config));
  }
  return datasets;
}

/**
 * Returns stats about a dataset for reporting
 */
export function getDatasetStats(data: ScellopData) {
  const cellCount = data.rowNames.length * data.colNames.length;
  const nonZeroCells = data.countsMatrix.length;
  const density = nonZeroCells / cellCount;

  return {
    rows: data.rowNames.length,
    cols: data.colNames.length,
    totalCells: cellCount,
    nonZeroCells,
    density: (density * 100).toFixed(1) + "%",
    hasMetadata: !!data.metadata,
  };
}
