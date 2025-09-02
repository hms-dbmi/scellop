import { Download } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import html2canvas from "html2canvas";
import React, { useCallback, useState } from "react";
import { useParentRef } from "../../contexts/ContainerRefContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";

/**
 * ExportControls component provides functionality to export the visualization as PNG
 */
export default function ExportControls() {
  const parentRef = useParentRef();
  const trackEvent = useTrackEvent();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
        scale: 2, // Higher resolution
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
      link.download = `cellpop-visualization-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
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
  }, [parentRef, trackEvent]);

  return (
    <Stack spacing={3} alignItems="start" width="100%">
      <Typography variant="h6" component="h3">
        Export Visualization
      </Typography>

      <Typography variant="body2" color="text.secondary">
        The exported image will include all visible elements with their current
        settings.
      </Typography>

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
            The export will capture the visualization at 2x resolution for crisp
            quality
          </li>
        </Typography>
      </Alert>
    </Stack>
  );
}
