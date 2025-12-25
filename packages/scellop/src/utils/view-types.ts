export const VIEW_TYPES = ["default", "traditional"] as const;
export type ViewType = (typeof VIEW_TYPES)[number];
