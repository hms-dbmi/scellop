export const NORMALIZATIONS = ["None", "Row", "Column", "Log"] as const;
export type Normalization = (typeof NORMALIZATIONS)[number];
