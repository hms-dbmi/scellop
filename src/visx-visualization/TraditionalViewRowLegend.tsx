import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { useRowConfig } from "../contexts/AxisConfigContext";
import { useData } from "../contexts/DataContext";
import { getColorForValue } from "../utils/categorical-colors";

interface TraditionalViewRowLegendProps {
  width: number;
  height: number;
}

export default function TraditionalViewRowLegend({
  width,
  height,
}: TraditionalViewRowLegendProps) {
  const theme = useTheme();
  const rowConfig = useRowConfig();
  const rows = useData((s) => s.rowOrder);
  const removedRows = useData((s) => s.removedRows);
  const filteredRows = useData((s) => s.filteredRows);

  // Get visible rows (exclude removed and filtered)
  const visibleRows = rows.filter(
    (row) => !removedRows.has(row) && !filteredRows.has(row),
  );

  // Get colors for each row
  const rowsWithColors = visibleRows.map((row) => ({
    name: row,
    color: getColorForValue(row, rows, rowConfig.colors),
  }));

  console.log("TraditionalViewRowLegend render", { width, height });

  if (visibleRows.length === 0) {
    console.log("No visible rows, skipping legend render");
    return null;
  }

  // Calculate layout - try to fit in multiple columns if there's enough width
  const itemMinWidth = 120; // Minimum width per legend item
  const itemHeight = 24; // Height per legend item
  const padding = 16;
  const gap = 4;

  // Calculate how many columns we can fit
  const availableWidth = width - padding * 2;
  const maxColumns = Math.max(1, Math.floor(availableWidth / itemMinWidth));
  const actualColumns = Math.min(maxColumns, visibleRows.length);

  // Calculate rows needed
  const itemsPerColumn = Math.ceil(visibleRows.length / actualColumns);
  const totalHeight = itemsPerColumn * itemHeight + (itemsPerColumn - 1) * gap;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        zIndex: 1000,
      }}
    >
      {/* Legend Title */}
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          my: 1,
          fontWeight: 500,
        }}
      >
        {rowConfig.label}s
      </Typography>

      {/* Legend Items Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${actualColumns}, 1fr)`,
          gap: `${gap}px`,
          maxHeight: height - 32, // Account for title and padding
          overflowY: totalHeight > height - 40 ? "auto" : "visible",
          width: "calc(100% - 16px)",
          justifyContent: "center",
        }}
      >
        {rowsWithColors.map(({ name, color }) => (
          <Box
            key={name}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0, // Allow text to truncate
              p: 0.25,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Color indicator */}
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: color,
                borderRadius: 1,
                flexShrink: 0,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            {/* Row name */}
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
              }}
              title={name} // Show full name on hover
            >
              {name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
