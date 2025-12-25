import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Custom hook to determine if the viewport is mobile-sized.
 * @returns {boolean} - True if the viewport is mobile-sized, false otherwise.
 */
export function useIsMobile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return isMobile;
}
