# Scellop Performance Report

Generated: 2026-01-14T19:29:53.363Z

## Summary

This report presents benchmark results for Scellop's core operations across various dataset sizes. Cell counts in benchmark names refer to non-empty cells in the sparse heatmap matrix.

## Datasets

All benchmarks run on the following datasets:

| Dataset | Type | Dimensions | Non-Zero Cells | Density | Row Sum Avg | Row Sum Range |
|---------|------|------------|----------------|---------|-------------|---------------|
| tiny | synthetic | 10×10 | 79 | 79.0% | 5K | 4K-6K |
| small | synthetic | 50×50 | 2K | 61.2% | 15K | 10K-20K |
| medium | synthetic | 100×100 | 4K | 40.5% | 20K | 14K-27K |
| extraWide | synthetic | 20×1000 | 5K | 24.3% | 125K | 112K-142K |
| extraTall | synthetic | 1000×20 | 5K | 25.0% | 3K | 0-9K |
| wide | synthetic | 50×500 | 8K | 30.1% | 74K | 57K-87K |
| tall | synthetic | 500×50 | 7K | 29.8% | 8K | 2K-13K |
| large | synthetic | 200×300 | 18K | 29.9% | 45K | 31K-57K |
| huge | synthetic | 500×500 | 50K | 19.9% | 50K | 34K-68K |
| hubmap-lung | real-world | 45×71 | 3K | 100.0% | 17K | 4K-75K |
| hubmap-kidney | real-world | 108×48 | 5K | 100.0% | 12K | 382-51K |
| hca-data | real-world | 484×51 | 25K | 100.0% | 5K | 8-54K |

# Data processing

## DataMap Creation (Raw Counts)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny (10×10, 79 cells) | 92.20K | 10.85μs | 71.54μs | 6.02% | 9.84μs | 27.16μs | 7.22μs | 7.02ms | 46K |
| small (50×50, 1531 cells) | 4.07K | 245.67μs | 84.99μs | 1.50% | 241.07μs | 605.51μs | 196.46μs | 1.31ms | 2K |
| medium (100×100, 4045 cells) | 1.15K | 869.69μs | 444.96μs | 4.18% | 872.01μs | 4.37ms | 688.95μs | 5.86ms | 575 |
| large (200×300, 17930 cells) | 171.72 | 5.82ms | 1.50ms | 5.52% | 5.98ms | 12.59ms | 4.39ms | 12.59ms | 86 |
| huge (500×500, 49845 cells) | 45.49 | 21.98ms | 2.84ms | 5.59% | 22.32ms | 30.81ms | 18.39ms | 30.81ms | 23 |
| wide (50×500, 7529 cells) | 450.37 | 2.22ms | 991.40μs | 5.82% | 2.36ms | 8.72ms | 1.52ms | 9.28ms | 226 |
| tall (500×50, 7460 cells) | 438.11 | 2.28ms | 982.68μs | 5.69% | 2.38ms | 8.58ms | 1.53ms | 8.70ms | 220 |
| extraWide (20×1000, 4866 cells) | 985.58 | 1.01ms | 481.30μs | 4.19% | 986.48μs | 4.80ms | 826.28μs | 5.62ms | 493 |
| extraTall (1000×20, 5003 cells) | 936.64 | 1.07ms | 489.15μs | 4.15% | 1.03ms | 4.71ms | 890.22μs | 5.49ms | 469 |
| hubmap-lung (45×71, 3195 cells) | 1.12K | 894.55μs | 515.34μs | 4.78% | 865.56μs | 5.29ms | 717.50μs | 6.37ms | 559 |
| hubmap-kidney (108×48, 5184 cells) | 747.39 | 1.34ms | 427.04μs | 3.23% | 1.32ms | 4.36ms | 1.15ms | 4.83ms | 374 |
| hca-data (484×51, 24684 cells) | 87.78 | 11.39ms | 2.39ms | 6.37% | 11.39ms | 22.27ms | 9.40ms | 22.27ms | 44 |

## Derived States Calculation

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny (10×10, 79 cells) | 112.96K | 8.85μs | 91.62μs | 8.54% | 8.76μs | 33.22μs | 5.73μs | 15.66ms | 56K |
| small (50×50, 1531 cells) | 7.28K | 137.34μs | 75.45μs | 1.78% | 134.18μs | 271.96μs | 115.02μs | 4.35ms | 4K |
| medium (100×100, 4045 cells) | 2.12K | 472.74μs | 119.88μs | 1.53% | 471.21μs | 732.35μs | 423.12μs | 4.00ms | 1K |
| large (200×300, 17930 cells) | 401.81 | 2.49ms | 201.19μs | 1.12% | 2.61ms | 2.90ms | 2.15ms | 3.51ms | 201 |
| huge (500×500, 49845 cells) | 143.25 | 6.98ms | 353.93μs | 1.19% | 6.97ms | 8.57ms | 6.64ms | 8.57ms | 72 |
| wide (50×500, 7529 cells) | 1.45K | 689.44μs | 66.22μs | 0.70% | 691.91μs | 923.65μs | 613.03μs | 1.84ms | 726 |
| tall (500×50, 7460 cells) | 789.56 | 1.27ms | 135.01μs | 1.05% | 1.27ms | 1.97ms | 1.13ms | 2.97ms | 395 |
| extraWide (20×1000, 4866 cells) | 2.39K | 419.18μs | 405.86μs | 5.49% | 404.67μs | 795.92μs | 349.46μs | 14.14ms | 1K |
| extraTall (1000×20, 5003 cells) | 949.95 | 1.05ms | 142.08μs | 1.21% | 1.06ms | 1.77ms | 918.41μs | 1.97ms | 475 |
| hubmap-lung (45×71, 3195 cells) | 4.56K | 219.07μs | 50.72μs | 0.95% | 216.70μs | 371.93μs | 188.61μs | 2.09ms | 2K |
| hubmap-kidney (108×48, 5184 cells) | 2.96K | 337.59μs | 61.12μs | 0.92% | 336.08μs | 528.26μs | 304.54μs | 2.20ms | 1K |
| hca-data (484×51, 24684 cells) | 611.08 | 1.64ms | 102.51μs | 0.70% | 1.67ms | 1.99ms | 1.46ms | 2.44ms | 306 |

## Row Fraction Normalization

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny (10×10, 79 cells) | 112.49K | 8.89μs | 9.32μs | 0.87% | 8.44μs | 19.36μs | 7.21μs | 726.83μs | 56K |
| small (50×50, 1531 cells) | 3.59K | 278.86μs | 170.85μs | 2.84% | 273.96μs | 488.65μs | 236.91μs | 7.20ms | 2K |
| medium (100×100, 4045 cells) | 1.03K | 966.48μs | 508.12μs | 4.53% | 935.22μs | 2.14ms | 782.51μs | 6.61ms | 518 |
| large (200×300, 17930 cells) | 168.08 | 5.95ms | 1.18ms | 4.27% | 6.04ms | 15.64ms | 4.89ms | 15.64ms | 85 |
| huge (500×500, 49845 cells) | 44.62 | 22.41ms | 3.08ms | 5.95% | 22.94ms | 32.36ms | 19.56ms | 32.36ms | 23 |
| wide (50×500, 7529 cells) | 389.88 | 2.56ms | 986.58μs | 5.40% | 2.67ms | 11.31ms | 1.79ms | 11.42ms | 195 |
| tall (500×50, 7460 cells) | 363.46 | 2.75ms | 1.05ms | 5.54% | 2.88ms | 11.18ms | 1.96ms | 12.00ms | 182 |
| extraWide (20×1000, 4866 cells) | 935.96 | 1.07ms | 496.80μs | 4.21% | 1.05ms | 1.96ms | 893.29μs | 6.32ms | 468 |
| extraTall (1000×20, 5003 cells) | 798.35 | 1.25ms | 499.45μs | 3.91% | 1.28ms | 2.11ms | 973.88μs | 6.45ms | 400 |
| hubmap-lung (45×71, 3195 cells) | 1.01K | 994.21μs | 509.20μs | 4.47% | 1.01ms | 1.64ms | 794.55μs | 6.98ms | 504 |
| hubmap-kidney (108×48, 5184 cells) | 622.21 | 1.61ms | 501.90μs | 3.47% | 1.65ms | 2.58ms | 1.25ms | 6.26ms | 312 |
| hca-data (484×51, 24684 cells) | 74.83 | 13.36ms | 2.87ms | 7.06% | 13.46ms | 24.35ms | 10.79ms | 24.35ms | 38 |

## Log Normalization

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny (10×10, 79 cells) | 87.86K | 11.38μs | 66.72μs | 5.48% | 9.70μs | 24.48μs | 8.35μs | 7.89ms | 44K |
| small (50×50, 1531 cells) | 4.07K | 245.54μs | 72.40μs | 1.28% | 245.12μs | 402.20μs | 209.15μs | 1.54ms | 2K |
| medium (100×100, 4045 cells) | 1.11K | 904.70μs | 541.80μs | 4.99% | 898.49μs | 1.35ms | 731.40μs | 7.51ms | 553 |
| large (200×300, 17930 cells) | 149.44 | 6.69ms | 1.39ms | 4.79% | 7.03ms | 16.63ms | 5.16ms | 16.63ms | 75 |
| huge (500×500, 49845 cells) | 43.95 | 22.75ms | 3.58ms | 6.97% | 23.88ms | 32.45ms | 18.54ms | 32.45ms | 22 |
| wide (50×500, 7529 cells) | 510.82 | 1.96ms | 1.05ms | 6.54% | 1.92ms | 10.97ms | 1.54ms | 11.52ms | 256 |
| tall (500×50, 7460 cells) | 427.72 | 2.34ms | 1.18ms | 6.77% | 2.45ms | 11.16ms | 1.62ms | 12.05ms | 215 |
| extraWide (20×1000, 4866 cells) | 924.55 | 1.08ms | 548.00μs | 4.62% | 1.07ms | 1.81ms | 881.96μs | 7.48ms | 463 |
| extraTall (1000×20, 5003 cells) | 913.83 | 1.09ms | 488.20μs | 4.09% | 1.07ms | 1.99ms | 934.74μs | 6.40ms | 457 |
| hubmap-lung (45×71, 3195 cells) | 1.10K | 907.54μs | 534.35μs | 4.92% | 867.80μs | 2.06ms | 764.20μs | 6.75ms | 551 |
| hubmap-kidney (108×48, 5184 cells) | 655.38 | 1.53ms | 532.19μs | 3.77% | 1.59ms | 2.50ms | 1.21ms | 6.89ms | 328 |
| hca-data (484×51, 24684 cells) | 87.99 | 11.37ms | 2.28ms | 6.09% | 11.27ms | 20.82ms | 9.50ms | 20.82ms | 44 |

## Metadata Processing

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| Extract row metadata keys - tiny | 1.46M | 0.68μs | 2.68μs | 0.90% | 0.64μs | 1.41μs | 0.55μs | 710.14μs | 732K |
| Extract column metadata keys - tiny | 1.62M | 0.62μs | 2.78μs | 0.98% | 0.56μs | 1.25μs | 0.48μs | 684.46μs | 809K |
| Extract row metadata keys - small | 376.46K | 2.66μs | 5.69μs | 0.97% | 2.46μs | 4.91μs | 2.15μs | 598.96μs | 188K |
| Extract column metadata keys - small | 421.59K | 2.37μs | 6.16μs | 1.11% | 2.13μs | 4.29μs | 1.83μs | 634.95μs | 211K |
| Extract row metadata keys - medium | 197.83K | 5.05μs | 8.98μs | 1.11% | 4.67μs | 8.89μs | 4.08μs | 905.25μs | 99K |
| Extract column metadata keys - medium | 223.91K | 4.47μs | 8.24μs | 1.08% | 4.15μs | 8.38μs | 3.50μs | 694.78μs | 112K |
| Extract row metadata keys - large | 102.42K | 9.76μs | 11.35μs | 1.01% | 9.26μs | 18.48μs | 7.87μs | 958.18μs | 51K |
| Extract column metadata keys - large | 77.61K | 12.89μs | 13.14μs | 1.01% | 12.56μs | 23.98μs | 10.47μs | 585.79μs | 39K |
| Extract row metadata keys - huge | 41.25K | 24.24μs | 18.03μs | 1.01% | 23.30μs | 43.81μs | 19.69μs | 685.18μs | 21K |
| Extract column metadata keys - huge | 47.56K | 21.03μs | 16.14μs | 0.98% | 20.38μs | 36.15μs | 18.20μs | 660.12μs | 24K |
| Extract row metadata keys - wide | 378.96K | 2.64μs | 6.11μs | 1.04% | 2.44μs | 4.76μs | 2.16μs | 748.37μs | 189K |
| Extract column metadata keys - wide | 47.01K | 21.27μs | 16.47μs | 0.99% | 20.52μs | 37.74μs | 18.25μs | 605.30μs | 24K |
| Extract row metadata keys - tall | 41.23K | 24.25μs | 19.84μs | 1.12% | 23.28μs | 44.89μs | 20.60μs | 912.55μs | 21K |
| Extract column metadata keys - tall | 419.82K | 2.38μs | 6.11μs | 1.10% | 2.20μs | 4.60μs | 1.89μs | 745.31μs | 210K |
| Extract row metadata keys - extraWide | 851.64K | 1.17μs | 3.83μs | 0.98% | 1.08μs | 2.50μs | 0.97μs | 650.01μs | 426K |
| Extract column metadata keys - extraWide | 23.45K | 42.64μs | 29.16μs | 1.24% | 40.67μs | 73.62μs | 34.97μs | 1.03ms | 12K |
| Extract row metadata keys - extraTall | 20.41K | 48.99μs | 28.48μs | 1.13% | 46.64μs | 85.07μs | 41.94μs | 780.04μs | 10K |
| Extract column metadata keys - extraTall | 958.07K | 1.04μs | 3.78μs | 1.03% | 0.96μs | 2.27μs | 0.85μs | 727.06μs | 479K |
| Extract row metadata keys - hubmap-lung | 162.39K | 6.16μs | 7.85μs | 0.88% | 5.81μs | 11.44μs | 5.24μs | 704.20μs | 81K |
| Extract column metadata keys - hubmap-lung | 432.72K | 2.31μs | 8.85μs | 1.61% | 2.13μs | 4.63μs | 1.57μs | 1.10ms | 216K |
| Extract row metadata keys - hubmap-kidney | 70.04K | 14.28μs | 11.24μs | 0.82% | 13.60μs | 25.84μs | 12.62μs | 731.56μs | 35K |
| Extract column metadata keys - hubmap-kidney | 647.86K | 1.54μs | 5.40μs | 1.20% | 1.47μs | 3.25μs | 1.11μs | 660.80μs | 324K |
| Extract row metadata keys - hca-data | 14.29K | 69.97μs | 28.03μs | 0.93% | 67.00μs | 121.01μs | 59.71μs | 800.46μs | 7K |
| Extract column metadata keys - hca-data | 229.29K | 4.36μs | 7.37μs | 0.98% | 4.04μs | 7.96μs | 3.62μs | 864.94μs | 115K |

## DataMap creation scales with cell count

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| 10×10 = 82 cells | 98.32K | 10.17μs | 145.59μs | 12.65% | 8.33μs | 18.28μs | 7.25μs | 30.46ms | 49K |
| 50×50 = 1548 cells | 4.36K | 229.43μs | 84.66μs | 1.55% | 223.72μs | 537.12μs | 189.49μs | 1.31ms | 2K |
| 100×100 = 4109 cells | 1.23K | 811.79μs | 468.90μs | 4.56% | 770.30μs | 4.68ms | 662.82μs | 5.12ms | 616 |
| 200×200 = 12181 cells | 250.38 | 3.99ms | 1.60ms | 7.00% | 4.07ms | 13.25ms | 3.01ms | 13.54ms | 126 |
| 500×500 = 49870 cells | 47.67 | 20.98ms | 3.36ms | 6.61% | 21.02ms | 30.93ms | 17.85ms | 30.93ms | 25 |

## DerivedStates scales with cell count

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| 10×10 = 82 cells | 129.38K | 7.73μs | 77.94μs | 7.77% | 6.95μs | 13.93μs | 5.97μs | 12.47ms | 65K |
| 50×50 = 1505 cells | 7.45K | 134.29μs | 61.86μs | 1.48% | 133.42μs | 213.58μs | 119.60μs | 3.78ms | 4K |
| 100×100 = 4027 cells | 2.07K | 483.00μs | 388.36μs | 4.90% | 470.26μs | 716.04μs | 419.60μs | 12.85ms | 1K |
| 200×200 = 12097 cells | 649.49 | 1.54ms | 122.08μs | 0.86% | 1.58ms | 1.89ms | 1.39ms | 2.68ms | 325 |
| 500×500 = 49784 cells | 153.59 | 6.51ms | 279.57μs | 0.97% | 6.63ms | 7.78ms | 5.87ms | 7.78ms | 77 |

## Asymmetrical dataset performance

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| square-50: 50×50 (793 cells) | 5.44K | 183.97μs | 78.86μs | 1.61% | 182.29μs | 310.83μs | 158.36μs | 3.31ms | 3K |
| wide-50x500: 50×500 (7548 cells) | 391.25 | 2.56ms | 980.91μs | 5.37% | 2.60ms | 11.64ms | 2.08ms | 11.93ms | 196 |
| tall-500x50: 500×50 (7466 cells) | 272.55 | 3.67ms | 920.05μs | 4.20% | 3.72ms | 9.04ms | 2.83ms | 10.09ms | 137 |
| extraWide-20x1000: 20×1000 (5005 cells) | 684.64 | 1.46ms | 525.61μs | 3.81% | 1.47ms | 5.38ms | 1.23ms | 6.78ms | 343 |
| extraTall-1000x20: 1000×20 (5061 cells) | 663.35 | 1.51ms | 393.84μs | 2.81% | 1.50ms | 2.79ms | 1.31ms | 5.78ms | 332 |

# Export

## High-Resolution Canvas Export

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny @1x resolution (10×10) | 45.61K | 21.93μs | 18.99μs | 1.12% | 19.83μs | 58.95μs | 16.77μs | 1.27ms | 23K |
| tiny @2x resolution (10×10) | 49.04K | 20.39μs | 15.73μs | 0.97% | 19.03μs | 48.35μs | 17.12μs | 671.06μs | 25K |
| tiny @4x resolution (10×10) | 48.99K | 20.41μs | 15.53μs | 0.95% | 19.26μs | 47.55μs | 16.99μs | 784.59μs | 24K |
| small @1x resolution (50×50) | 1.94K | 514.57μs | 91.34μs | 1.12% | 532.39μs | 900.21μs | 438.53μs | 1.66ms | 972 |
| small @2x resolution (50×50) | 1.97K | 506.77μs | 93.18μs | 1.15% | 516.39μs | 971.37μs | 428.93μs | 1.44ms | 987 |
| small @4x resolution (50×50) | 1.95K | 512.74μs | 105.00μs | 1.28% | 508.12μs | 1.02ms | 438.90μs | 1.22ms | 976 |
| medium @1x resolution (100×100) | 429.99 | 2.33ms | 337.97μs | 1.94% | 2.47ms | 3.45ms | 1.89ms | 3.77ms | 215 |
| medium @2x resolution (100×100) | 429.33 | 2.33ms | 420.24μs | 2.41% | 2.51ms | 3.86ms | 1.87ms | 4.17ms | 215 |
| medium @4x resolution (100×100) | 426.72 | 2.34ms | 360.02μs | 2.06% | 2.56ms | 3.26ms | 1.85ms | 3.78ms | 214 |

## Canvas Size Limits

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| 50×50 @ 10px cells (500×500px canvas) | 1.25K | 799.56μs | 163.04μs | 1.60% | 797.83μs | 1.77ms | 689.32μs | 2.37ms | 626 |
| 50×50 @ 20px cells (1000×1000px canvas) | 1.23K | 814.23μs | 255.05μs | 2.48% | 804.58μs | 1.70ms | 657.01μs | 5.32ms | 615 |
| 50×50 @ 50px cells (2500×2500px canvas) | 1.29K | 774.20μs | 140.92μs | 1.40% | 772.54μs | 1.66ms | 650.39μs | 2.11ms | 646 |
| 50×50 @ 100px cells (5000×5000px canvas) | 1.28K | 780.37μs | 162.82μs | 1.62% | 778.07μs | 1.81ms | 677.91μs | 2.49ms | 641 |

## Export Memory Efficiency

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| Create single canvas (100×100) | 299.76 | 3.34ms | 559.63μs | 2.68% | 3.49ms | 5.51ms | 2.72ms | 6.64ms | 150 |

## Complete Export Pipeline

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| Full export pipeline - tiny (10×10) | 24.34K | 41.09μs | 48.75μs | 2.11% | 38.18μs | 107.87μs | 33.79μs | 4.00ms | 12K |
| Full export pipeline - small (50×50) | 1.32K | 759.68μs | 130.14μs | 1.31% | 757.67μs | 1.43ms | 662.84μs | 1.92ms | 659 |
| Full export pipeline - medium (100×100) | 299.98 | 3.33ms | 495.97μs | 2.38% | 3.48ms | 5.15ms | 2.68ms | 5.27ms | 150 |

# Heatmap rendering

## Calculate Heatmap Cells

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny (10×10, 80 cells) | 31.25K | 32.00μs | 318.83μs | 15.62% | 32.74μs | 72.54μs | 16.59μs | 21.12ms | 16K |
| small (50×50, 1507 cells) | 1.12K | 894.76μs | 1.29ms | 11.93% | 827.53μs | 1.32ms | 683.95μs | 19.78ms | 559 |
| medium (100×100, 3978 cells) | 389.94 | 2.56ms | 1.81ms | 9.93% | 2.75ms | 17.14ms | 1.77ms | 19.68ms | 195 |
| large (200×300, 17992 cells) | 38.61 | 25.90ms | 6.31ms | 11.40% | 24.45ms | 44.45ms | 23.01ms | 44.45ms | 20 |
| huge (500×500, 50023 cells) | 7.62 | 131.22ms | 8.89ms | 4.85% | 137.70ms | 148.92ms | 122.30ms | 148.92ms | 10 |
| wide (50×500, 7573 cells) | 98.93 | 10.11ms | 3.76ms | 10.57% | 9.57ms | 29.50ms | 8.68ms | 29.50ms | 50 |
| tall (500×50, 7474 cells) | 85.64 | 11.68ms | 8.38ms | 20.84% | 10.09ms | 63.94ms | 8.59ms | 63.94ms | 48 |
| extraWide (20×1000, 5006 cells) | 113.97 | 8.77ms | 2.84ms | 8.59% | 8.64ms | 26.72ms | 7.32ms | 26.72ms | 57 |
| extraTall (1000×20, 5005 cells) | 116.61 | 8.58ms | 2.89ms | 8.78% | 8.25ms | 24.19ms | 7.09ms | 24.19ms | 59 |
| hubmap-lung (45×71, 3195 cells) | 1.32K | 757.13μs | 1.09ms | 11.01% | 675.62μs | 1.22ms | 596.79μs | 16.23ms | 661 |
| hubmap-kidney (108×48, 5184 cells) | 685.14 | 1.46ms | 1.68ms | 12.18% | 1.30ms | 13.39ms | 1.09ms | 19.92ms | 343 |
| hca-data (484×51, 24684 cells) | 90.27 | 11.08ms | 3.95ms | 10.58% | 11.26ms | 29.63ms | 8.15ms | 29.63ms | 46 |

## Calculate Heatmap Cells with Expanded Rows

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - no expanded rows (10×10) | 49.52K | 20.19μs | 379.11μs | 23.38% | 13.51μs | 44.80μs | 11.32μs | 44.40ms | 25K |
| tiny - 10% expanded rows (10×10) | 58.72K | 17.03μs | 277.96μs | 18.67% | 12.23μs | 26.02μs | 10.49μs | 20.09ms | 29K |
| tiny - 50% expanded rows (10×10) | 109.83K | 9.10μs | 179.33μs | 16.24% | 6.98μs | 19.47μs | 5.91μs | 20.64ms | 56K |
| small - no expanded rows (50×50) | 1.57K | 636.11μs | 1.20ms | 13.15% | 621.72μs | 1.71ms | 392.39μs | 19.61ms | 787 |
| small - 10% expanded rows (50×50) | 1.95K | 512.61μs | 1.33ms | 16.31% | 427.36μs | 777.16μs | 358.19μs | 26.20ms | 976 |
| small - 50% expanded rows (50×50) | 3.34K | 299.67μs | 1.16ms | 18.59% | 247.63μs | 470.76μs | 188.91μs | 31.67ms | 2K |
| medium - no expanded rows (100×100) | 332.48 | 3.01ms | 2.05ms | 10.33% | 3.05ms | 17.92ms | 1.85ms | 21.35ms | 167 |
| medium - 10% expanded rows (100×100) | 409.87 | 2.44ms | 1.99ms | 11.19% | 2.50ms | 18.22ms | 1.59ms | 18.53ms | 205 |
| medium - 50% expanded rows (100×100) | 847.03 | 1.18ms | 1.66ms | 13.40% | 1.02ms | 2.41ms | 882.76μs | 25.50ms | 424 |
| large - no expanded rows (200×300) | 37.72 | 26.51ms | 6.51ms | 11.49% | 25.67ms | 46.27ms | 23.03ms | 46.27ms | 20 |
| large - 10% expanded rows (200×300) | 41.99 | 23.81ms | 6.66ms | 12.73% | 22.52ms | 45.15ms | 20.29ms | 45.15ms | 21 |
| large - 50% expanded rows (200×300) | 78.66 | 12.71ms | 4.24ms | 10.68% | 12.21ms | 31.26ms | 10.60ms | 31.26ms | 40 |
| wide - no expanded rows (50×500) | 103.07 | 9.70ms | 1.93ms | 5.55% | 9.76ms | 22.57ms | 8.47ms | 22.57ms | 52 |
| wide - 10% expanded rows (50×500) | 107.13 | 9.33ms | 3.44ms | 10.06% | 8.97ms | 26.56ms | 7.81ms | 26.56ms | 54 |
| wide - 50% expanded rows (50×500) | 231.20 | 4.33ms | 1.76ms | 7.49% | 4.48ms | 16.77ms | 2.75ms | 17.21ms | 116 |
| tall - no expanded rows (500×50) | 95.10 | 10.52ms | 4.81ms | 13.28% | 9.61ms | 35.55ms | 8.46ms | 35.55ms | 48 |
| tall - 10% expanded rows (500×50) | 111.26 | 8.99ms | 3.64ms | 10.84% | 8.54ms | 30.17ms | 7.49ms | 30.17ms | 56 |
| tall - 50% expanded rows (500×50) | 201.56 | 4.96ms | 2.36ms | 9.40% | 4.84ms | 18.67ms | 3.67ms | 18.72ms | 101 |
| hubmap-lung - no expanded rows (45×71) | 1.24K | 808.38μs | 1.38ms | 13.46% | 694.30μs | 1.59ms | 605.07μs | 25.18ms | 619 |
| hubmap-lung - 10% expanded rows (45×71) | 1.45K | 689.69μs | 1.12ms | 11.79% | 615.74μs | 874.08μs | 527.92μs | 17.77ms | 725 |
| hubmap-lung - 50% expanded rows (45×71) | 2.63K | 379.60μs | 700.82μs | 9.97% | 344.42μs | 538.74μs | 297.01μs | 13.96ms | 1K |
| hubmap-kidney - no expanded rows (108×48) | 693.15 | 1.44ms | 1.85ms | 13.51% | 1.26ms | 11.62ms | 1.10ms | 22.22ms | 347 |
| hubmap-kidney - 10% expanded rows (108×48) | 746.81 | 1.34ms | 1.82ms | 13.77% | 1.16ms | 16.52ms | 993.42μs | 18.81ms | 374 |
| hubmap-kidney - 50% expanded rows (108×48) | 1.28K | 780.66μs | 1.98ms | 19.66% | 642.56μs | 1.32ms | 547.95μs | 41.92ms | 641 |
| hca-data - no expanded rows (484×51) | 102.81 | 9.73ms | 3.43ms | 9.82% | 9.32ms | 26.78ms | 8.12ms | 26.78ms | 52 |
| hca-data - 10% expanded rows (484×51) | 116.16 | 8.61ms | 3.01ms | 9.12% | 8.46ms | 24.78ms | 6.83ms | 24.78ms | 59 |
| hca-data - 50% expanded rows (484×51) | 173.99 | 5.75ms | 5.39ms | 20.00% | 5.17ms | 49.13ms | 3.75ms | 49.13ms | 87 |

## Render Cells to Canvas

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny (10×10, 100 rendered cells) | 4.99M | 0.20μs | 0.50μs | 0.31% | 0.20μs | 0.33μs | 0.16μs | 276.67μs | 2M |
| small (50×50, 2500 rendered cells) | 294.10K | 3.40μs | 2.06μs | 0.31% | 3.28μs | 6.02μs | 3.12μs | 236.63μs | 147K |
| medium (100×100, 10000 rendered cells) | 70.76K | 14.13μs | 6.98μs | 0.51% | 13.35μs | 26.39μs | 12.32μs | 489.08μs | 35K |
| large (200×300, 60000 rendered cells) | 12.06K | 82.89μs | 19.05μs | 0.58% | 79.99μs | 157.34μs | 71.64μs | 709.08μs | 6K |
| huge (500×500, 250000 rendered cells) | 883.13 | 1.13ms | 317.32μs | 2.61% | 1.23ms | 2.11ms | 628.99μs | 5.04ms | 442 |
| wide (50×500, 25000 rendered cells) | 29.00K | 34.49μs | 9.62μs | 0.45% | 33.04μs | 66.63μs | 31.65μs | 399.46μs | 14K |
| tall (500×50, 25000 rendered cells) | 29.23K | 34.21μs | 9.14μs | 0.43% | 32.98μs | 63.80μs | 29.73μs | 273.68μs | 15K |
| extraWide (20×1000, 20000 rendered cells) | 34.81K | 28.73μs | 9.58μs | 0.50% | 27.38μs | 57.96μs | 24.72μs | 273.60μs | 17K |
| extraTall (1000×20, 20000 rendered cells) | 35.76K | 27.96μs | 10.18μs | 0.53% | 26.58μs | 56.17μs | 23.94μs | 440.52μs | 18K |
| hubmap-lung (45×71, 3195 rendered cells) | 233.65K | 4.28μs | 4.02μs | 0.54% | 4.04μs | 7.57μs | 3.69μs | 200.23μs | 117K |
| hubmap-kidney (108×48, 5184 rendered cells) | 135.19K | 7.40μs | 4.99μs | 0.51% | 7.04μs | 15.41μs | 6.22μs | 416.55μs | 68K |
| hca-data (484×51, 24684 rendered cells) | 29.82K | 33.53μs | 4.54μs | 0.22% | 32.58μs | 57.27μs | 30.95μs | 141.71μs | 15K |

## End-to-End: Calculate + Render

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny (10×10 complete render) | 47.28K | 21.15μs | 433.02μs | 26.10% | 14.11μs | 32.03μs | 11.96μs | 52.85ms | 24K |
| small (50×50 complete render) | 1.80K | 554.49μs | 1.30ms | 15.26% | 459.85μs | 818.66μs | 403.40μs | 20.62ms | 902 |
| medium (100×100 complete render) | 364.65 | 2.74ms | 1.93ms | 10.19% | 2.88ms | 17.18ms | 1.81ms | 17.68ms | 183 |
| large (200×300 complete render) | 40.31 | 24.81ms | 4.25ms | 7.79% | 24.28ms | 42.69ms | 22.41ms | 42.69ms | 21 |

## Scalability: Cell Calculation Complexity

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| 10×10 = 29/100 non zero cells | 63.23K | 15.81μs | 183.66μs | 12.80% | 13.01μs | 25.91μs | 11.14μs | 15.83ms | 32K |
| 50×50 = 766/2500 non zero cells | 1.92K | 521.20μs | 1.19ms | 14.28% | 434.80μs | 861.05μs | 374.97μs | 25.00ms | 984 |
| 100×100 = 2985/10000 non zero cells | 433.87 | 2.30ms | 1.75ms | 10.10% | 2.24ms | 14.27ms | 1.74ms | 18.63ms | 217 |
| 200×200 = 12113/40000 non zero cells | 56.68 | 17.64ms | 6.58ms | 13.93% | 19.72ms | 42.75ms | 13.20ms | 42.75ms | 30 |
| 500×500 = 74908/250000 non zero cells | 8.11 | 123.27ms | 10.80ms | 6.27% | 136.07ms | 139.39ms | 111.64ms | 139.39ms | 10 |
| 1000×1000 = 300123/1000000 non zero cells | 1.48 | 677.83ms | 110.70ms | 11.68% | 699.61ms | 901.66ms | 605.65ms | 901.66ms | 10 |

## Asymmetrical Dataset Rendering

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| square-50x50: 50×50 (714 cells) | 1.90K | 525.63μs | 1.04ms | 12.52% | 453.97μs | 821.77μs | 395.73μs | 16.45ms | 952 |
| wide-50x500: 50×500 (7577 cells) | 104.65 | 9.56ms | 3.25ms | 9.19% | 9.18ms | 29.46ms | 8.09ms | 29.46ms | 55 |
| tall-500x50: 500×50 (7442 cells) | 92.56 | 10.80ms | 3.50ms | 9.52% | 10.54ms | 27.15ms | 9.08ms | 27.15ms | 47 |
| extraWide-20x1000: 20×1000 (5966 cells) | 114.13 | 8.76ms | 2.25ms | 6.74% | 8.90ms | 24.31ms | 7.31ms | 24.31ms | 58 |
| extraTall-1000x20: 1000×20 (5920 cells) | 106.83 | 9.36ms | 3.63ms | 10.48% | 9.01ms | 30.35ms | 7.74ms | 30.35ms | 55 |

# Side graphs

## Data Preparation for Side Graphs

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - Calculate fraction dataMap (10×10) | 77.36K | 12.93μs | 12.61μs | 0.97% | 11.72μs | 41.05μs | 10.16μs | 1.18ms | 39K |
| small - Calculate fraction dataMap (50×50) | 3.25K | 307.38μs | 36.66μs | 0.58% | 308.92μs | 391.18μs | 283.43μs | 953.99μs | 2K |
| medium - Calculate fraction dataMap (100×100) | 951.95 | 1.05ms | 489.72μs | 4.19% | 1.02ms | 1.74ms | 924.13μs | 6.49ms | 476 |
| large - Calculate fraction dataMap (200×300) | 145.96 | 6.85ms | 1.61ms | 5.47% | 6.97ms | 17.24ms | 5.44ms | 17.24ms | 73 |
| huge - Calculate fraction dataMap (500×500) | 40.91 | 24.44ms | 4.13ms | 7.69% | 23.74ms | 36.83ms | 22.20ms | 36.83ms | 21 |
| wide - Calculate fraction dataMap (50×500) | 366.35 | 2.73ms | 1.30ms | 6.87% | 2.81ms | 11.80ms | 1.90ms | 13.48ms | 184 |
| tall - Calculate fraction dataMap (500×50) | 301.34 | 3.32ms | 882.30μs | 4.24% | 3.46ms | 10.00ms | 2.52ms | 10.33ms | 151 |
| extraWide - Calculate fraction dataMap (20×1000) | 869.86 | 1.15ms | 502.60μs | 4.11% | 1.13ms | 1.91ms | 965.55μs | 6.74ms | 435 |
| extraTall - Calculate fraction dataMap (1000×20) | 570.45 | 1.75ms | 354.47μs | 2.34% | 1.78ms | 3.62ms | 1.43ms | 3.82ms | 286 |
| hubmap-lung - Calculate fraction dataMap (45×71) | 1.04K | 957.97μs | 484.39μs | 4.34% | 936.36μs | 1.30ms | 816.39μs | 6.75ms | 522 |
| hubmap-kidney - Calculate fraction dataMap (108×48) | 675.61 | 1.48ms | 436.13μs | 3.14% | 1.49ms | 2.20ms | 1.28ms | 6.21ms | 338 |
| hca-data - Calculate fraction dataMap (484×51) | 82.74 | 12.09ms | 2.58ms | 6.66% | 12.35ms | 22.77ms | 9.59ms | 22.77ms | 42 |

## Scale Creation for Side Graphs

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - categorical scale (10 items) | 266.41K | 3.75μs | 24.07μs | 3.44% | 3.30μs | 7.96μs | 2.89μs | 7.68ms | 133K |
| tiny - continuous scale for bars | 1.61M | 0.62μs | 1.23μs | 0.43% | 0.62μs | 1.15μs | 0.49μs | 263.69μs | 806K |
| small - categorical scale (50 items) | 127.18K | 7.86μs | 54.26μs | 5.36% | 6.59μs | 17.05μs | 5.63μs | 5.24ms | 64K |
| small - continuous scale for bars | 1.63M | 0.61μs | 1.65μs | 0.58% | 0.60μs | 1.13μs | 0.47μs | 645.67μs | 815K |
| medium - categorical scale (100 items) | 76.84K | 13.01μs | 64.89μs | 4.99% | 11.25μs | 23.90μs | 9.58μs | 3.27ms | 38K |
| medium - continuous scale for bars | 1.59M | 0.63μs | 1.45μs | 0.51% | 0.61μs | 1.25μs | 0.48μs | 242.01μs | 797K |
| large - categorical scale (300 items) | 26.40K | 37.88μs | 169.93μs | 7.65% | 33.41μs | 92.24μs | 28.03μs | 18.92ms | 13K |
| large - continuous scale for bars | 1.60M | 0.62μs | 0.93μs | 0.33% | 0.62μs | 1.28μs | 0.47μs | 281.22μs | 801K |
| huge - categorical scale (500 items) | 19.16K | 52.19μs | 56.08μs | 2.15% | 48.08μs | 116.48μs | 40.57μs | 2.36ms | 10K |
| huge - continuous scale for bars | 1.63M | 0.61μs | 1.45μs | 0.51% | 0.61μs | 1.18μs | 0.48μs | 770.82μs | 814K |
| wide - categorical scale (500 items) | 19.26K | 51.93μs | 51.53μs | 1.98% | 48.44μs | 115.20μs | 41.29μs | 1.39ms | 10K |
| wide - continuous scale for bars | 1.63M | 0.61μs | 0.58μs | 0.21% | 0.62μs | 1.22μs | 0.49μs | 179.06μs | 815K |
| tall - categorical scale (50 items) | 126.58K | 7.90μs | 52.91μs | 5.22% | 6.52μs | 15.24μs | 5.70μs | 3.97ms | 63K |
| tall - continuous scale for bars | 1.52M | 0.66μs | 23.87μs | 8.15% | 0.62μs | 1.36μs | 0.48μs | 20.75ms | 758K |
| extraWide - categorical scale (1000 items) | 7.55K | 132.38μs | 75.86μs | 1.83% | 128.46μs | 250.31μs | 107.64μs | 1.56ms | 4K |
| extraWide - continuous scale for bars | 1.65M | 0.60μs | 1.40μs | 0.50% | 0.61μs | 1.20μs | 0.48μs | 889.43μs | 827K |
| extraTall - categorical scale (20 items) | 216.35K | 4.62μs | 18.48μs | 2.38% | 4.18μs | 8.04μs | 3.71μs | 2.35ms | 108K |
| extraTall - continuous scale for bars | 1.61M | 0.62μs | 1.32μs | 0.46% | 0.61μs | 1.11μs | 0.49μs | 575.04μs | 807K |
| hubmap-lung - categorical scale (71 items) | 101.24K | 9.88μs | 26.88μs | 2.37% | 9.02μs | 22.40μs | 7.74μs | 1.60ms | 51K |
| hubmap-lung - continuous scale for bars | 1.60M | 0.63μs | 1.72μs | 0.60% | 0.62μs | 1.16μs | 0.48μs | 864.53μs | 800K |
| hubmap-kidney - categorical scale (48 items) | 133.18K | 7.51μs | 102.06μs | 10.32% | 6.39μs | 16.44μs | 5.52μs | 25.71ms | 67K |
| hubmap-kidney - continuous scale for bars | 1.62M | 0.62μs | 1.24μs | 0.44% | 0.61μs | 1.13μs | 0.48μs | 226.36μs | 810K |
| hca-data - categorical scale (51 items) | 137.63K | 7.27μs | 24.47μs | 2.52% | 6.57μs | 14.21μs | 5.73μs | 1.82ms | 69K |
| hca-data - continuous scale for bars | 1.63M | 0.61μs | 0.79μs | 0.28% | 0.61μs | 1.23μs | 0.47μs | 516.63μs | 814K |

## Data Aggregation for Violins (O(n×m) Complexity)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - Aggregate 10 violins × 10 categories | 49.76K | 20.10μs | 10.32μs | 0.64% | 19.46μs | 32.80μs | 17.99μs | 628.29μs | 25K |
| small - Aggregate 50 violins × 50 categories | 1.64K | 610.20μs | 63.42μs | 0.71% | 613.11μs | 981.71μs | 549.65μs | 1.30ms | 820 |
| medium - Aggregate 100 violins × 100 categories | 390.34 | 2.56ms | 395.13μs | 2.16% | 2.67ms | 3.88ms | 2.16ms | 5.39ms | 196 |
| large - Aggregate 300 violins × 200 categories | 50.78 | 19.69ms | 1.69ms | 3.46% | 20.68ms | 23.98ms | 17.54ms | 23.98ms | 26 |
| huge - Aggregate 500 violins × 500 categories | 9.86 | 101.43ms | 5.55ms | 3.91% | 105.95ms | 112.28ms | 96.20ms | 112.28ms | 10 |
| wide - Aggregate 500 violins × 50 categories | 120.41 | 8.30ms | 1.09ms | 3.35% | 8.76ms | 11.67ms | 6.44ms | 11.67ms | 61 |
| tall - Aggregate 50 violins × 500 categories | 115.63 | 8.65ms | 1.04ms | 3.16% | 8.99ms | 11.81ms | 6.91ms | 11.81ms | 58 |
| extraWide - Aggregate 1000 violins × 20 categories | 170.52 | 5.86ms | 725.62μs | 2.65% | 6.25ms | 7.84ms | 4.67ms | 7.84ms | 86 |
| extraTall - Aggregate 20 violins × 1000 categories | 163.68 | 6.11ms | 764.24μs | 2.75% | 6.49ms | 8.85ms | 4.61ms | 8.85ms | 82 |
| hubmap-lung - Aggregate 71 violins × 45 categories | 587.70 | 1.70ms | 499.96μs | 3.36% | 1.69ms | 5.34ms | 1.43ms | 5.84ms | 294 |
| hubmap-kidney - Aggregate 48 violins × 108 categories | 329.49 | 3.03ms | 638.49μs | 3.20% | 3.29ms | 5.77ms | 2.38ms | 6.21ms | 166 |
| hca-data - Aggregate 51 violins × 484 categories | 45.08 | 22.19ms | 2.06ms | 4.02% | 23.08ms | 27.67ms | 19.17ms | 27.67ms | 23 |

## Fraction Normalization (Violin Prep)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - Fraction normalization (10×10, 87 cells) | 84.02K | 11.90μs | 9.66μs | 0.78% | 11.39μs | 23.62μs | 10.24μs | 570.89μs | 42K |
| small - Fraction normalization (50×50, 1518 cells) | 3.50K | 285.87μs | 53.05μs | 0.87% | 285.23μs | 508.01μs | 246.44μs | 907.47μs | 2K |
| medium - Fraction normalization (100×100, 3950 cells) | 1.05K | 950.03μs | 434.34μs | 3.90% | 924.98μs | 1.34ms | 838.26μs | 6.28ms | 527 |
| large - Fraction normalization (200×300, 18060 cells) | 149.03 | 6.71ms | 1.55ms | 5.32% | 6.90ms | 15.67ms | 5.59ms | 15.67ms | 75 |
| huge - Fraction normalization (500×500, 49943 cells) | 41.60 | 24.04ms | 3.14ms | 5.94% | 23.97ms | 34.11ms | 21.79ms | 34.11ms | 21 |
| wide - Fraction normalization (50×500, 7568 cells) | 442.52 | 2.26ms | 985.93μs | 5.74% | 2.29ms | 5.26ms | 1.85ms | 12.15ms | 222 |
| tall - Fraction normalization (500×50, 7448 cells) | 388.28 | 2.58ms | 958.85μs | 5.23% | 2.57ms | 9.82ms | 2.16ms | 10.39ms | 195 |
| extraWide - Fraction normalization (20×1000, 5131 cells) | 914.95 | 1.09ms | 441.31μs | 3.70% | 1.07ms | 1.43ms | 968.19μs | 6.02ms | 458 |
| extraTall - Fraction normalization (1000×20, 4965 cells) | 592.12 | 1.69ms | 335.99μs | 2.26% | 1.76ms | 3.40ms | 1.39ms | 3.77ms | 297 |
| hubmap-lung - Fraction normalization (45×71, 3195 cells) | 1.09K | 916.28μs | 429.09μs | 3.93% | 907.69μs | 1.32ms | 784.13μs | 6.30ms | 546 |
| hubmap-kidney - Fraction normalization (108×48, 5184 cells) | 702.70 | 1.42ms | 422.13μs | 3.10% | 1.42ms | 2.88ms | 1.23ms | 5.75ms | 352 |
| hca-data - Fraction normalization (484×51, 24684 cells) | 78.73 | 12.70ms | 2.50ms | 6.31% | 12.49ms | 23.50ms | 10.62ms | 23.50ms | 40 |

## Bar Stacking Calculations

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - Stack 10 segments × 10 bars | 88.00K | 11.36μs | 6.67μs | 0.55% | 10.96μs | 21.34μs | 10.30μs | 638.16μs | 44K |
| small - Stack 50 segments × 50 bars | 196.31 | 5.09ms | 143.66μs | 0.56% | 5.13ms | 6.08ms | 4.88ms | 6.08ms | 99 |
| medium - Stack 100 segments × 100 bars | 16.46 | 60.76ms | 845.79μs | 1.00% | 61.46ms | 62.33ms | 59.49ms | 62.33ms | 10 |
| large - Stack 200 segments × 300 bars | 0.43 | 2.32s | 27.08ms | 0.84% | 2.32s | 2.37s | 2.29s | 2.37s | 10 |
| huge - Stack 500 segments × 500 bars | 0.04 | 27.41s | 299.94ms | 0.78% | 27.74s | 27.81s | 27.02s | 27.81s | 10 |
| wide - Stack 50 segments × 500 bars | 3.09 | 323.82ms | 8.14ms | 1.80% | 328.26ms | 343.11ms | 317.07ms | 343.11ms | 10 |
| tall - Stack 500 segments × 50 bars | 3.12 | 320.24ms | 5.30ms | 1.18% | 322.38ms | 330.35ms | 313.58ms | 330.35ms | 10 |
| extraWide - Stack 20 segments × 1000 bars | 5.55 | 180.02ms | 2.20ms | 0.87% | 181.00ms | 185.33ms | 177.94ms | 185.33ms | 10 |
| extraTall - Stack 1000 segments × 20 bars | 5.67 | 176.34ms | 2.33ms | 0.95% | 177.84ms | 179.76ms | 171.92ms | 179.76ms | 10 |
| hubmap-lung - Stack 45 segments × 71 bars | 100.91 | 9.91ms | 260.58μs | 0.74% | 10.06ms | 10.57ms | 9.47ms | 10.57ms | 51 |
| hubmap-kidney - Stack 108 segments × 48 bars | 38.50 | 25.97ms | 446.68μs | 0.80% | 26.13ms | 27.06ms | 25.06ms | 27.06ms | 20 |
| hca-data - Stack 484 segments × 51 bars | 1.62 | 616.90ms | 4.90ms | 0.57% | 619.69ms | 626.64ms | 609.81ms | 626.64ms | 10 |

## Scalability Analysis

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - Full data aggregation (10×10, 87 cells) | 45.58K | 21.94μs | 15.76μs | 0.93% | 19.44μs | 105.46μs | 17.62μs | 379.96μs | 23K |
| small - Full data aggregation (50×50, 1518 cells) | 1.58K | 631.36μs | 90.18μs | 0.99% | 635.09μs | 971.72μs | 553.56μs | 1.45ms | 792 |
| medium - Full data aggregation (100×100, 3950 cells) | 362.97 | 2.76ms | 675.03μs | 3.56% | 2.95ms | 5.11ms | 2.15ms | 8.61ms | 182 |
| large - Full data aggregation (200×300, 18060 cells) | 45.84 | 21.82ms | 1.67ms | 3.31% | 23.45ms | 25.08ms | 19.30ms | 25.08ms | 23 |
| huge - Full data aggregation (500×500, 49943 cells) | 8.80 | 113.66ms | 9.59ms | 6.04% | 121.59ms | 127.26ms | 99.12ms | 127.26ms | 10 |
| wide - Full data aggregation (50×500, 7568 cells) | 137.99 | 7.25ms | 1.15ms | 3.80% | 7.64ms | 12.51ms | 5.79ms | 12.51ms | 70 |
| tall - Full data aggregation (500×50, 7448 cells) | 117.63 | 8.50ms | 1.29ms | 3.97% | 8.93ms | 13.43ms | 6.58ms | 13.43ms | 59 |
| extraWide - Full data aggregation (20×1000, 5131 cells) | 194.68 | 5.14ms | 673.04μs | 2.63% | 5.47ms | 7.55ms | 3.92ms | 7.55ms | 98 |
| extraTall - Full data aggregation (1000×20, 4965 cells) | 164.99 | 6.06ms | 783.99μs | 2.82% | 6.61ms | 8.57ms | 4.63ms | 8.57ms | 83 |
| hubmap-lung - Full data aggregation (45×71, 3195 cells) | 657.73 | 1.52ms | 472.46μs | 3.36% | 1.49ms | 5.28ms | 1.36ms | 6.01ms | 329 |
| hubmap-kidney - Full data aggregation (108×48, 5184 cells) | 396.86 | 2.52ms | 529.52μs | 2.92% | 2.53ms | 5.75ms | 2.23ms | 6.90ms | 199 |
| hca-data - Full data aggregation (484×51, 24684 cells) | 47.54 | 21.03ms | 2.34ms | 4.70% | 21.34ms | 30.08ms | 18.09ms | 30.08ms | 24 |

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

