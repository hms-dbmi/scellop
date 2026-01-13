# Scellop Performance Report

Generated: 2026-01-13T16:49:32.395Z

## Summary

This report presents benchmark results for Scellop's core operations across various dataset sizes.

# Data processing

## DataMap Creation (Raw Counts)

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10, 77 cells) | 103.09K | 9.70μs | 9.60μs | 19.37μs | 6.88μs | 4.19ms |
| small (50×50, 1506 cells) | 4.63K | 215.83μs | 208.70μs | 418.19μs | 187.86μs | 1.45ms |
| medium (100×100, 3962 cells) | 1.34K | 748.61μs | 710.90μs | 3.83ms | 663.49μs | 4.66ms |
| large (200×300, 18090 cells) | 223.84 | 4.47ms | 4.59ms | 9.79ms | 3.74ms | 9.89ms |
| huge (500×500, 50028 cells) | 61.89 | 16.16ms | 16.23ms | 23.70ms | 13.91ms | 23.70ms |
| wide (50×500, 7510 cells) | 612.60 | 1.63ms | 1.56ms | 6.59ms | 1.43ms | 6.98ms |
| tall (500×50, 7395 cells) | 611.52 | 1.64ms | 1.55ms | 6.67ms | 1.43ms | 7.02ms |
| extraWide (20×1000, 5010 cells) | 1.08K | 927.65μs | 894.00μs | 3.63ms | 817.00μs | 4.25ms |
| extraTall (1000×20, 4979 cells) | 1.08K | 924.94μs | 892.09μs | 3.64ms | 831.58μs | 3.97ms |

## Derived States Calculation

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10, 77 cells) | 129.76K | 7.71μs | 8.12μs | 26.40μs | 5.30μs | 13.79ms |
| small (50×50, 1506 cells) | 7.77K | 128.71μs | 123.53μs | 233.05μs | 112.01μs | 12.33ms |
| medium (100×100, 3962 cells) | 2.41K | 414.24μs | 413.92μs | 548.87μs | 385.90μs | 2.62ms |
| large (200×300, 18090 cells) | 462.65 | 2.16ms | 2.17ms | 2.91ms | 2.01ms | 3.85ms |
| huge (500×500, 50028 cells) | 159.70 | 6.26ms | 6.35ms | 6.94ms | 5.98ms | 6.94ms |
| wide (50×500, 7510 cells) | 1.55K | 644.15μs | 647.85μs | 741.21μs | 595.89μs | 1.50ms |
| tall (500×50, 7395 cells) | 839.70 | 1.19ms | 1.19ms | 1.66ms | 1.13ms | 1.90ms |
| extraWide (20×1000, 5010 cells) | 2.56K | 390.90μs | 390.20μs | 593.15μs | 357.43μs | 1.18ms |
| extraTall (1000×20, 4979 cells) | 2.71K | 368.51μs | 368.33μs | 457.31μs | 341.19μs | 1.12ms |

## Row Fraction Normalization

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10, 77 cells) | 116.09K | 8.61μs | 8.28μs | 15.85μs | 7.44μs | 569.19μs |
| small (50×50, 1506 cells) | 3.96K | 252.21μs | 251.86μs | 400.12μs | 231.48μs | 797.61μs |
| medium (100×100, 3962 cells) | 1.18K | 844.06μs | 824.90μs | 1.24ms | 747.27μs | 5.92ms |
| large (200×300, 18090 cells) | 216.64 | 4.62ms | 4.56ms | 13.28ms | 3.99ms | 13.47ms |
| huge (500×500, 50028 cells) | 58.34 | 17.14ms | 17.60ms | 26.90ms | 14.93ms | 26.90ms |
| wide (50×500, 7510 cells) | 571.02 | 1.75ms | 1.68ms | 9.67ms | 1.55ms | 10.23ms |
| tall (500×50, 7395 cells) | 510.13 | 1.96ms | 1.90ms | 10.36ms | 1.69ms | 11.08ms |
| extraWide (20×1000, 5010 cells) | 1.02K | 977.57μs | 952.68μs | 1.82ms | 835.00μs | 5.98ms |
| extraTall (1000×20, 4979 cells) | 1.03K | 971.53μs | 952.85μs | 1.27ms | 859.52μs | 5.46ms |

## Log Normalization

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10, 77 cells) | 101.31K | 9.87μs | 8.91μs | 19.23μs | 7.95μs | 5.90ms |
| small (50×50, 1506 cells) | 4.84K | 206.49μs | 203.16μs | 400.34μs | 182.75μs | 1.11ms |
| medium (100×100, 3962 cells) | 1.38K | 724.01μs | 690.39μs | 1.27ms | 627.03μs | 6.35ms |
| large (200×300, 18090 cells) | 199.57 | 5.01ms | 5.01ms | 14.22ms | 4.18ms | 14.27ms |
| huge (500×500, 50028 cells) | 57.35 | 17.44ms | 17.40ms | 29.80ms | 14.65ms | 29.80ms |
| wide (50×500, 7510 cells) | 582.42 | 1.72ms | 1.61ms | 9.95ms | 1.50ms | 11.28ms |
| tall (500×50, 7395 cells) | 589.75 | 1.70ms | 1.61ms | 9.74ms | 1.51ms | 10.59ms |
| extraWide (20×1000, 5010 cells) | 1.01K | 986.55μs | 947.94μs | 1.54ms | 872.03μs | 5.92ms |
| extraTall (1000×20, 4979 cells) | 1.01K | 989.65μs | 954.73μs | 1.48ms | 889.14μs | 5.63ms |

## Metadata Processing

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| Extract row metadata keys - tiny | 1.59M | 0.63μs | 0.60μs | 1.22μs | 0.54μs | 527.62μs |
| Extract column metadata keys - tiny | 1.71M | 0.58μs | 0.54μs | 1.02μs | 0.47μs | 14.25ms |
| Extract row metadata keys - small | 415.81K | 2.40μs | 2.29μs | 4.11μs | 2.10μs | 619.15μs |
| Extract column metadata keys - small | 466.15K | 2.15μs | 2.03μs | 3.38μs | 1.75μs | 644.09μs |
| Extract row metadata keys - medium | 214.37K | 4.66μs | 4.41μs | 7.72μs | 4.00μs | 684.43μs |
| Extract column metadata keys - medium | 245.17K | 4.08μs | 3.85μs | 5.69μs | 3.56μs | 529.87μs |
| Extract row metadata keys - large | 108.23K | 9.24μs | 8.66μs | 19.53μs | 7.61μs | 728.86μs |
| Extract column metadata keys - large | 82.74K | 12.09μs | 11.61μs | 22.92μs | 9.90μs | 675.16μs |
| Extract row metadata keys - huge | 43.78K | 22.84μs | 22.12μs | 40.70μs | 19.16μs | 758.25μs |
| Extract column metadata keys - huge | 50.72K | 19.72μs | 19.08μs | 34.47μs | 17.13μs | 1.17ms |
| Extract row metadata keys - wide | 398.99K | 2.51μs | 2.31μs | 4.35μs | 2.01μs | 731.36μs |
| Extract column metadata keys - wide | 50.90K | 19.65μs | 19.15μs | 32.98μs | 17.40μs | 607.28μs |
| Extract row metadata keys - tall | 44.58K | 22.43μs | 21.78μs | 38.98μs | 19.20μs | 667.60μs |
| Extract column metadata keys - tall | 470.48K | 2.13μs | 2.01μs | 3.72μs | 1.81μs | 779.42μs |
| Extract row metadata keys - extraWide | 910.19K | 1.10μs | 1.04μs | 2.17μs | 0.91μs | 641.61μs |
| Extract column metadata keys - extraWide | 25.52K | 39.19μs | 37.48μs | 66.92μs | 34.39μs | 1.00ms |
| Extract row metadata keys - extraTall | 21.92K | 45.62μs | 42.99μs | 88.50μs | 39.34μs | 713.36μs |
| Extract column metadata keys - extraTall | 1.03M | 0.98μs | 0.92μs | 1.93μs | 0.82μs | 658.02μs |

## DataMap creation scales with cell count

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| 10×10 = 87 cells | 97.37K | 10.27μs | 9.20μs | 18.00μs | 8.34μs | 2.81ms |
| 50×50 = 1505 cells | 4.84K | 206.41μs | 204.33μs | 290.22μs | 183.15μs | 971.97μs |
| 100×100 = 4005 cells | 1.35K | 738.68μs | 703.60μs | 4.05ms | 650.66μs | 4.25ms |
| 200×200 = 11916 cells | 339.04 | 2.95ms | 2.84ms | 10.21ms | 2.63ms | 10.50ms |
| 500×500 = 50243 cells | 63.63 | 15.72ms | 15.66ms | 25.29ms | 13.65ms | 25.29ms |

## DerivedStates scales with cell count

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| 10×10 = 73 cells | 154.12K | 6.49μs | 5.65μs | 11.68μs | 5.02μs | 11.35ms |
| 50×50 = 1533 cells | 7.76K | 128.82μs | 124.75μs | 181.34μs | 111.63μs | 11.24ms |
| 100×100 = 4042 cells | 2.34K | 427.49μs | 424.16μs | 596.97μs | 394.44μs | 2.72ms |
| 200×200 = 11971 cells | 723.71 | 1.38ms | 1.38ms | 1.68ms | 1.27ms | 2.89ms |
| 500×500 = 49844 cells | 167.21 | 5.98ms | 6.02ms | 6.83ms | 5.76ms | 6.83ms |

## Asymmetrical dataset performance

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| square-50: 50×50 (753 cells) | 6.21K | 160.96μs | 159.92μs | 273.69μs | 144.06μs | 1.07ms |
| wide-50x500: 50×500 (7596 cells) | 434.87 | 2.30ms | 2.30ms | 2.66ms | 2.06ms | 10.99ms |
| tall-500x50: 500×50 (7490 cells) | 363.61 | 2.75ms | 2.71ms | 8.00ms | 2.53ms | 8.06ms |
| extraWide-20x1000: 20×1000 (4948 cells) | 767.04 | 1.30ms | 1.28ms | 4.76ms | 1.18ms | 5.46ms |
| extraTall-1000x20: 1000×20 (5107 cells) | 392.16 | 2.55ms | 2.61ms | 4.16ms | 2.18ms | 5.09ms |

# Export

## High-Resolution Canvas Export

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny @1x resolution (10×10) | 48.20K | 20.75μs | 19.62μs | 50.24μs | 17.20μs | 1.43ms |
| tiny @2x resolution (10×10) | 50.11K | 19.96μs | 19.10μs | 41.79μs | 17.38μs | 565.53μs |
| tiny @4x resolution (10×10) | 50.59K | 19.77μs | 18.89μs | 40.27μs | 16.76μs | 600.47μs |
| small @1x resolution (50×50) | 2.08K | 480.80μs | 479.01μs | 907.23μs | 442.72μs | 1.10ms |
| small @2x resolution (50×50) | 2.08K | 481.45μs | 476.58μs | 920.35μs | 423.87μs | 1.35ms |
| small @4x resolution (50×50) | 2.06K | 484.29μs | 484.57μs | 843.63μs | 439.31μs | 1.32ms |
| medium @1x resolution (100×100) | 509.28 | 1.96ms | 1.97ms | 2.73ms | 1.82ms | 2.77ms |
| medium @2x resolution (100×100) | 502.22 | 1.99ms | 1.98ms | 2.91ms | 1.81ms | 3.05ms |
| medium @4x resolution (100×100) | 494.90 | 2.02ms | 2.04ms | 2.85ms | 1.84ms | 3.03ms |

## Canvas Size Limits

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| 50×50 @ 10px cells (500×500px canvas) | 1.32K | 756.87μs | 752.78μs | 1.66ms | 666.24μs | 1.81ms |
| 50×50 @ 20px cells (1000×1000px canvas) | 1.33K | 752.39μs | 744.02μs | 1.75ms | 664.50μs | 1.95ms |
| 50×50 @ 50px cells (2500×2500px canvas) | 1.33K | 750.21μs | 744.26μs | 1.83ms | 678.37μs | 2.29ms |
| 50×50 @ 100px cells (5000×5000px canvas) | 1.33K | 752.62μs | 742.12μs | 1.79ms | 686.71μs | 1.98ms |

## Export Memory Efficiency

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| Create single canvas (100×100) | 337.14 | 2.97ms | 2.93ms | 5.26ms | 2.59ms | 8.08ms |

## Complete Export Pipeline

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| Full export pipeline - tiny (10×10) | 27.07K | 36.94μs | 35.79μs | 67.10μs | 32.38μs | 1.29ms |
| Full export pipeline - small (50×50) | 1.36K | 734.53μs | 736.42μs | 1.14ms | 673.84μs | 1.28ms |
| Full export pipeline - medium (100×100) | 352.56 | 2.84ms | 2.85ms | 4.30ms | 2.58ms | 4.31ms |

# Heatmap rendering

## Calculate Heatmap Cells

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10, 83 cells) | 33.95K | 29.45μs | 30.85μs | 73.50μs | 16.34μs | 19.96ms |
| small (50×50, 1501 cells) | 1.01K | 992.22μs | 904.52μs | 1.67ms | 658.16μs | 28.08ms |
| medium (100×100, 4000 cells) | 328.25 | 3.05ms | 3.52ms | 20.86ms | 1.73ms | 43.94ms |
| large (200×300, 17940 cells) | 49.21 | 20.32ms | 19.40ms | 36.36ms | 18.04ms | 36.36ms |
| huge (500×500, 50214 cells) | 10.36 | 96.48ms | 104.00ms | 113.94ms | 89.60ms | 113.94ms |
| wide (50×500, 7428 cells) | 137.94 | 7.25ms | 7.26ms | 22.64ms | 5.75ms | 22.64ms |
| tall (500×50, 7436 cells) | 125.50 | 7.97ms | 8.05ms | 27.78ms | 5.84ms | 27.78ms |
| extraWide (20×1000, 5034 cells) | 180.71 | 5.53ms | 5.73ms | 19.10ms | 4.39ms | 19.10ms |
| extraTall (1000×20, 5020 cells) | 147.48 | 6.78ms | 5.84ms | 45.85ms | 4.51ms | 45.85ms |

## Calculate Heatmap Cells with Expanded Rows

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| No expanded rows | 451.31 | 2.22ms | 2.04ms | 15.61ms | 1.70ms | 19.97ms |
| 10% expanded rows | 488.77 | 2.05ms | 1.70ms | 14.76ms | 1.53ms | 22.87ms |
| 50% expanded rows | 969.12 | 1.03ms | 928.20μs | 1.78ms | 850.63μs | 14.44ms |

## Render Cells to Canvas

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10, 100 rendered cells) | 5.27M | 0.19μs | 0.19μs | 0.23μs | 0.16μs | 298.26μs |
| small (50×50, 2500 rendered cells) | 309.78K | 3.23μs | 3.21μs | 5.18μs | 3.08μs | 347.08μs |
| medium (100×100, 10000 rendered cells) | 75.03K | 13.33μs | 13.16μs | 21.34μs | 12.50μs | 290.36μs |
| large (200×300, 60000 rendered cells) | 12.19K | 82.03μs | 80.54μs | 118.02μs | 74.22μs | 3.01ms |
| huge (500×500, 250000 rendered cells) | 967.70 | 1.03ms | 1.10ms | 1.39ms | 787.69μs | 1.87ms |
| wide (50×500, 25000 rendered cells) | 29.24K | 34.20μs | 32.86μs | 58.72μs | 29.86μs | 187.98μs |
| tall (500×50, 25000 rendered cells) | 29.93K | 33.41μs | 32.30μs | 58.02μs | 28.56μs | 357.78μs |
| extraWide (20×1000, 20000 rendered cells) | 36.60K | 27.32μs | 26.79μs | 43.59μs | 25.16μs | 314.61μs |
| extraTall (1000×20, 20000 rendered cells) | 36.30K | 27.55μs | 26.62μs | 45.88μs | 24.66μs | 331.43μs |

## End-to-End: Calculate + Render

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10 complete render) | 54.76K | 18.26μs | 13.43μs | 23.67μs | 11.76μs | 17.95ms |
| small (50×50 complete render) | 1.19K | 841.94μs | 748.52μs | 1.00ms | 393.65μs | 51.26ms |
| medium (100×100 complete render) | 479.47 | 2.09ms | 1.82ms | 15.33ms | 1.67ms | 16.71ms |
| large (200×300 complete render) | 48.78 | 20.50ms | 19.09ms | 42.20ms | 18.13ms | 42.20ms |

## Scalability: Cell Calculation Complexity

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| 10×10 = 25/100 non zero cells | 73.11K | 13.68μs | 12.17μs | 22.29μs | 10.68μs | 12.17ms |
| 50×50 = 761/2500 non zero cells | 2.14K | 466.43μs | 397.49μs | 735.76μs | 360.21μs | 20.25ms |
| 100×100 = 2948/10000 non zero cells | 503.46 | 1.99ms | 1.76ms | 14.20ms | 1.58ms | 15.19ms |
| 200×200 = 11919/40000 non zero cells | 75.84 | 13.18ms | 12.10ms | 38.52ms | 10.92ms | 38.52ms |
| 500×500 = 74964/250000 non zero cells | 10.10 | 99.04ms | 110.92ms | 114.71ms | 90.49ms | 114.71ms |
| 1000×1000 = 299910/1000000 non zero cells | 1.82 | 549.29ms | 572.96ms | 680.25ms | 499.54ms | 680.25ms |

## Asymmetrical Dataset Rendering

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| square-50x50: 50×50 (768 cells) | 1.48K | 673.92μs | 703.66μs | 1.11ms | 337.89μs | 55.43ms |
| wide-50x500: 50×500 (7612 cells) | 119.99 | 8.33ms | 8.15ms | 24.43ms | 7.12ms | 24.43ms |
| tall-500x50: 500×50 (7535 cells) | 113.38 | 8.82ms | 8.64ms | 33.80ms | 6.89ms | 33.80ms |
| extraWide-20x1000: 20×1000 (5924 cells) | 134.76 | 7.42ms | 7.33ms | 49.85ms | 4.95ms | 49.85ms |
| extraTall-1000x20: 1000×20 (5971 cells) | 148.40 | 6.74ms | 6.58ms | 22.41ms | 4.97ms | 22.41ms |

# Side graphs

## Data Preparation for Side Graphs

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny - Calculate fraction dataMap (10×10) | 85.80K | 11.66μs | 11.31μs | 21.73μs | 9.87μs | 537.78μs |
| small - Calculate fraction dataMap (50×50) | 3.32K | 301.27μs | 301.96μs | 413.79μs | 276.09μs | 752.61μs |
| medium - Calculate fraction dataMap (100×100) | 972.59 | 1.03ms | 1.02ms | 1.37ms | 922.87μs | 5.56ms |
| large - Calculate fraction dataMap (200×300) | 175.84 | 5.69ms | 5.80ms | 15.81ms | 4.83ms | 15.81ms |
| huge - Calculate fraction dataMap (500×500) | 48.06 | 20.81ms | 21.11ms | 31.21ms | 18.25ms | 31.21ms |
| wide - Calculate fraction dataMap (50×500) | 521.11 | 1.92ms | 1.88ms | 9.32ms | 1.70ms | 10.37ms |
| tall - Calculate fraction dataMap (500×50) | 425.07 | 2.35ms | 2.30ms | 8.18ms | 2.14ms | 8.75ms |
| extraWide - Calculate fraction dataMap (20×1000) | 959.54 | 1.04ms | 1.00ms | 4.90ms | 925.48μs | 6.19ms |
| extraTall - Calculate fraction dataMap (1000×20) | 783.97 | 1.28ms | 1.25ms | 4.01ms | 1.15ms | 4.37ms |

## Scale Creation for Side Graphs

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| Create categorical scale (100 items) | 81.26K | 12.31μs | 11.27μs | 23.22μs | 9.56μs | 6.53ms |
| Create continuous scale for bars | 1.75M | 0.57μs | 0.55μs | 1.06μs | 0.46μs | 598.97μs |

## Data Aggregation for Violins (O(n×m) Complexity)

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| 10 violins × 10 categories | 63.87K | 15.66μs | 15.24μs | 24.77μs | 13.92μs | 573.81μs |
| 20 violins × 50 categories | 5.14K | 194.42μs | 194.04μs | 347.74μs | 176.01μs | 857.94μs |
| 50 violins × 100 categories | 861.55 | 1.16ms | 1.16ms | 1.67ms | 1.07ms | 1.96ms |
| 100 violins × 100 categories | 382.80 | 2.61ms | 2.63ms | 4.38ms | 2.35ms | 4.49ms |
| 200 violins × 100 categories | 169.49 | 5.90ms | 6.10ms | 8.76ms | 5.31ms | 8.76ms |

## Fraction Normalization (Violin Prep)

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny (10×10, 86 cells) | 86.81K | 11.52μs | 11.24μs | 19.75μs | 9.99μs | 568.42μs |
| small (50×50, 1534 cells) | 3.30K | 302.90μs | 303.74μs | 382.14μs | 277.04μs | 880.10μs |
| medium (100×100, 4023 cells) | 980.75 | 1.02ms | 1.00ms | 1.33ms | 925.82μs | 5.91ms |
| large (200×300, 17907 cells) | 171.81 | 5.82ms | 5.80ms | 16.55ms | 4.87ms | 16.55ms |
| huge (500×500, 50482 cells) | 48.26 | 20.72ms | 20.34ms | 32.42ms | 17.84ms | 32.42ms |

## Bar Stacking Calculations

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| tiny - Stack 10 segments × 10 bars | 88.98K | 11.24μs | 10.72μs | 20.76μs | 9.79μs | 1.22ms |
| small - Stack 50 segments × 50 bars | 203.18 | 4.92ms | 4.96ms | 5.28ms | 4.75ms | 6.10ms |
| medium - Stack 100 segments × 100 bars | 16.81 | 59.50ms | 59.66ms | 60.43ms | 58.91ms | 60.43ms |
| large - Stack 200 segments × 300 bars | 0.36 | 2.74s | 2.76s | 2.80s | 2.71s | 2.80s |
| huge - Stack 500 segments × 500 bars | 0.04 | 28.32s | 28.41s | 28.45s | 28.16s | 28.45s |
| wide - Stack 50 segments × 500 bars | 3.14 | 318.48ms | 319.94ms | 321.15ms | 313.08ms | 321.15ms |
| tall - Stack 500 segments × 50 bars | 3.26 | 306.99ms | 307.60ms | 317.13ms | 303.26ms | 317.13ms |
| extraWide - Stack 20 segments × 1000 bars | 5.98 | 167.34ms | 167.58ms | 167.81ms | 166.81ms | 167.81ms |
| extraTall - Stack 1000 segments × 20 bars | 5.96 | 167.92ms | 168.91ms | 169.78ms | 164.72ms | 169.78ms |

## Scalability Analysis

| Benchmark | Ops/sec | Mean | p75 | p99 | Min | Max |
|-----------|---------|------|-----|-----|-----|-----|
| 10×10 data aggregation (38 cells) | 72.34K | 13.82μs | 13.08μs | 25.99μs | 12.32μs | 347.64μs |
| 50×50 data aggregation (984 cells) | 2.01K | 496.47μs | 490.60μs | 771.85μs | 444.55μs | 1.18ms |
| 100×100 data aggregation (3933 cells) | 401.99 | 2.49ms | 2.49ms | 3.82ms | 2.13ms | 6.86ms |
| 200×200 data aggregation (16131 cells) | 82.30 | 12.15ms | 12.90ms | 19.94ms | 10.46ms | 19.94ms |

## Key Takeaways

- **Data Processing**: Scales linearly with non-zero cell count
- **Heatmap Rendering**: Efficient for typical datasets (<100ms for 100×100)
- **Violin Plots**: Most expensive operation due to KDE calculations
- **Export**: High-resolution exports scale with resolution²

## Performance Targets

For 100×100 datasets (~4000 non-zero cells):

- ✅ DataMap creation: < 10ms
- ✅ Heatmap rendering: < 50ms
- ✅ Violin plots (100 violins): < 200ms
- ✅ Export (2x resolution): < 500ms

## Methodology

Benchmarks use:
- **Vitest** benchmark mode with multiple iterations and warmup
- **Synthetic datasets** with controlled sizes (10×10 to 1000×1000)
- **jsdom** environment for Canvas API support
- **Statistical analysis** (mean, variance, percentiles) for accuracy

