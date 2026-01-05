import { generateCategoricalColors } from "./categorical-colors";

/**
 * Initializes default colors for an axis if none are set.
 * This is useful for setting up default categorical colors when the feature is first used.
 * Uses stable sorting to ensure consistent color assignment regardless of value order.
 * @param values The list of values (rows or columns) to generate colors for
 * @param existingColors The current colors mapping (may be undefined or sparse)
 * @returns A complete colors mapping with default colors where needed
 */
export function initializeDefaultColors(
  values: string[],
  existingColors?: Record<string, string>,
): Record<string, string> {
  if (!values.length) return {};

  // Create stable sorted order for consistent color assignment
  const stableSortedValues = [...values].sort();
  const defaultColors = generateCategoricalColors(stableSortedValues.length);

  // If no existing colors, generate defaults for all values
  if (!existingColors || Object.keys(existingColors).length === 0) {
    const colorMap: Record<string, string> = {};
    stableSortedValues.forEach((value, index) => {
      colorMap[value] = defaultColors[index];
    });
    return colorMap;
  }

  // Check if we need to generate defaults (if no colors are assigned)
  const hasAnyColors = Object.values(existingColors).some(
    (color) => color && color.length > 0,
  );

  if (!hasAnyColors) {
    const colorMap: Record<string, string> = {};
    stableSortedValues.forEach((value, index) => {
      colorMap[value] = defaultColors[index];
    });
    return colorMap;
  }

  // Fill in missing colors with generated ones, preserving existing assignments
  const colorMap: Record<string, string> = { ...existingColors };
  stableSortedValues.forEach((value, index) => {
    if (!colorMap[value] || colorMap[value].length === 0) {
      colorMap[value] = defaultColors[index];
    }
  });

  return colorMap;
}

/**
 * Gets the effective color for a value.
 * @param value The value to get a color for
 * @param colors The current colors configuration
 * @returns The color to use for the value, or undefined if not set
 */
export function getEffectiveColor(
  value: string,
  colors?: Record<string, string>,
): string | undefined {
  if (!colors) {
    return undefined;
  }

  // Return the configured color, or undefined if not set
  return colors[value] || undefined;
}
