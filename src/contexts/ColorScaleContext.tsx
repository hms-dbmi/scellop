import { scaleLinear } from "@visx/scale";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { createContext, useContext } from "../utils/context";
import {
  HEATMAP_THEMES_LIST,
  HeatmapTheme,
  heatmapThemes,
} from "../utils/heatmap-themes";
import { useMaxCount } from "./DataContext";
import { ScaleLinear } from "./ScaleContext";

// Color context does not have selection
interface ColorScaleContext {
  scale: ScaleLinear<string>;
  percentageScale: ScaleLinear<string>;
  maxValue: number;
  heatmapTheme: HeatmapTheme;
  setHeatmapTheme: (theme: HeatmapTheme) => void;
}
const ColorScaleContext = createContext<ColorScaleContext>("ColorScaleContext");
export const useColorScale = () => useContext(ColorScaleContext);

const colorThresholds = new Array(256).fill(0);

/**
 * Provider which instantiates and manages the scales used for the heatmap.
 */
export function ColorScaleProvider({ children }: PropsWithChildren) {
  const maxCount = useMaxCount();
  const [heatmapTheme, setHeatmapTheme] = useState<HeatmapTheme>(
    HEATMAP_THEMES_LIST[0],
  );

  const colorScaleContext = useMemo(() => {
    const theme = heatmapThemes[heatmapTheme];

    const range = colorThresholds.map((_, idx) => idx / 255);

    const scale = scaleLinear<string>({
      range: range.map((t) => theme(t)),
      domain: range.map((r) => r * maxCount),
    });

    const percentageScale = scaleLinear<string>({
      range: range.map((t) => theme(t)),
      domain: range,
    });

    return {
      scale,
      percentageScale,
      maxValue: maxCount,
      heatmapTheme,
      setHeatmapTheme,
    };
  }, [heatmapTheme, maxCount]);

  return (
    <ColorScaleContext.Provider value={colorScaleContext}>
      {children}
    </ColorScaleContext.Provider>
  );
}
