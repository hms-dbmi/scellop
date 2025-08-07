import {
  interpolateBlues,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOranges,
  interpolatePlasma,
  interpolatePurples,
  interpolateReds,
  interpolateViridis,
  interpolateWarm,
} from "d3";

const invertInterpolation =
  (interpolator: (t: number) => string) => (t: number) =>
    interpolator(1 - t);

export const heatmapThemes = {
  viridis: interpolateViridis,
  inferno: interpolateInferno,
  magma: interpolateMagma,
  plasma: interpolatePlasma,
  cividis: interpolateCividis,
  warm: interpolateWarm,
  cool: interpolateCool,
  cubehelix: interpolateCubehelixDefault,
  greens: interpolateGreens,
  blues: interpolateBlues,
  oranges: interpolateOranges,
  reds: interpolateReds,
  purples: interpolatePurples,
  greys: interpolateGreys,
};

export type HeatmapTheme = keyof typeof heatmapThemes;

export const heatmapThemesInverted = Object.fromEntries(
  Object.entries(heatmapThemes).map(([key, value]) => [
    key,
    invertInterpolation(value),
  ]),
) as Record<HeatmapTheme, (t: number) => string>;

export const HEATMAP_THEMES_LIST = Object.keys(heatmapThemes) as HeatmapTheme[];
