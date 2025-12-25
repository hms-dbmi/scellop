# Scellop Export System

This directory contains the high-quality export system for Scellop visualizations, supporting both PNG and SVG formats with significantly improved quality compared to the previous screenshot-based approach.

## Architecture Overview

### Problem Statement

The previous export implementation used `html2canvas` to capture a screenshot of the DOM, which had several limitations:

1. **Quality Loss**: Canvas elements were captured at their rendered resolution and upscaled, resulting in blurry exports
2. **Mixed Content**: SVG elements were rasterized, losing vector quality
3. **No Vector Export**: Only PNG output was available
4. **Performance**: Slow for large/complex DOM trees

### Solution: Dual Rendering Pipeline

The new system provides two export paths:

#### 1. High-Resolution PNG Export (`canvas-export.ts`)

- Creates an **offscreen Canvas** at the target resolution (e.g., 4x native size)
- **Re-renders** the heatmap directly to this Canvas using the same data and scales as the interactive view
- Produces **crisp, high-quality** raster images that remain sharp when zoomed
- Bypasses html2canvas entirely for the main visualization

**Key Function**: `renderHeatmapHighRes()`

#### 2. SVG Vector Export (`svg-export.tsx`)

- Creates a parallel **SVG rendering** of the visualization
- Uses React components to generate SVG markup with `<rect>` and `<path>` elements
- Produces **infinitely scalable** vector graphics
- Perfect for publications and presentations

**Key Function**: `exportAsSvg()`

## File Structure

```
src/export/
├── index.ts                  # Public API exports
├── types.ts                  # TypeScript type definitions
├── rendering-utils.ts        # Shared rendering utilities
├── canvas-export.ts          # High-resolution Canvas renderer
├── svg-export.tsx            # SVG composition and serialization
├── SvgHeatmap.tsx           # SVG heatmap component
├── SvgBars.tsx              # SVG bar chart component
└── SvgViolins.tsx           # SVG violin plot component
```

## Usage

### In ExportControls Component

The `ExportControls.tsx` component has been updated to use the new export system:

```tsx
// PNG Export
renderHeatmapHighRes({
  canvas,
  rows,
  columns,
  dataMap,
  xScale: xScale.scale,
  yScale: yScale.scale,
  colorScale,
  resolution: 4, // 4x native resolution
  // ... other params
});

// SVG Export
exportAsSvg(
  {
    rows,
    columns,
    dataMap,
    xScale: xScale.scale,
    yScale: yScale.scale,
    colorScale,
    // ... other params
  },
  "filename.svg"
);
```

### Shared Rendering Utilities

The `rendering-utils.ts` file provides functions that work for both Canvas and SVG:

- `calculateHeatmapCells()` - Computes cell positions and colors
- `calculateInlineBars()` - Computes inline bar chart data for expanded rows
- `renderHeatmapToCanvas()` - Renders cells to a Canvas context
- `renderBarsToCanvas()` - Renders bar charts to Canvas
- `renderViolinsToCanvas()` - Renders violin plots to Canvas

## Key Features

### 1. True High-Resolution Rendering

Instead of upscaling a low-res image, we render at the target resolution:

```typescript
// Create high-res canvas
canvas.width = width * resolution;
canvas.height = height * resolution;
ctx.scale(resolution, resolution);

// Render directly at high resolution
// Result: Sharp, crisp pixels
```

### 2. Data-Driven Rendering

Both export paths use the same data sources as the interactive visualization:

- `useFractionDataMap()` - Normalized cell values
- `useXScale()` / `useYScale()` - Scales for positioning
- `useColorScale()` - Color mapping
- Context providers - All state and configuration

### 3. Format-Specific Optimizations

**PNG:**

- Resolution multiplier (1x-100x based on browser limits)
- Browser-aware canvas size constraints
- Optimized for raster output

**SVG:**

- Infinitely scalable
- Smaller file sizes for simple visualizations
- Retains editability in vector graphics software

### 4. Modular Architecture

Components are reusable:

```tsx
// Use SVG components independently
<SvgHeatmap
  rows={rows}
  columns={columns}
  dataMap={dataMap}
  xScale={xScale}
  yScale={yScale}
  colorScale={colorScale}
  // ...
/>
```

## Browser Compatibility

### Canvas Size Limits

The system automatically detects browser capabilities:

| Browser         | Max Dimension | Max Area |
| --------------- | ------------- | -------- |
| Chrome 73+      | 65,535px      | 16,384²  |
| Chrome (older)  | 32,767px      | 16,384²  |
| Firefox 122+    | 32,767px      | 23,168²  |
| Firefox (older) | 32,767px      | 11,180²  |
| Safari          | 16,384px      | 16,384²  |
| Edge 79+        | 65,535px      | 16,384²  |

Resolution limits are calculated dynamically based on these constraints.

## Future Enhancements

### Planned Features

1. **Customization Options**
   - Custom DPI/resolution
   - Background transparency toggle
   - Include/exclude specific elements

2. **Additional Formats**
   - PDF export (via jsPDF)
   - SVG with embedded CSS
   - Interactive SVG with tooltips

### Extending the System

To add a new visualization type:

1. Create a shared calculation function in `rendering-utils.ts`:

   ```ts
   export function calculateMyGraph(params) { ... }
   ```

2. Add Canvas renderer:

   ```ts
   export function renderMyGraphToCanvas(ctx, data) { ... }
   ```

3. Create SVG component:

   ```tsx
   export const SvgMyGraph: React.FC<Props> = ({ ... }) => {
     return <g>...</g>;
   };
   ```

4. Update `svg-export.tsx` to include the new component
5. Update `canvas-export.ts` to call the Canvas renderer

## Performance Considerations

### PNG Export Performance

- **Small datasets** (< 100×100): Instant
- **Medium datasets** (100×500): 1-2 seconds at 4x resolution
- **Large datasets** (1000×1000): 5-10 seconds at 4x resolution

Factors affecting performance:

- Resolution multiplier (linear impact)
- Number of cells (linear impact)
- Number of expanded rows (moderate impact)

### SVG Export Performance

- **Generation**: Very fast (< 1 second)
- **File size**: Linear with number of cells
- **Rendering**: Depends on viewer and file size

Example file sizes:

- 50×50 cells: ~50 KB
- 100×100 cells: ~200 KB
- 1000×1000 cells: ~20 MB (may be slow in some viewers)

## Testing

To test the export system:

1. Run the demo: `pnpm run dev`
2. Open the Controls modal (⚙️ icon)
3. Navigate to Export tab
4. Select PNG or SVG format
5. Adjust resolution (for PNG)
6. Export and verify quality

Test cases:

- Small dataset (fast, baseline quality)
- Large dataset (performance, file size)
- Expanded rows (inline bars rendering)
- Various normalizations (color accuracy)
- High resolution (8x+) PNG
- SVG scalability in external viewer

## Technical Details

### Why Not Use @visx/heatmap?

While `@visx/heatmap` is installed, it wasn't used because:

1. Our heatmap has custom features (inline bars, expanded rows)
2. Canvas rendering is used for performance in interactive view
3. More control over export rendering

### Why React for SVG Export?

Using React components for SVG export provides:

- Code reuse (similar logic to interactive visualization)
- Type safety (TypeScript)
- Maintainability (familiar patterns)
- Easy testing (can render in test environment)

### Why Offscreen Canvas?

Benefits:

- Doesn't affect visible DOM
- No flash or visual artifacts
- Can render at any resolution
- Full control over rendering

## Troubleshooting

### Export fails with "Failed to get 2D context"

**Cause**: Canvas creation failed (browser limit exceeded)
**Solution**: Reduce resolution or split into smaller exports

### SVG file is huge

**Cause**: Too many cells
**Solution**: Filter/aggregate data before export or use PNG

### PNG export is blurry

**Cause**: Resolution too low
**Solution**: Increase resolution multiplier

### Colors don't match interactive view

**Cause**: Different color scale or normalization
**Solution**: Verify colorScale parameter matches current normalization

## References

- [Canvas Size Limits](https://jhildenbiddle.github.io/canvas-size/#/)
- [@visx Documentation](https://airbnb.io/visx/)
- [SVG Specification](https://www.w3.org/TR/SVG2/)
- [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
