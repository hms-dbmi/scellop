import { Palette } from "@mui/icons-material";
import {
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { generateCategoricalColors } from "../../utils/categorical-colors";

interface ColorPickerProps {
  /**
   * The current color value
   */
  color?: string;
  /**
   * Callback when a color is selected
   */
  onColorChange: (color: string) => void;
  /**
   * Optional tooltip text
   */
  tooltip?: string;
  /**
   * Size of the color picker square in pixels
   */
  size?: number;
}

// Pre-defined color palette including categorical colors
const COLOR_PALETTE = [
  ...generateCategoricalColors(20), // Generate a good set of categorical colors
  "#FF5722", // Red
  "#E91E63", // Pink
  "#9C27B0", // Purple
  "#673AB7", // Deep Purple
  "#3F51B5", // Indigo
  "#2196F3", // Blue
  "#03A9F4", // Light Blue
  "#00BCD4", // Cyan
  "#009688", // Teal
  "#4CAF50", // Green
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#FFEB3B", // Yellow
  "#FFC107", // Amber
  "#FF9800", // Orange
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#000000", // Black
  "#FFFFFF", // White
];

export function ColorPicker({
  color,
  onColorChange,
  tooltip = "Select color",
  size = 24,
}: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (selectedColor: string) => {
    onColorChange(selectedColor);
    handleClose();
  };

  const handleNativeColorChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedColor = event.target.value;
    onColorChange(selectedColor);
    handleClose();
  };

  const openNativeColorPicker = () => {
    colorInputRef.current?.click();
  };

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            width: size,
            height: size,
            minWidth: size,
            minHeight: size,
            backgroundColor: color || "transparent",
            border: "1px solid",
            borderColor: color ? "divider" : "action.disabled",
            borderRadius: 1,
            "&:hover": {
              backgroundColor: color || "action.hover",
            },
          }}
        >
          {!color && (
            <Palette sx={{ fontSize: 16, color: "action.disabled" }} />
          )}
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={8}
            sx={{
              p: 1,
              maxWidth: 240,
            }}
          >
            {/* Native color picker section */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
                Custom Color
              </Typography>
              <Box
                onClick={openNativeColorPicker}
                sx={{
                  width: "100%",
                  height: 32,
                  backgroundColor: color || "#ffffff",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Click to choose
                </Typography>
              </Box>
              <input
                ref={colorInputRef}
                type="color"
                value={color || "#ffffff"}
                onChange={handleNativeColorChange}
                style={{ display: "none" }}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Preset color palette */}
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              Preset Colors
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {COLOR_PALETTE.map((paletteColor) => (
                <Box
                  key={paletteColor}
                  onClick={() => handleColorSelect(paletteColor)}
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: paletteColor,
                    border: "1px solid",
                    borderColor:
                      paletteColor === color ? "primary.main" : "divider",
                    borderRadius: 0.5,
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.1)",
                      zIndex: 1,
                    },
                    transition: "transform 0.1s ease-in-out",
                  }}
                />
              ))}
              {/* Reset/Clear color option */}
              <Box
                onClick={() => handleColorSelect("")}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: "transparent",
                  border: "1px solid",
                  borderColor: !color ? "primary.main" : "divider",
                  borderRadius: 0.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    transform: "scale(1.1)",
                    zIndex: 1,
                  },
                  transition: "transform 0.1s ease-in-out",
                }}
              >
                <Palette sx={{ fontSize: 12, color: "action.disabled" }} />
              </Box>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
