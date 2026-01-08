/**
 * Benchmark Fixtures
 * Exports all dataset generation utilities
 */

export {
  loadAllRealWorldDatasets,
  loadRealWorldDataset,
  REAL_WORLD_DATASETS,
  type RealWorldDatasetConfig,
  registerRealWorldDataset,
} from "./real-world-datasets";
export {
  DATASET_CONFIGS,
  type DatasetConfig,
  generateAllDatasets,
  generateSyntheticData,
  getDatasetStats,
} from "./synthetic-datasets";
