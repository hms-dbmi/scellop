import { type Theme, ThemeProvider } from "@mui/material/styles";
import type { ScellopTheme } from "@scellop/data-loading";
import { type PropsWithChildren, useMemo } from "react";
import { temporal } from "zundo";
import { createStore } from "zustand";
import { getTheme } from "../utils/theme";
import { createTemporalStoreContext } from "../utils/zustand";
import { useThemeControlIsDisabled } from "./DisabledControlProvider";

interface InitialThemeSetterState {
  initialTheme?: ScellopTheme;
}

interface ThemeSetterState {
  currentTheme: ScellopTheme;
}
interface ThemeSetterActions {
  setTheme: (newTheme: ScellopTheme) => void;
  reset: () => void;
}

interface ThemeSetterStoreType extends ThemeSetterState, ThemeSetterActions {}

const themeSetterStore = ({
  initialTheme = "light",
}: InitialThemeSetterState) => {
  return createStore<ThemeSetterStoreType>()(
    temporal((set) => ({
      currentTheme: initialTheme,
      setTheme: (newTheme: ScellopTheme) => {
        set({ currentTheme: newTheme });
      },
      reset: () => {
        set({ currentTheme: initialTheme });
      },
    })),
  );
};

const [ThemeSetterContextProvider, useSetTheme, , useThemeHistory] =
  createTemporalStoreContext<ThemeSetterStoreType, InitialThemeSetterState>(
    themeSetterStore,
    "Theme Setter Store",
  );

export { useSetTheme, useThemeHistory };

/**
 * Provider which manages the theme to use for the visualization.
 * @param props.theme - The initial theme to use.
 */
export function ScellopThemeProvider({
  children,
  theme: initialTheme,
  customTheme,
}: PropsWithChildren<{ theme: ScellopTheme; customTheme?: Theme }>) {
  const themeIsDisabled = useThemeControlIsDisabled();
  return (
    <ThemeSetterContextProvider
      initialTheme={initialTheme}
      reactive={themeIsDisabled}
    >
      <MuiThemeProvider customTheme={customTheme}>{children}</MuiThemeProvider>
    </ThemeSetterContextProvider>
  );
}

function MuiThemeProvider({
  children,
  customTheme,
}: PropsWithChildren<{ customTheme?: Theme }>) {
  const { currentTheme } = useSetTheme();
  const theme = useMemo(() => {
    if (customTheme) {
      return { ...getTheme(currentTheme), ...customTheme };
    }
    return getTheme(currentTheme);
  }, [currentTheme, customTheme]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
