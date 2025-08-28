export const NORMALIZATIONS = ["None", "Row", "Column", "Log"] as const;
export type Normalization = (typeof NORMALIZATIONS)[number];

export const NORMALIZATION_DESCRIPTIONS: Record<Normalization, string> = {
  None: "No normalization applied.",
  Row: "Display each cell's counts as a percentage of the total counts in the row.",
  Column:
    "Display each cell's counts as a percentage of the total counts in the column.",
  Log: "Display the log counts of each cell.",
};
