/**
 * Real-world datasets for benchmarking
 * These are loaded from actual HuBMAP/HCA data sources
 */

import type { ScellopData } from "@scellop/data-loading";

/**
 * Registry of real-world datasets available for benchmarking
 * Add your own datasets here by importing them or providing a loader function
 */
export interface RealWorldDatasetConfig {
  name: string;
  description: string;
  loader: () => Promise<ScellopData> | ScellopData;
}

/**
 * Placeholder for real-world datasets
 * Users can add their actual data loading logic here
 */
export const REAL_WORLD_DATASETS: RealWorldDatasetConfig[] = [
  // Example: HuBMAP Kidney dataset
  // {
  //   name: "hubmap-kidney",
  //   description: "HuBMAP Kidney cell type composition",
  //   loader: async () => {
  //     const { loadHuBMAPData } = await import("@scellop/hubmap-data-loading");
  //     return await loadHuBMAPData(["uuid1", "uuid2", ...]);
  //   },
  // },
];

/**
 * Load a specific real-world dataset by name
 */
export async function loadRealWorldDataset(
  name: string,
): Promise<ScellopData | undefined> {
  const config = REAL_WORLD_DATASETS.find((d) => d.name === name);
  if (!config) {
    throw new Error(`Dataset "${name}" not found in registry`);
  }
  return await config.loader();
}

/**
 * Load all real-world datasets
 */
export async function loadAllRealWorldDatasets(): Promise<
  Map<string, ScellopData>
> {
  const datasets = new Map<string, ScellopData>();

  for (const config of REAL_WORLD_DATASETS) {
    try {
      const data = await config.loader();
      datasets.set(config.name, data);
    } catch (error) {
      console.warn(`Failed to load dataset "${config.name}":`, error);
    }
  }

  return datasets;
}

/**
 * Helper to import real-world datasets from user code
 * Example usage:
 *
 * import { hubmapKidney } from './my-datasets';
 * registerRealWorldDataset({
 *   name: "hubmap-kidney",
 *   description: "HuBMAP Kidney dataset",
 *   loader: () => hubmapKidney
 * });
 */
export function registerRealWorldDataset(config: RealWorldDatasetConfig) {
  REAL_WORLD_DATASETS.push(config);
}
