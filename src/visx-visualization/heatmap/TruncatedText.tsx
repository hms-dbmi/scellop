import { Text } from "@visx/text";
import React, { useMemo } from "react";

interface TruncatedTextProps {
  text: string;
  maxWidth: number;
  fontSize: number;
  fontFamily?: string;
  [key: string]: unknown;
}

/**
 * Truncates text to fit within maxWidth using canvas measurement
 */
function truncateText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string = "Roboto, Arial, sans-serif",
): string {
  // Create a temporary canvas for text measurement
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    // Fallback to character-based truncation if canvas not available
    const avgCharWidth = fontSize * 0.6;
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    return text.length > maxChars
      ? `${text.substring(0, Math.max(0, maxChars - 3))}...`
      : text;
  }

  ctx.font = `${fontSize}px ${fontFamily}`;
  const fullWidth = ctx.measureText(text).width;

  canvas.remove();

  if (fullWidth <= maxWidth) {
    return text;
  }

  // Binary search for the optimal truncation point
  let low = 0;
  let high = text.length;
  const ellipsis = "...";
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  const targetWidth = maxWidth - ellipsisWidth;

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    const testText = text.substring(0, mid);
    const testWidth = ctx.measureText(testText).width;

    if (testWidth <= targetWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low > 0 ? `${text.substring(0, low)}${ellipsis}` : ellipsis;
}

/**
 * Text component that automatically truncates to fit within maxWidth
 */
export default function TruncatedText({
  text,
  maxWidth,
  fontSize,
  fontFamily = "Roboto, Arial, sans-serif",
  ...props
}: TruncatedTextProps) {
  const truncated = useMemo(
    () => truncateText(text, maxWidth, fontSize, fontFamily),
    [text, maxWidth, fontSize, fontFamily],
  );

  return (
    <Text fontFamily={fontFamily} fontSize={fontSize} {...props}>
      {truncated}
    </Text>
  );
}
