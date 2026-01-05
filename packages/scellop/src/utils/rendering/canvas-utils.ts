/**
 * Canvas rendering utilities
 * Shared functions for rendering visualizations to Canvas contexts
 */

import type {
  BarData,
  HeatmapCellData,
  ViolinPathData,
} from "../calculations/types";

/**
 * Render heatmap cells to a Canvas context
 * @param ctx Canvas rendering context
 * @param cells Array of cell data with positions and colors
 * @param options Optional rendering options
 */
export function renderCellsToCanvas(
  ctx: CanvasRenderingContext2D,
  cells: HeatmapCellData[],
  options?: {
    strokeColor?: string;
    drawStroke?: boolean;
  },
): void {
  const { strokeColor, drawStroke = false } = options || {};

  for (const cell of cells) {
    ctx.fillStyle = cell.color;

    if (drawStroke && strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    }

    ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
  }
}

/**
 * Render bar charts to a Canvas context
 * @param ctx Canvas rendering context
 * @param bars Array of bar data with segments
 * @param options Optional rendering options
 */
export function renderBarsToCanvas(
  ctx: CanvasRenderingContext2D,
  bars: BarData[],
  options?: {
    backgroundColor?: string;
    drawBackground?: boolean;
    orderedValues?: string[];
    stripeEvenColor?: string;
    stripeOddColor?: string;
    highlightedKey?: string;
    highlightColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
  },
): void {
  const {
    backgroundColor,
    drawBackground = true,
    orderedValues,
    stripeEvenColor,
    stripeOddColor,
    highlightedKey,
    highlightColor,
    strokeColor,
    strokeWidth = 1,
  } = options || {};

  for (const bar of bars) {
    const isHighlighted = highlightedKey && bar.key === highlightedKey;

    // Draw background stripe if requested
    if (drawBackground) {
      if (stripeEvenColor && stripeOddColor && orderedValues) {
        // Alternating stripes based on position in ordered values
        const barIndex = orderedValues.indexOf(bar.key);
        ctx.fillStyle = barIndex % 2 === 0 ? stripeEvenColor : stripeOddColor;
      } else if (backgroundColor) {
        // Single background color
        ctx.fillStyle = backgroundColor;
      }

      ctx.fillRect(
        bar.backgroundX,
        bar.backgroundY,
        bar.backgroundWidth,
        bar.backgroundHeight,
      );
    }

    // Draw all segments
    for (const segment of bar.segments) {
      ctx.fillStyle =
        isHighlighted && highlightColor ? highlightColor : segment.color;
      ctx.fillRect(segment.x, segment.y, segment.width, segment.height);

      // Draw stroke around segments if specified
      if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isHighlighted ? strokeWidth * 2 : strokeWidth;
        ctx.strokeRect(segment.x, segment.y, segment.width, segment.height);
      }
    }
  }
}

/**
 * Render violin plots to a Canvas context
 * @param ctx Canvas rendering context
 * @param violins Array of violin path data
 * @param options Optional rendering options
 */
export function renderViolinsToCanvas(
  ctx: CanvasRenderingContext2D,
  violins: ViolinPathData[],
  options?: {
    orderedValues?: string[];
    stripeEvenColor?: string;
    stripeOddColor?: string;
    highlightedKey?: string;
    highlightColor?: string;
    opacity?: number;
    highlightOpacity?: number;
    drawStroke?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
  },
): void {
  const {
    orderedValues,
    stripeEvenColor,
    stripeOddColor,
    highlightedKey,
    highlightColor,
    opacity = 0.6,
    highlightOpacity = 0.8,
    drawStroke = false,
    strokeColor,
    strokeWidth = 2,
  } = options || {};

  for (const violin of violins) {
    ctx.save();

    // Apply transform for this violin's position
    ctx.translate(violin.transformCoordinate, 0);

    const isHighlighted = highlightedKey && violin.key === highlightedKey;

    // Draw background stripe if colors provided
    if (stripeEvenColor && stripeOddColor && orderedValues) {
      const violinIndex = orderedValues.indexOf(violin.key);
      const stripeColor =
        violinIndex % 2 === 0 ? stripeEvenColor : stripeOddColor;

      ctx.fillStyle = stripeColor;
      ctx.fillRect(
        violin.backgroundDimensions.x,
        violin.backgroundDimensions.y,
        violin.backgroundDimensions.width,
        violin.backgroundDimensions.height,
      );
    }

    // Draw violin path
    if (violin.path) {
      const path = new Path2D(violin.path);

      // Fill
      ctx.fillStyle =
        isHighlighted && highlightColor ? highlightColor : violin.color;
      ctx.globalAlpha = isHighlighted ? highlightOpacity : opacity;
      ctx.fill(path);

      // Stroke if requested
      if (drawStroke || isHighlighted) {
        ctx.strokeStyle =
          isHighlighted && highlightColor
            ? highlightColor
            : strokeColor || violin.color;
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = 1;
        ctx.stroke(path);
      }
    }

    ctx.restore();
  }
}

/**
 * Clear a rectangular area of the canvas
 * @param ctx Canvas rendering context
 * @param x X coordinate
 * @param y Y coordinate
 * @param width Width to clear
 * @param height Height to clear
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.clearRect(x, y, width, height);
}

/**
 * Apply scroll transformation to canvas context
 * @param ctx Canvas rendering context
 * @param xScroll Horizontal scroll offset
 * @param yScroll Vertical scroll offset
 * @returns Cleanup function to restore context
 */
export function applyScrollTransform(
  ctx: CanvasRenderingContext2D,
  xScroll: number,
  yScroll: number,
): () => void {
  ctx.save();
  if (xScroll !== 0 || yScroll !== 0) {
    ctx.translate(-xScroll, -yScroll);
  }
  return () => ctx.restore();
}
