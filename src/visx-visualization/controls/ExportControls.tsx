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
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import html2canvas from "html2canvas";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParentRef } from "../../contexts/ContainerRefContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { UserAgentTester } from "../../utils/user-agent";

/**
 * Browsers have different maximum canvas dimensions, so we detect the browser
 * to determine the appropriate maximum canvas size.
 * Source: https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 * @param navigatorString User agent string to analyze - defaults to current browser, useful for testing
 * @returns Maximum canvas dimension (width or height) supported by the browser
 */
const getMaxCanvasSize = (navigatorString = navigator.userAgent) => {
  const ua = new UserAgentTester(navigatorString);

  switch (true) {
    case ua.isMobile():
      if (ua.isChrome()) {
        if (ua.getChromeVersion() >= 91) {
          return 65535; // Mobile Chrome 91+ increased max canvas size
        }
        return 32767; // Older Mobile Chrome max canvas size
      }
      return 4096; // Conservative size for mobile safari, which only supports 4096 x 4096 exports
    case ua.isChrome():
      if (ua.getChromeVersion() >= 73) {
        // if version 73+, Chrome increased max canvas size to 65535
        return 65535;
      }
      // Fall back to previous max size for older versions
      return 32767;
    case ua.isFirefox():
      return 32767; // Firefox max canvas size
    case ua.isSafari():
      return 16384; // Safari max canvas size is reported as 4,194,303, but actual limit is lower
    case ua.isEdge():
      if (ua.getEdgeVersion() >= 79) {
        return 65535; // Newer Edge versions based on Chromium match new Chrome limits
      }
      return 16384; // Edge max canvas size for older versions
    default:
      return 16384; // Fallback conservative value that works for all browsers newer than IE 10
  }
};

/**
 * Get maximum canvas area supported by the browser
 * Source: https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 * @param navigatorString User agent string to analyze - defaults to current browser, useful for testing
 * @returns Maximum total canvas area for the browser
 */
const getMaxCanvasArea = (navigatorString = navigator.userAgent) => {
  const ua = new UserAgentTester(navigatorString);
  switch (true) {
    case ua.isMobile():
      if (ua.isChrome() && ua.isAndroid()) {
        const isNewChrome = ua.getChromeVersion() >= 91;
        switch (ua.getAndroidVersion()) {
          case 5:
            return (isNewChrome ? 11180 : 11402) ** 2;
          case 6:
            return (isNewChrome ? 16384 : 10836) ** 2;
          case 7:
            return 14188 ** 2;
          default:
            return 16384 ** 2;
        }
      }
      return 4096 ** 2; // Mobile Safari max canvas area

    case ua.isChrome():
      return 16384 ** 2;
    case ua.isFirefox():
      if (ua.getFirefoxVersion() >= 122) {
        return 23168 ** 2; // Newer Firefox versions increased max canvas area
      }
      return 11180 ** 2; // Older Firefox max canvas area
    case ua.isSafari():
      return 16384 ** 2;
    case ua.isEdge():
      return 16384 ** 2;
    default:
      return 8192 ** 2; // Fallback conservative value that works for all browsers
  }
};

/**
 * ExportControls component provides functionality to export the visualization as PNG
 */
export default function ExportControls() {
  const visualizationContainerRef = useParentRef();
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

  // Calculate maximum safe resolution based on browser canvas limits
  const maxResolution = useMemo(() => {
    if (!dimensions) return 5; // Default fallback

    const maxSize = getMaxCanvasSize();
    const maxArea = getMaxCanvasArea();

    // Calculate max resolution based on dimension constraints
    const maxFromSize = Math.floor(
      maxSize / Math.max(dimensions.width, dimensions.height),
    );

    // Calculate max resolution based on area constraints
    const maxFromArea = Math.floor(
      Math.sqrt(maxArea / (dimensions.width * dimensions.height)),
    );

    // Use the more restrictive limit, with a minimum of 1 and reasonable upper bound
    return Math.max(1, Math.min(maxFromSize, maxFromArea, 100));
  }, [dimensions]);

  // Generate slider marks based on max resolution
  const sliderMarks = useMemo(() => {
    const marks = [{ value: 1, label: "1x" }];

    // Add intermediate marks
    const step = Math.max(1, Math.floor(maxResolution / 5));
    for (let i = step; i < maxResolution; i += step) {
      if (i > 1) {
        marks.push({ value: i, label: `${i}x` });
      }
    }

    // Always add the max value
    if (maxResolution > 1) {
      marks.push({ value: maxResolution, label: `${maxResolution}x` });
    }

    return marks;
  }, [maxResolution]);

  // Update dimensions when parent ref changes
  useEffect(() => {
    const updateDimensions = () => {
      if (visualizationContainerRef?.current) {
        const rect = visualizationContainerRef.current.getBoundingClientRect();
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
  }, [visualizationContainerRef]);

  const exportAsPNG = useCallback(async () => {
    if (!visualizationContainerRef?.current) {
      setExportError("Unable to find visualization container");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      trackEvent?.("Export Visualization", "png");

      const canvasElement = new HTMLCanvasElement();

      // Configure html2canvas options for high quality export
      const canvas = await html2canvas(visualizationContainerRef.current, {
        backgroundColor: null, // Preserve transparency
        scale: resolution, // Configurable resolution
        canvas: canvasElement,
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 0,
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
  }, [
    visualizationContainerRef,
    trackEvent,
    filename,
    includeTimestamp,
    resolution,
  ]);

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
          <Typography variant="body2" gutterBottom>
            Export Resolution: {resolution}x
            {dimensions &&
              ` (${Math.round(dimensions.width * resolution)} × ${Math.round(dimensions.height * resolution)} pixels)`}
          </Typography>
          <Slider
            value={Math.min(resolution, maxResolution)}
            onChange={(_, value) => setResolution(value as number)}
            min={1}
            max={maxResolution}
            step={1}
            marks={sliderMarks}
            valueLabelDisplay="auto"
            aria-label="Export resolution multiplier"
          />
        </FormControl>
        <FormHelperText>
          Higher resolutions produce sharper images but take longer to generate
          and result in larger file sizes. The maximum available export
          resolution is determined by the base resolution of the visualization
          and the capabilities of your browser.
        </FormHelperText>
      </Stack>

      <Box width="100%">
        <Button
          variant="contained"
          onClick={exportAsPNG}
          disabled={isExporting || !visualizationContainerRef?.current}
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
