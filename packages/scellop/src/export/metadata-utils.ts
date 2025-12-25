import { scaleLinear, scaleOrdinal } from "@visx/scale";
import {
  interpolatePlasma,
  schemePaired,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from "d3";

interface MetadataBar {
  value: string | number;
  height: number;
  width: number;
  color: string;
  x: number;
  y: number;
  keys: string[];
  sortKey: string;
  label: string;
}

export interface MetadataBarsParams {
  axis: "X" | "Y";
  keys: string[];
  metadata: Record<string, Record<string, string | number>>;
  sortOrders: Array<{ key: string; direction: "asc" | "desc" }>;
  scale: (value: string) => number | undefined;
  bandwidth: (value?: string) => number;
  width: number;
  height: number;
  defaultColor: string;
  greyColor: string;
  getFieldDisplayName?: (field: string) => string;
}

// Use different categorical color schemes for each sort
const categoricalSchemes = [
  [...schemePaired],
  [...schemeSet1],
  [...schemeSet2],
  [...schemeSet3],
  [...schemeTableau10],
];

// Use different color schemes for each sort to distinguish them
const numericColorSchemes = [
  [interpolatePlasma(0), interpolatePlasma(1)],
  ["#f7fcfd", "#00441b"], // Blue to dark green
  ["#fff7ec", "#7f0000"], // Light orange to dark red
  ["#f7f4f9", "#49006a"], // Light purple to dark purple
  ["#fff7fb", "#023858"], // Light pink to dark blue
];

/**
 * Calculate required dimensions for metadata bars
 */
export function calculateMetadataBarDimensions(
  keys: string[],
  metadata: Record<string, Record<string, string | number>> | undefined,
  sortOrders: Array<{ key: string; direction: "asc" | "desc" }>,
  axis: "X" | "Y",
): number {
  if (!metadata || keys.length === 0) return 0;

  const filteredSortOrders = sortOrders.filter(
    (s) => s.key !== "count" && s.key !== "alphabetical",
  );

  if (filteredSortOrders.length === 0) return 0;

  const labelSpacing = 20;
  const barThicknessX = 16;
  const barThicknessY = 20;

  // Calculate dynamic spacing based on longest label
  const maxLabelLengths = filteredSortOrders.map((sort) =>
    calculateMaxLabelLength(keys, metadata, sort.key),
  );
  const maxLabelLength = Math.max(...maxLabelLengths, 30);
  const sortSpacing = maxLabelLength + 8;

  const totalSorts = filteredSortOrders.length;
  const barThickness = axis === "X" ? barThicknessX : barThicknessY;

  return (
    labelSpacing + totalSorts * barThickness + (totalSorts - 1) * sortSpacing
  );
}

/**
 * Calculate maximum label length for a sort
 */
function calculateMaxLabelLength(
  keys: string[],
  metadata: Record<string, Record<string, string | number>>,
  sortKey: string,
  fontSize: number = 8,
): number {
  const charWidth = fontSize * 0.6; // Approximate character width
  let maxLength = 0;

  keys.forEach((key) => {
    const value = metadata[key]?.[sortKey];
    if (value !== undefined && value !== "[No Value]") {
      const label = String(value);
      maxLength = Math.max(maxLength, label.length * charWidth);
    }
  });

  return maxLength;
}

/**
 * Calculate metadata bars for rendering
 */
export function calculateMetadataBars(
  params: MetadataBarsParams,
): MetadataBar[] {
  const {
    axis,
    keys,
    metadata,
    sortOrders,
    scale,
    bandwidth,
    width,
    height,
    greyColor,
  } = params;

  // Filter out count and alphabetical sorts
  const filteredSortOrders = sortOrders.filter(
    (s) => s.key !== "count" && s.key !== "alphabetical",
  );

  if (filteredSortOrders.length === 0 || !metadata || keys.length === 0) {
    return [];
  }

  const bars: MetadataBar[] = [];

  // Calculate positioning constants
  const labelSpacing = 20; // Space for sort key labels

  // Calculate dynamic spacing based on longest label for each sort
  const maxLabelLengths = filteredSortOrders.map((sort) =>
    calculateMaxLabelLength(keys, metadata, sort.key),
  );
  const maxLabelLength = Math.max(...maxLabelLengths, 30); // Minimum 30px
  const sortSpacing = maxLabelLength + 8; // Add 8px padding

  const totalSorts = filteredSortOrders.length;

  // Calculate bar thickness based on available space, divided by number of sorts
  const barThickness =
    axis === "X"
      ? Math.max(
          12,
          (height - labelSpacing - (totalSorts - 1) * sortSpacing) / totalSorts,
        )
      : Math.max(
          16,
          (width - labelSpacing - (totalSorts - 1) * sortSpacing) / totalSorts,
        );

  // Generate bars for each sort order
  filteredSortOrders.forEach((sort, sortIndex) => {
    const values = keys.map((key) => metadata[key]?.[sort.key] || "[No Value]");
    const isNumeric = keys.every((key) => {
      const value = metadata[key]?.[sort.key];
      return value && !Number.isNaN(parseInt(value as string, 10));
    });

    // Create color scale for this sort
    let colorScale:
      | ReturnType<typeof scaleLinear<string>>
      | ReturnType<typeof scaleOrdinal<string, string>>
      | null = null;

    if (isNumeric) {
      const numericValues = values.map((v) =>
        v === "[No Value]" ? 0 : parseInt(v as string, 10),
      );
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const schemeIndex = sortIndex % numericColorSchemes.length;

      colorScale = scaleLinear<string>({
        domain: [min, max],
        range: numericColorSchemes[schemeIndex],
      });
    } else {
      const schemeIndex = sortIndex % categoricalSchemes.length;
      const uniqueValues = Array.from(new Set(values.map(String)));
      const sortedDomain = uniqueValues.sort((a, b) => {
        if (a === "[No Value]") return 1;
        if (b === "[No Value]") return -1;
        return a.localeCompare(b);
      });

      colorScale = scaleOrdinal<string, string>({
        range: categoricalSchemes[schemeIndex],
        domain: sortedDomain,
      });
    }

    // Generate bars for each key
    const tempBars: MetadataBar[] = [];

    keys.forEach((key) => {
      if (!(key in metadata)) return;

      const value = metadata[key]?.[sort.key] || "[No Value]";
      const processedValue =
        isNumeric && value !== "[No Value]"
          ? parseInt(value as string, 10)
          : value;

      const color =
        value === "[No Value]"
          ? greyColor
          : isNumeric
            ? (colorScale as (value: number) => string)(
                processedValue as number,
              )
            : (colorScale as (value: string) => string)(
                processedValue as string,
              );

      const position = scale(key);
      if (position === undefined) return;

      const bw = typeof bandwidth === "function" ? bandwidth(key) : bandwidth;

      if (axis === "Y") {
        // For flush bars, calculate the distance to the next item or use bandwidth
        const currentIndex = keys.indexOf(key);
        const nextKey = keys[currentIndex + 1];
        const nextPosition = nextKey ? scale(nextKey) : undefined;

        const barHeight =
          nextPosition !== undefined ? Math.abs(nextPosition - position) : bw;
        const barY = position;
        const barX = labelSpacing + sortIndex * (barThickness + sortSpacing);

        const newBar: MetadataBar = {
          value: processedValue,
          height: barHeight,
          width: barThickness,
          color,
          x: barX,
          y: barY,
          keys: [key],
          sortKey: sort.key,
          label: String(processedValue),
        };

        // Try to combine with previous bar if same value
        if (tempBars.length > 0) {
          const lastBar = tempBars[tempBars.length - 1];
          if (
            lastBar.value === processedValue &&
            lastBar.sortKey === sort.key
          ) {
            lastBar.y = Math.min(lastBar.y, barY);
            lastBar.height = lastBar.height + barHeight;
            lastBar.keys.push(key);
            return;
          }
        }
        tempBars.push(newBar);
      } else {
        // X axis
        const currentIndex = keys.indexOf(key);
        const nextKey = keys[currentIndex + 1];
        const nextPosition = nextKey ? scale(nextKey) : undefined;

        const barWidth =
          nextPosition !== undefined ? Math.abs(nextPosition - position) : bw;
        const barX = position;
        const barY = labelSpacing + sortIndex * (barThickness + sortSpacing);

        const newBar: MetadataBar = {
          value: processedValue,
          width: barWidth,
          height: barThickness,
          color,
          x: barX,
          y: barY,
          keys: [key],
          sortKey: sort.key,
          label: String(processedValue),
        };

        // Try to combine with previous bar if same value
        if (tempBars.length > 0) {
          const lastBar = tempBars[tempBars.length - 1];
          if (
            lastBar.value === processedValue &&
            lastBar.sortKey === sort.key
          ) {
            lastBar.x = Math.min(lastBar.x, barX);
            lastBar.width = lastBar.width + barWidth;
            lastBar.keys.push(key);
            return;
          }
        }
        tempBars.push(newBar);
      }
    });

    bars.push(...tempBars);
  });

  return bars;
}

/**
 * Render metadata bars to canvas
 */
export function renderMetadataBarsToCanvas(
  ctx: CanvasRenderingContext2D,
  params: MetadataBarsParams,
): void {
  const {
    axis,
    width,
    height,
    defaultColor,
    sortOrders,
    getFieldDisplayName = (field) => field,
  } = params;

  const bars = calculateMetadataBars(params);

  if (bars.length === 0) return;

  ctx.save();

  // Render bars
  bars.forEach((bar) => {
    ctx.fillStyle = bar.color;
    ctx.fillRect(bar.x, bar.y, bar.width, bar.height);

    // Value label on each bar segment
    if (bar.label !== "[No Value]") {
      ctx.save();
      ctx.fillStyle = "#000000"; // Black labels
      ctx.font = "8px sans-serif";

      if (axis === "X") {
        // For horizontal bars, position below bar, horizontally centered
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const labelX = bar.x + bar.width / 2;
        const labelY = bar.y + bar.height + 4; // 4px below bar
        ctx.translate(labelX, labelY);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(bar.label, 0, 0);
      } else {
        // For vertical bars, position to the right, vertically centered
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const labelX = bar.x + bar.width + 4; // 4px to the right of bar
        const labelY = bar.y + bar.height / 2;
        ctx.fillText(bar.label, labelX, labelY);
      }
      ctx.restore();
    }
  });

  // Render sort key labels
  const filteredSortOrders = sortOrders.filter(
    (s) => s.key !== "count" && s.key !== "alphabetical",
  );

  const labelSpacing = 20;

  // Calculate dynamic spacing based on longest label
  const { keys, metadata } = params;
  const maxLabelLengths = filteredSortOrders.map((sort) =>
    calculateMaxLabelLength(keys, metadata, sort.key),
  );
  const maxLabelLength = Math.max(...maxLabelLengths, 30);
  const sortSpacing = maxLabelLength + 8;

  const totalSorts = filteredSortOrders.length;
  const barThickness =
    axis === "X"
      ? Math.max(
          12,
          (height - labelSpacing - (totalSorts - 1) * sortSpacing) / totalSorts,
        )
      : Math.max(
          16,
          (width - labelSpacing - (totalSorts - 1) * sortSpacing) / totalSorts,
        );

  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = defaultColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  filteredSortOrders.forEach((sort, sortIndex) => {
    const label = getFieldDisplayName(sort.key);

    if (axis === "X") {
      const labelY =
        sortIndex === 0
          ? labelSpacing / 2
          : labelSpacing +
            sortIndex * (barThickness + sortSpacing) -
            sortSpacing / 2;
      const labelX = width / 2;
      ctx.fillText(label, labelX, labelY);
    } else {
      const labelX =
        sortIndex === 0
          ? labelSpacing / 2
          : labelSpacing +
            sortIndex * (barThickness + sortSpacing) -
            sortSpacing / 2;
      const labelY = height / 2;

      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  });

  ctx.restore();
}
