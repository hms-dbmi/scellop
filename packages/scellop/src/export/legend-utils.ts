/**
 * Parameters for rendering a color scale legend
 */
export interface LegendParams {
  colorScale: (value: number) => string;
  maxValue: number;
  minValueLabel: string;
  maxValueLabel: string;
  legendLabel: string;
  backgroundColor: string;
  textColor: string;
  width: number;
  height: number;
  orientation: "horizontal" | "vertical";
}

/**
 * Render a color scale legend to canvas
 */
export function renderLegendToCanvas(
  ctx: CanvasRenderingContext2D,
  params: LegendParams,
): void {
  const {
    colorScale,
    maxValue,
    minValueLabel,
    maxValueLabel,
    legendLabel,
    backgroundColor,
    textColor,
    width,
    height,
    orientation,
  } = params;

  ctx.save();

  const isVertical = orientation === "vertical";
  const padding = 8;
  const labelHeight = 20;
  const legendBarThickness = 32;
  const zeroBoxSize = 32;

  // Calculate layout
  const legendBarLength = isVertical
    ? height - labelHeight - zeroBoxSize - padding * 3
    : width - zeroBoxSize - padding * 3;

  let currentY = padding;

  // Draw legend label
  ctx.fillStyle = textColor;
  ctx.font = "12px sans-serif";
  ctx.textAlign = isVertical ? "center" : "left";
  ctx.textBaseline = "top";
  ctx.fillText(legendLabel, isVertical ? width / 2 : padding, currentY);

  currentY += labelHeight + padding;

  // Draw zero value indicator (square with background color)
  if (!isVertical) {
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.fillRect(padding, currentY, zeroBoxSize, zeroBoxSize);
    ctx.strokeRect(padding, currentY, zeroBoxSize, zeroBoxSize);

    // Draw "0" label
    ctx.fillStyle = textColor;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("0", padding + zeroBoxSize / 2, currentY + zeroBoxSize / 2);
  }

  // Draw gradient legend bar
  const legendX = isVertical
    ? (width - legendBarThickness) / 2
    : padding + zeroBoxSize + padding;
  const legendY = currentY;

  if (isVertical) {
    // Vertical gradient (bottom to top)
    const gradient = ctx.createLinearGradient(
      0,
      legendY + legendBarLength,
      0,
      legendY,
    );
    // Sample colors along the gradient
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const value = (i / samples) * maxValue;
      const color = colorScale(value);
      gradient.addColorStop(i / samples, color);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendBarThickness, legendBarLength);

    // Draw min/max labels
    ctx.fillStyle = textColor;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      minValueLabel,
      legendX + legendBarThickness / 2,
      legendY + legendBarLength + 4,
    );
    ctx.textBaseline = "bottom";
    ctx.fillText(maxValueLabel, legendX + legendBarThickness / 2, legendY - 4);

    // Draw zero indicator below (vertical orientation)
    const zeroY = legendY + legendBarLength + 28;
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.fillRect(legendX, zeroY, legendBarThickness, zeroBoxSize);
    ctx.strokeRect(legendX, zeroY, legendBarThickness, zeroBoxSize);

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "0",
      legendX + legendBarThickness / 2,
      zeroY + zeroBoxSize / 2,
    );
  } else {
    // Horizontal gradient (left to right)
    const gradient = ctx.createLinearGradient(
      legendX,
      0,
      legendX + legendBarLength,
      0,
    );

    // Sample colors along the gradient
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const value = (i / samples) * maxValue;
      const color = colorScale(value);
      gradient.addColorStop(i / samples, color);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendBarLength, legendBarThickness);

    // Draw min/max labels
    ctx.fillStyle = textColor;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(minValueLabel, legendX + 4, legendY + legendBarThickness / 2);
    ctx.textAlign = "right";
    ctx.fillText(
      maxValueLabel,
      legendX + legendBarLength - 4,
      legendY + legendBarThickness / 2,
    );
  }

  ctx.restore();
}

/**
 * Calculate legend dimensions based on orientation and content
 */
export function calculateLegendDimensions(
  orientation: "horizontal" | "vertical",
  availableWidth: number,
  availableHeight: number,
): { width: number; height: number } {
  const isVertical = orientation === "vertical";

  if (isVertical) {
    // Vertical: narrow width, use available height
    return {
      width: Math.min(80, availableWidth),
      height: availableHeight,
    };
  } else {
    // Horizontal: use available width, standard height
    return {
      width: availableWidth,
      height: Math.min(120, availableHeight),
    };
  }
}
