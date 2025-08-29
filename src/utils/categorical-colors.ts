import {
  schemeCategory10,
  schemePaired,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from "d3";

// Define available categorical color schemes in order of preference
const CATEGORICAL_SCHEMES = [
  schemeCategory10,
  schemeSet1,
  schemeTableau10,
  schemePaired,
  schemeSet2,
  schemeSet3,
];

/**
 * Generates a set of distinct colors for categorical data.
 * Uses d3's categorical color schemes and falls back to generated colors if needed.
 * @param count The number of colors needed
 * @returns An array of color strings
 */
export function generateCategoricalColors(count: number): string[] {
  if (count <= 0) return [];

  const colors: string[] = [];
  let colorIndex = 0;
  let schemeIndex = 0;

  for (let i = 0; i < count; i++) {
    const currentScheme = CATEGORICAL_SCHEMES[schemeIndex];

    if (currentScheme && colorIndex < currentScheme.length) {
      colors.push(currentScheme[colorIndex]);
    } else {
      // Generate additional colors using HSL when we run out of predefined colors
      const hue = (i * 137.508) % 360; // Golden angle approximation for good distribution
      const saturation = 70 + (i % 3) * 10; // Vary saturation slightly
      const lightness = 45 + (i % 2) * 10; // Vary lightness slightly
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    colorIndex++;

    // Move to next color scheme when current one is exhausted
    if (colorIndex >= (CATEGORICAL_SCHEMES[schemeIndex]?.length || 0)) {
      colorIndex = 0;
      schemeIndex = (schemeIndex + 1) % CATEGORICAL_SCHEMES.length;
    }
  }

  return colors;
}

/**
 * Gets a color for a specific value from a predefined set of colors.
 * If no colors are provided, generates default categorical colors.
 * Color assignment is based on stable sorting to ensure consistent colors regardless of display order.
 * @param value The value to get a color for
 * @param values All possible values (to determine position/index)
 * @param colors Optional predefined colors mapping (value name -> color)
 * @returns The color for the given value
 */
export function getColorForValue(
  value: string,
  values: string[],
  colors?: Record<string, string>,
): string {
  // First check if there's a specific color assigned to this value
  if (colors && colors[value]) {
    return colors[value];
  }

  // Create a stable sorted order for consistent color assignment
  const stableSortedValues = [...values].sort();
  const stableIndex = stableSortedValues.indexOf(value);

  if (stableIndex === -1) {
    // Fallback for unknown values
    return "#999999";
  }

  // Generate default colors based on stable sorted order
  const defaultColors = generateCategoricalColors(stableSortedValues.length);
  return defaultColors[stableIndex];
}
