import { ObsSets } from "./types";

/**
 * Extract counts and metadata from ObsSets data structure.
 * Used for processing AnnData/Zarr format data from HuBMAP.
 *
 * @param obsSetsList - List of ObsSets from multiple datasets
 * @param rowNames - Names of the datasets (used as row identifiers)
 * @returns Object containing counts and metadata dictionaries
 */
export function getCountsAndMetadataFromObsSetsList(
  obsSetsList: ObsSets[],
  rowNames: string[],
) {
  const counts: Record<string, Record<string, number>> = {};
  // Record from dataset name to metadata name to metadata value
  const metadata: Record<string, Record<string, string | number>> = {};

  for (let i = 0; i < rowNames.length; i++) {
    // First tree is the CL IDs
    counts[rowNames[i]] = getCountsPerType(obsSetsList[i].tree[0].children);
    // Second tree should be the human-readable cell labels, if present
    // Other metadata may be present in subsequent trees
    if (obsSetsList[i].tree.length > 1) {
      for (let j = 1; j < obsSetsList[i].tree.length; j++) {
        // Second tree onwards are metadata e.g. labels
        const metadataName = obsSetsList[i].tree[j].name;
        const countsTree = obsSetsList[i].tree[0].children;
        const metadataSets = obsSetsList[i].tree[j].children;

        for (const { name: labelName, set: labelCells } of metadataSets) {
          // Create a set of cell IDs contained in the label
          const labelCellIds = new Set(labelCells.map((c) => c[0]));
          // Look for a matching set of cell IDs in the counts tree
          for (const count of countsTree) {
            // As a heuristic, compare the length of the sets first
            if (count.set.length === labelCells.length) {
              // If the lengths are equal, compare the cell IDs
              const countCellIds = new Set(count.set.map((c) => c[0]));
              let equal = true;
              // Check if all cell IDs in the count set are in the label set
              for (const cellId of countCellIds) {
                if (!labelCellIds.has(cellId)) {
                  equal = false;
                  break;
                }
              }
              // If the sets are equal, add the mapping to the metadata
              if (equal) {
                const countName = count.name;
                if (!metadata[countName]) {
                  metadata[countName] = {};
                }
                metadata[countName][metadataName] = labelName;
                break;
              }
            }
          }
        }
      }
    }
  }
  return { counts, metadata };
}

/**
 * Get the counts per cell type from ObsSets tree structure
 */
function getCountsPerType(o: ObsSets["tree"][0]["children"]) {
  const dict = new Object() as Record<string, number>;
  for (const t of o) {
    dict[t.name] = t.set.length;
  }
  return dict;
}
