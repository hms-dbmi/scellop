import type { StringLike, scaleBand, scaleLinear } from "@visx/scale";

export type VerticalPanelSection = "top" | "middle" | "bottom";
export type HorizontalPanelSection = "left" | "center" | "right";
export type MappedPanelSection =
  `${HorizontalPanelSection}_${VerticalPanelSection}`;

export type ScaleLinear<T> = ReturnType<typeof scaleLinear<T>>;
export type ScaleBand<T extends StringLike> = ReturnType<
  typeof scaleBand<T>
> & {
  lookup: (num: number) => string;
  bandwidth: (item?: string) => number;
};
