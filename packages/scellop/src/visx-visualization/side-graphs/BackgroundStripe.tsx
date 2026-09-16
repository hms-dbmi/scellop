import { useTheme } from "@mui/material";
import type React from "react";
import { useMemo } from "react";
import { useColumns, useRows } from "../../contexts/DataContext";

interface BackgroundStripeProps {
  x: number;
  y: number;
  height: number | string;
  width: number | string;
  value: string;
  onMouseOver?: (e: React.MouseEvent<SVGRectElement>) => void;
  onMouseMove?: (e: React.MouseEvent<SVGRectElement>) => void;
  onMouseOut?: (e: React.MouseEvent<SVGRectElement>) => void;
  orientation: "rows" | "columns";
}

function useStripeColor(index: number) {
  const theme = useTheme();
  return useMemo(() => {
    const currentTheme = theme.palette.mode;
    const stripeColor =
      currentTheme === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[50];
    return index % 2 === 0 ? theme.palette.background.default : stripeColor;
  }, [index, theme]);
}

function useCurrentValues(orientation: string) {
  const rows = useRows();
  const columns = useColumns();
  return orientation === "vertical" ? columns : rows;
}

function useIndex(value: string, orientation: "rows" | "columns") {
  return useCurrentValues(orientation).indexOf(value);
}

export function BackgroundStripe({
  value,
  orientation,
  ...props
}: BackgroundStripeProps) {
  const index = useIndex(value, orientation);
  const fill = useStripeColor(index);
  return <rect fill={fill} {...props} />;
}
