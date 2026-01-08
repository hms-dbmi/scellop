import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Canvas API for benchmarking purposes
// We're measuring data processing, not actual rendering quality
if (typeof HTMLCanvasElement !== "undefined") {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  // @ts-expect-error - Mocking getContext for benchmark environment
  HTMLCanvasElement.prototype.getContext = function (
    contextType: string,
    options?: any,
  ) {
    if (contextType === "2d") {
      // Return a minimal mock context with the methods used in benchmarks
      return {
        fillStyle: "",
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (x: number, y: number, w: number, h: number) => ({
          data: new Uint8ClampedArray(w * h * 4),
          width: w,
          height: h,
        }),
        putImageData: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        translate: () => {},
        canvas: this,
      };
    }
    return originalGetContext?.call(this, contextType, options) ?? null;
  };
}
