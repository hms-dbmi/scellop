import { scaleLinear } from "@visx/scale";
import { type PropsWithChildren, useMemo, useState } from "react";
import useBoolean from "../hooks/useBoolean";
import { createContext, useContext } from "../utils/context";
import {
  HEATMAP_THEMES_LIST,
  type HeatmapTheme,
  heatmapThemes,
  heatmapThemesInverted,
} from "../utils/heatmap-themes";
import { useMaxCount } from "./DataContext";
import type { ScaleLinear } from "./types";

// Color context does not have selection
interface ColorScaleContext {
  countsScale: ScaleLinear<string>;
  percentageScale: ScaleLinear<string>;
  logScale: ScaleLinear<string>;
  maxValue: number;
  maxLogValue: number;
  heatmapTheme: HeatmapTheme;
  setHeatmapTheme: (theme: HeatmapTheme) => void;
  isInverted: boolean;
  toggleInvert: () => void;
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
  const [isInverted, , , toggleInvert] = useBoolean(false);

  const colorScaleContext = useMemo(() => {
    const themeList = isInverted ? heatmapThemesInverted : heatmapThemes;
    const theme = themeList[heatmapTheme];

    const domain = colorThresholds.map((_, idx) => idx / 255);

    const range = domain.map(theme);

    const countsScale = scaleLinear<string>({
      range,
      domain: domain.map((r) => r * maxCount),
    });

    const percentageScale = scaleLinear<string>({
      range,
      domain,
    });

    const maxLogCount = Math.log(maxCount + 1);
    const logScale = scaleLinear<string>({
      range,
      domain: domain.map((r) => r * maxLogCount),
    });

    return {
      countsScale,
      percentageScale,
      logScale,
      maxValue: maxCount,
      maxLogValue: maxLogCount,
      heatmapTheme,
      setHeatmapTheme,
      isInverted,
      toggleInvert,
    } satisfies ColorScaleContext;
  }, [heatmapTheme, maxCount, isInverted, toggleInvert]);

  return (
    <ColorScaleContext.Provider value={colorScaleContext}>
      {children}
    </ColorScaleContext.Provider>
  );
}
