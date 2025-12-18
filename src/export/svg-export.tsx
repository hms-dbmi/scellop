import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SvgExportConfig, SvgVisualization } from "./SvgVisualization";

/**
 * Get SVG markup as string (useful for embedding or further processing)
 */
export function getSvgMarkup(config: SvgExportConfig): string {
  return renderToStaticMarkup(<SvgVisualization {...config} />);
}
/**
 * Export the visualization as SVG file
 */
export function exportAsSvg(config: SvgExportConfig, filename: string): void {
  // Render React component to static SVG markup
  const svgMarkup = getSvgMarkup(config);

  // Create blob
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}
