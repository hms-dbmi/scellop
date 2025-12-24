import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SvgCategoricalLegendsPanel,
  SvgCategoricalLegendsPanelConfig,
} from "./SvgCategoricalLegendsPanel";
import { SvgExportConfig, SvgVisualization } from "./SvgVisualization";

export type { SvgCategoricalLegendsPanelConfig, SvgExportConfig };

/**
 * Get SVG markup as string (useful for embedding or further processing)
 */
export function getSvgMarkup(config: SvgExportConfig): string {
  return renderToStaticMarkup(<SvgVisualization {...config} />);
}

/**
 * Get categorical legends panel SVG markup as string
 */
export function getCategoricalLegendsPanelMarkup(
  config: SvgCategoricalLegendsPanelConfig,
): string {
  return renderToStaticMarkup(<SvgCategoricalLegendsPanel {...config} />);
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

/**
 * Export categorical color legends as a separate SVG file
 */
export function exportCategoricalLegendsAsSvg(
  config: SvgCategoricalLegendsPanelConfig,
  filename: string,
): void {
  // Render React component to static SVG markup
  const svgMarkup = getCategoricalLegendsPanelMarkup(config);

  // Don't export if there's no content
  if (!svgMarkup || svgMarkup.length === 0) {
    console.warn("No categorical legends to export");
    return;
  }

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
