import { Download } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import html2canvas from "html2canvas";
import React, { useCallback, useEffect, useState } from "react";
import MenuItemWithDescription from "../../components/MenuItemWithDescription";
import { useParentRef } from "../../contexts/ContainerRefContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";

// Resolution options configuration
const resolutionOptions = [
  {
    value: 1,
    title: "1x (Standard)",
    description: "Original size, fastest export",
  },
  {
    value: 2,
    title: "2x (High Quality)",
    description: "Recommended for most uses",
  },
  {
    value: 3,
    title: "3x (Print Quality)",
    description: "Higher quality, larger file size",
  },
  {
    value: 4,
    title: "4x (Ultra High)",
    description: "Maximum quality, slowest export",
  },
];

// Helper function to get resolution description with dimensions
const getResolutionDescription = (
  scale: number,
  baseDescription: string,
  dimensions?: { width: number; height: number } | null,
) => {
  if (!dimensions) return baseDescription;
  const width = Math.round(dimensions.width * scale);
  const height = Math.round(dimensions.height * scale);
  return `${baseDescription} (${width} × ${height} pixels)`;
};

/**
 * ExportControls component provides functionality to export the visualization as PNG
 */
export default function ExportControls() {
  const parentRef = useParentRef();
  const trackEvent = useTrackEvent();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filename, setFilename] = useState("scellop-visualization");
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [resolution, setResolution] = useState<number>(2);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Update dimensions when parent ref changes
  useEffect(() => {
    const updateDimensions = () => {
      if (parentRef?.current) {
        const rect = parentRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateDimensions();

    // Update dimensions on window resize
    const handleResize = () => updateDimensions();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [parentRef]);

  const exportAsPNG = useCallback(async () => {
    if (!parentRef?.current) {
      setExportError("Unable to find visualization container");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      trackEvent?.("Export Visualization", "png");

      // Configure html2canvas options for high quality export
      const canvas = await html2canvas(parentRef.current, {
        backgroundColor: null, // Preserve transparency
        scale: resolution, // Configurable resolution
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 30000,
        // Include all child elements
        ignoreElements: (element) => {
          // Optionally ignore certain elements like tooltips or modal overlays
          return (
            element.getAttribute("role") === "tooltip" ||
            element.classList.contains("MuiDialog-root") ||
            element.classList.contains("MuiModal-root") ||
            element.classList.contains("MuiFab-root")
          );
        },
      });

      // Create download link
      const link = document.createElement("a");
      const baseFilename = filename.trim() || "scellop-visualization";
      const timestamp = includeTimestamp
        ? `-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`
        : "";
      link.download = `${baseFilename}${timestamp}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      trackEvent?.("export_visualization_success", "png");
    } catch (error) {
      console.error("Failed to export visualization:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setExportError(`Export failed: ${errorMessage}`);
      trackEvent?.("export_visualization_error", errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [parentRef, trackEvent, filename, includeTimestamp, resolution]);

  return (
    <Stack spacing={3} alignItems="start" width="100%">
      <Typography variant="h6" component="h3">
        Export Visualization
      </Typography>

      <Typography variant="body2" color="text.secondary">
        The exported image will include all visible elements with their current
        settings.
      </Typography>

      {/* Filename Configuration */}
      <Stack direction="column" spacing={1} width="100%">
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            variant="outlined"
            sx={{ flex: 1, minWidth: 200 }}
            placeholder="scellop-visualization"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
              />
            }
            label="Include timestamp"
          />
        </Stack>
        <FormHelperText>
          Customize the exported file name. The timestamp will be automatically
          added if enabled to prevent filename conflicts.
        </FormHelperText>
      </Stack>

      {/* Resolution Configuration */}
      <Stack direction="column" spacing={1} width="100%">
        <FormControl fullWidth>
          <InputLabel id="export-resolution-select-label">
            Export Resolution
          </InputLabel>
          <Select
            labelId="export-resolution-select-label"
            id="export-resolution-select"
            value={String(resolution)}
            onChange={(e: SelectChangeEvent) =>
              setResolution(Number(e.target.value))
            }
            variant="outlined"
            label="Export Resolution"
            renderValue={(value) => {
              const selectedOption = resolutionOptions.find(
                (option) => option.value === Number(value),
              );
              return selectedOption ? selectedOption.title : value;
            }}
          >
            {resolutionOptions.map((option) => (
              <MenuItemWithDescription
                key={option.value}
                value={option.value}
                title={option.title}
                description={getResolutionDescription(
                  option.value,
                  option.description,
                  dimensions,
                )}
              />
            ))}
          </Select>
        </FormControl>
        <FormHelperText>
          Select the export resolution. Higher resolutions produce sharper
          images but take longer to generate and result in larger file sizes.
        </FormHelperText>
      </Stack>

      <Box width="100%">
        <Button
          variant="contained"
          onClick={exportAsPNG}
          disabled={isExporting || !parentRef?.current}
          startIcon={
            isExporting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Download />
            )
          }
          fullWidth
          size="large"
        >
          {isExporting ? "Exporting..." : "Export as PNG"}
        </Button>
      </Box>

      {exportError && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {exportError}
        </Alert>
      )}

      <Alert
        severity="info"
        sx={{
          width: "100%",
          "& .MuiAlert-message": {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        }}
      >
        <AlertTitle>Tips for best results</AlertTitle>
        <Typography
          variant="body2"
          component="ul"
          sx={{ margin: 0, paddingLeft: 2 }}
        >
          <li>Ensure all data is fully loaded before exporting</li>
          <li>
            Higher resolution settings will produce sharper images but may take
            longer to process
          </li>
        </Typography>
      </Alert>
    </Stack>
  );
}
