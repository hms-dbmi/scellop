export const GRAPH_TYPES = [
  "Bars",
  "Stacked Bars (Continuous)",
  "Stacked Bars (Categorical)",
  "Violins",
] as const;
export type GraphType = (typeof GRAPH_TYPES)[number];

export const GRAPH_TYPE_DESCRIPTIONS: Record<GraphType, string> = {
  Bars: "Standard bar charts displaying the total values for each category.",
  "Stacked Bars (Continuous)":
    "Stacked bar charts showing the breakdown of values within each category, using colors that match the heatmap.",
  "Stacked Bars (Categorical)":
    "Stacked bar charts showing the breakdown of values within each category, using colors assigned to the segments that make up each bar.",
  Violins:
    "Violin plots displaying the distribution of values for each category.",
};
