import { ScaleLinear, formatPrefix } from "d3";

/**
 * Parameters for rendering a numeric axis
 */
export interface NumericAxisParams {
  scale: ScaleLinear<number, number>;
  orientation: "left" | "right" | "top" | "bottom";
  width: number;
  height: number;
  tickLabelSize: number;
  color: string;
  hideZero?: boolean;
  minTicks?: number; // Minimum ticks to show (for small spaces)
  axisLabel?: string;
}

/**
 * Calculate tick positions and labels for a numeric axis
 */
export function calculateNumericAxisTicks(params: NumericAxisParams): Array<{
  value: number;
  position: number;
  label: string;
}> {
  const { scale, orientation, width, height, hideZero, minTicks = 0 } = params;

  const isVertical = orientation === "left" || orientation === "right";
  const availableSpace = isVertical ? height : width;

  // Get tick values from d3 scale
  let tickValues = scale.ticks();

  // Filter out zero if requested (before limiting ticks)
  if (hideZero) {
    tickValues = tickValues.filter((v) => v !== 0);
  }

  // If space is limited, reduce ticks but ensure we have at least one
  if (availableSpace < 100 && tickValues.length > 1) {
    // Keep the max value tick
    const maxTick = Math.max(...tickValues);
    tickValues = [maxTick];
  }

  // Ensure we have at least one tick
  if (tickValues.length === 0) {
    const domain = scale.domain();
    tickValues = [Math.max(...domain)];
  }

  // Format function with decimals for non-round thousands
  const maxDomain = Math.max(...scale.domain());

  return tickValues.map((value) => {
    let label: string;

    if (value < 1000) {
      // Leave values under 1000 unformatted
      label = value.toString();
    } else {
      // Check if the value is a multiple of 1000
      const isMultipleOf1000 = value % 1000 === 0;

      // Use .0 for multiples of 1000, .1 for others to show one decimal place
      const formatSpec = isMultipleOf1000 ? ".0k" : ".1k";
      const format = formatPrefix(formatSpec, maxDomain);
      label = format(value);
    }

    return {
      value,
      position: scale(value),
      label,
    };
  });
}

/**
 * Render a numeric axis to canvas
 */
export function renderNumericAxisToCanvas(
  ctx: CanvasRenderingContext2D,
  params: NumericAxisParams,
): void {
  const { orientation, width, height, color, tickLabelSize, axisLabel } =
    params;

  const ticks = calculateNumericAxisTicks(params);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const isVertical = orientation === "left" || orientation === "right";

  // Draw axis line (border)
  ctx.beginPath();
  if (orientation === "right") {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
  } else if (orientation === "left") {
    ctx.moveTo(width, 0);
    ctx.lineTo(width, height);
  } else if (orientation === "bottom") {
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
  }
  ctx.stroke();

  // Draw ticks and labels
  ticks.forEach(({ position, label }) => {
    ctx.beginPath();

    if (orientation === "right") {
      // Vertical axis on right
      ctx.moveTo(0, position);
      ctx.lineTo(5, position);
      ctx.stroke();

      // Label
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 8, position);
      ctx.restore();
    } else if (orientation === "left") {
      // Vertical axis on left
      ctx.moveTo(width, position);
      ctx.lineTo(width - 5, position);
      ctx.stroke();

      // Label
      ctx.save();
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(label, width - 8, position);
      ctx.restore();
    } else if (orientation === "bottom") {
      // Horizontal axis on bottom
      ctx.moveTo(position, 0);
      ctx.lineTo(position, 5);
      ctx.stroke();

      // Label
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, position, 8);
      ctx.restore();
    }
  });

  // Draw axis label if provided
  if (axisLabel) {
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (orientation === "left") {
      // Rotated label on left side
      ctx.save();
      ctx.translate(10, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(axisLabel, 0, 0);
      ctx.restore();
    } else if (orientation === "right") {
      // Rotated label on right side
      ctx.save();
      ctx.translate(width - 10, height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(axisLabel, 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Parameters for rendering categorical axes (row/column names)
 */
export interface CategoricalAxisParams {
  values: string[];
  scale: (value: string) => number | undefined;
  bandwidth: (value?: string) => number;
  orientation: "horizontal" | "vertical";
  maxLength: number;
  color: string;
  fontSize?: number;
  axisLabel?: string;
  tickLength?: number;
  totalLength?: number;
  includeAxisLine?: boolean;
  includeTicks?: boolean;
  hideLabels?: Set<string>;
}

/**
 * Render categorical axis labels to canvas
 * Note: This is primarily for reference - in most cases the heatmap
 * axes are rendered separately as part of the full layout
 */
export function renderCategoricalAxisToCanvas(
  ctx: CanvasRenderingContext2D,
  params: CategoricalAxisParams,
): void {
  const {
    values,
    scale,
    bandwidth,
    orientation,
    maxLength,
    color,
    fontSize = 11,
    axisLabel,
    tickLength = 6,
    totalLength,
    includeAxisLine = false,
    includeTicks = false,
    hideLabels = new Set(),
  } = params;

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.font = `${fontSize}px sans-serif`;

  // Draw axis line
  if (includeAxisLine && totalLength !== undefined) {
    ctx.beginPath();
    if (orientation === "horizontal") {
      ctx.moveTo(0, 0);
      ctx.lineTo(totalLength, 0);
    } else {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, totalLength);
    }
    ctx.stroke();
  }

  // Draw ticks and labels
  values.forEach((value) => {
    const position = scale(value);
    if (position === undefined) return;

    // Skip rendering tick and label if in hideLabels set
    const shouldHide = hideLabels.has(value);

    const size = bandwidth(value);
    const center = position + size / 2;

    // Truncate label if needed
    const label =
      value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

    if (orientation === "horizontal") {
      // Draw tick
      if (includeTicks && !shouldHide) {
        ctx.beginPath();
        ctx.moveTo(center, 0);
        ctx.lineTo(center, -tickLength);
        ctx.stroke();
      }

      // Draw label
      if (!shouldHide) {
        ctx.save();
        ctx.translate(center, includeTicks ? -(tickLength + 4) : 0);
        ctx.rotate(-Math.PI / 2); // -90 degree angle like HeatmapXAxis
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    } else {
      // Draw tick
      if (includeTicks && !shouldHide) {
        ctx.beginPath();
        ctx.moveTo(0, center);
        ctx.lineTo(-tickLength, center);
        ctx.stroke();
      }

      // Draw label
      if (!shouldHide) {
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(label, includeTicks ? -(tickLength + 4) : 0, center);
      }
    }
  });

  // Draw axis label
  if (axisLabel) {
    ctx.font = `bold ${fontSize + 2}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (orientation === "horizontal") {
      // Position label above the axis and tick labels
      // Calculate max label length to ensure proper spacing
      const maxLabelLength = Math.max(
        ...values
          .filter((v) => !hideLabels.has(v))
          .map((v) => {
            const label =
              v.length > maxLength ? `${v.slice(0, maxLength)}...` : v;
            return label.length;
          }),
      );
      const maxLabelHeight = maxLabelLength * fontSize * 0.6; // Rotated labels
      const labelY = includeTicks
        ? -(tickLength + 4 + maxLabelHeight + 10)
        : -(maxLabelHeight + 10);
      ctx.fillText(axisLabel, totalLength ? totalLength / 2 : 0, labelY);
    } else {
      // Position label to the left of the axis, rotated
      // Calculate max label width to avoid overlap
      const maxLabelWidth = Math.max(
        ...values
          .filter((v) => !hideLabels.has(v))
          .map((v) => {
            const label =
              v.length > maxLength ? `${v.slice(0, maxLength)}...` : v;
            return label.length * fontSize * 0.6;
          }),
      );
      ctx.save();
      const labelX = includeTicks
        ? -(tickLength + 4 + maxLabelWidth + 5)
        : -(maxLabelWidth + 5);
      ctx.translate(labelX, totalLength ? totalLength / 2 : 0);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(axisLabel, 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();
}
