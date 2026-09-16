# Scellop Performance Report

Generated: 2026-01-14T21:47:04.369Z

## Summary

This report presents benchmark results for Scellop's core operations across various dataset sizes. Cell counts in benchmark names refer to non-empty cells in the sparse heatmap matrix.

## Datasets

All benchmarks run on the following datasets:

| Dataset | Type | Dimensions | Non-Zero Cells | Density | Row Sum Avg | Row Sum Range |
|---------|------|------------|----------------|---------|-------------|---------------|
| tiny | synthetic | 10×10 | 82 | 82.0% | 4K | 3K-6K |
| small | synthetic | 50×50 | 1K | 59.6% | 15K | 8K-20K |
| medium | synthetic | 100×100 | 4K | 41.5% | 21K | 10K-28K |
| extraWide | synthetic | 20×1000 | 5K | 25.1% | 126K | 109K-136K |
| extraTall | synthetic | 1000×20 | 5K | 25.4% | 3K | 0-7K |
| wide | synthetic | 50×500 | 7K | 29.9% | 76K | 61K-97K |
| tall | synthetic | 500×50 | 8K | 30.4% | 8K | 2K-16K |
| large | synthetic | 200×300 | 18K | 30.1% | 45K | 33K-60K |
| huge | synthetic | 500×500 | 50K | 19.9% | 50K | 35K-73K |
| hubmap-lung | real-world | 45×71 | 1K | 44.9% | 17K | 4K-75K |
| hubmap-kidney | real-world | 108×48 | 4K | 73.1% | 12K | 382-51K |
| hca-data | real-world | 484×51 | 12K | 48.0% | 5K | 8-54K |

# Data processing

## DataMap Creation (Raw Counts)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 96.94K | 10.32μs | 64.02μs | 5.52% | 9.99μs | 28.41μs | 6.63μs | 5.78ms | 48K |
| small | 4.47K | 223.53μs | 57.85μs | 1.07% | 219.64μs | 406.36μs | 194.26μs | 963.20μs | 2K |
| medium | 1.25K | 801.85μs | 419.18μs | 4.10% | 776.48μs | 4.32ms | 681.27μs | 4.99ms | 624 |
| large | 213.02 | 4.69ms | 1.44ms | 5.87% | 4.69ms | 11.25ms | 3.76ms | 11.90ms | 107 |
| huge | 51.59 | 19.38ms | 3.20ms | 6.66% | 19.04ms | 28.33ms | 16.29ms | 28.33ms | 26 |
| wide | 544.81 | 1.84ms | 986.74μs | 6.38% | 1.74ms | 8.00ms | 1.53ms | 9.68ms | 273 |
| tall | 551.57 | 1.81ms | 924.55μs | 6.02% | 1.72ms | 8.54ms | 1.51ms | 8.71ms | 276 |
| extraWide | 994.18 | 1.01ms | 382.23μs | 3.34% | 976.84μs | 3.97ms | 892.83μs | 4.71ms | 498 |
| extraTall | 967.88 | 1.03ms | 438.60μs | 3.78% | 975.75μs | 4.25ms | 900.83μs | 4.77ms | 484 |
| hubmap-lung | 1.15K | 870.07μs | 457.77μs | 4.30% | 848.97μs | 4.82ms | 746.77μs | 5.70ms | 575 |
| hubmap-kidney | 762.19 | 1.31ms | 407.64μs | 3.12% | 1.28ms | 4.13ms | 1.17ms | 5.11ms | 382 |
| hca-data | 106.62 | 9.38ms | 2.45ms | 7.14% | 9.15ms | 23.13ms | 8.17ms | 23.13ms | 54 |

## Derived States Calculation

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 139.21K | 7.18μs | 88.45μs | 9.15% | 6.04μs | 14.62μs | 5.27μs | 13.73ms | 70K |
| small | 7.77K | 128.65μs | 57.81μs | 1.41% | 127.87μs | 187.85μs | 114.29μs | 3.64ms | 4K |
| medium | 2.14K | 467.56μs | 333.01μs | 4.27% | 482.49μs | 635.67μs | 398.24μs | 11.23ms | 1K |
| large | 469.89 | 2.13ms | 87.35μs | 0.52% | 2.15ms | 2.50ms | 2.00ms | 2.71ms | 235 |
| huge | 147.77 | 6.77ms | 240.35μs | 0.82% | 6.79ms | 8.06ms | 6.47ms | 8.06ms | 74 |
| wide | 1.51K | 664.40μs | 61.05μs | 0.66% | 661.42μs | 839.45μs | 617.03μs | 1.76ms | 753 |
| tall | 808.56 | 1.24ms | 98.68μs | 0.78% | 1.24ms | 1.78ms | 1.15ms | 2.02ms | 405 |
| extraWide | 2.49K | 401.93μs | 59.74μs | 0.83% | 400.02μs | 595.76μs | 354.73μs | 1.48ms | 1K |
| extraTall | 2.35K | 425.82μs | 74.84μs | 1.00% | 422.96μs | 739.31μs | 372.99μs | 1.41ms | 1K |
| hubmap-lung | 4.81K | 207.79μs | 33.11μs | 0.64% | 207.22μs | 285.89μs | 183.81μs | 1.53ms | 2K |
| hubmap-kidney | 3.05K | 328.18μs | 58.09μs | 0.89% | 327.81μs | 387.91μs | 298.47μs | 2.47ms | 2K |
| hca-data | 631.48 | 1.58ms | 151.22μs | 1.05% | 1.58ms | 2.22ms | 1.46ms | 3.18ms | 316 |

## Row Fraction Normalization

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 123.44K | 8.10μs | 6.55μs | 0.64% | 7.94μs | 13.56μs | 7.26μs | 707.43μs | 62K |
| small | 3.74K | 267.04μs | 49.20μs | 0.83% | 265.55μs | 434.25μs | 241.12μs | 1.13ms | 2K |
| medium | 1.11K | 902.02μs | 457.66μs | 4.22% | 871.83μs | 1.38ms | 798.94μs | 6.62ms | 555 |
| large | 202.46 | 4.94ms | 1.49ms | 5.94% | 4.91ms | 15.14ms | 4.17ms | 15.31ms | 102 |
| huge | 51.39 | 19.46ms | 3.28ms | 6.80% | 19.37ms | 30.77ms | 17.30ms | 30.77ms | 26 |
| wide | 531.90 | 1.88ms | 1.02ms | 6.52% | 1.79ms | 11.36ms | 1.69ms | 11.41ms | 266 |
| tall | 463.01 | 2.16ms | 1.09ms | 6.50% | 2.07ms | 11.29ms | 1.83ms | 11.84ms | 232 |
| extraWide | 936.95 | 1.07ms | 479.73μs | 4.07% | 1.05ms | 3.42ms | 912.17μs | 6.34ms | 469 |
| extraTall | 898.84 | 1.11ms | 487.76μs | 4.05% | 1.09ms | 2.81ms | 943.98μs | 6.35ms | 450 |
| hubmap-lung | 1.09K | 918.63μs | 485.80μs | 4.44% | 892.51μs | 1.29ms | 805.31μs | 6.64ms | 545 |
| hubmap-kidney | 715.99 | 1.40ms | 424.42μs | 3.15% | 1.39ms | 1.82ms | 1.26ms | 6.02ms | 358 |
| hca-data | 98.47 | 10.16ms | 2.30ms | 6.43% | 9.96ms | 21.15ms | 8.87ms | 21.15ms | 50 |

## Log Normalization

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 104.51K | 9.57μs | 46.33μs | 4.15% | 8.50μs | 18.35μs | 7.67μs | 3.73ms | 52K |
| small | 4.39K | 227.63μs | 67.22μs | 1.23% | 223.82μs | 401.26μs | 196.54μs | 1.27ms | 2K |
| medium | 1.22K | 816.58μs | 507.88μs | 4.92% | 781.65μs | 1.20ms | 684.64μs | 6.45ms | 613 |
| large | 232.34 | 4.30ms | 1.47ms | 6.25% | 4.25ms | 15.05ms | 3.69ms | 15.11ms | 117 |
| huge | 51.87 | 19.28ms | 3.76ms | 7.87% | 19.56ms | 31.92ms | 16.64ms | 31.92ms | 26 |
| wide | 506.42 | 1.97ms | 1.11ms | 6.91% | 1.90ms | 11.81ms | 1.67ms | 12.18ms | 254 |
| tall | 501.56 | 1.99ms | 911.44μs | 5.66% | 1.96ms | 3.63ms | 1.65ms | 12.11ms | 251 |
| extraWide | 887.72 | 1.13ms | 521.89μs | 4.31% | 1.09ms | 1.60ms | 991.96μs | 7.10ms | 444 |
| extraTall | 890.84 | 1.12ms | 514.21μs | 4.25% | 1.08ms | 1.84ms | 997.42μs | 6.70ms | 446 |
| hubmap-lung | 1.04K | 964.48μs | 538.29μs | 4.80% | 917.36μs | 3.05ms | 799.64μs | 7.00ms | 519 |
| hubmap-kidney | 653.94 | 1.53ms | 580.54μs | 4.11% | 1.54ms | 3.72ms | 1.28ms | 7.41ms | 327 |
| hca-data | 81.52 | 12.27ms | 2.90ms | 7.46% | 12.11ms | 23.29ms | 10.29ms | 23.29ms | 41 |

## Metadata Processing

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| Extract row metadata keys - tiny | 1.54M | 0.65μs | 4.03μs | 1.39% | 0.58μs | 1.31μs | 0.51μs | 961.86μs | 771K |
| Extract column metadata keys - tiny | 1.73M | 0.58μs | 14.35μs | 5.23% | 0.52μs | 1.05μs | 0.45μs | 13.09ms | 864K |
| Extract row metadata keys - small | 404.53K | 2.47μs | 6.45μs | 1.14% | 2.28μs | 4.34μs | 1.96μs | 756.46μs | 202K |
| Extract column metadata keys - small | 468.25K | 2.14μs | 5.37μs | 1.02% | 2.02μs | 3.81μs | 1.73μs | 699.27μs | 234K |
| Extract row metadata keys - medium | 206.92K | 4.83μs | 8.61μs | 1.09% | 4.53μs | 9.61μs | 3.91μs | 666.28μs | 103K |
| Extract column metadata keys - medium | 247.62K | 4.04μs | 7.58μs | 1.05% | 3.83μs | 6.76μs | 3.30μs | 832.27μs | 124K |
| Extract row metadata keys - large | 107.26K | 9.32μs | 12.16μs | 1.10% | 8.73μs | 19.29μs | 7.54μs | 730.05μs | 54K |
| Extract column metadata keys - large | 82.99K | 12.05μs | 13.88μs | 1.11% | 11.50μs | 27.10μs | 9.40μs | 838.54μs | 41K |
| Extract row metadata keys - huge | 44.66K | 22.39μs | 15.74μs | 0.92% | 21.73μs | 41.09μs | 19.68μs | 594.73μs | 22K |
| Extract column metadata keys - huge | 54.58K | 18.32μs | 9.82μs | 0.64% | 17.94μs | 29.32μs | 16.48μs | 657.10μs | 27K |
| Extract row metadata keys - wide | 415.12K | 2.41μs | 5.47μs | 0.98% | 2.29μs | 4.10μs | 1.97μs | 767.17μs | 208K |
| Extract column metadata keys - wide | 52.71K | 18.97μs | 16.91μs | 1.08% | 18.54μs | 32.64μs | 16.05μs | 706.24μs | 26K |
| Extract row metadata keys - tall | 45.16K | 22.14μs | 16.92μs | 1.00% | 21.69μs | 38.41μs | 18.11μs | 693.76μs | 23K |
| Extract column metadata keys - tall | 480.00K | 2.08μs | 5.40μs | 1.04% | 1.97μs | 3.63μs | 1.65μs | 764.42μs | 240K |
| Extract row metadata keys - extraWide | 938.71K | 1.07μs | 3.49μs | 0.94% | 1.01μs | 2.23μs | 0.87μs | 618.22μs | 469K |
| Extract column metadata keys - extraWide | 26.59K | 37.61μs | 23.27μs | 1.05% | 36.34μs | 61.62μs | 31.63μs | 872.82μs | 13K |
| Extract row metadata keys - extraTall | 22.47K | 44.50μs | 25.56μs | 1.06% | 42.77μs | 80.02μs | 37.31μs | 646.08μs | 11K |
| Extract column metadata keys - extraTall | 1.06M | 0.94μs | 3.42μs | 0.98% | 0.88μs | 2.04μs | 0.76μs | 739.85μs | 531K |
| Extract row metadata keys - hubmap-lung | 164.90K | 6.06μs | 8.83μs | 0.99% | 5.46μs | 12.71μs | 5.18μs | 869.68μs | 82K |
| Extract column metadata keys - hubmap-lung | 462.96K | 2.16μs | 7.45μs | 1.41% | 1.95μs | 3.78μs | 1.58μs | 718.20μs | 231K |
| Extract row metadata keys - hubmap-kidney | 71.43K | 14.00μs | 13.57μs | 1.01% | 12.72μs | 32.17μs | 11.51μs | 684.09μs | 36K |
| Extract column metadata keys - hubmap-kidney | 690.71K | 1.45μs | 5.50μs | 1.27% | 1.35μs | 2.77μs | 1.10μs | 859.08μs | 345K |
| Extract row metadata keys - hca-data | 13.61K | 73.45μs | 31.13μs | 1.01% | 69.74μs | 148.62μs | 61.54μs | 799.67μs | 7K |
| Extract column metadata keys - hca-data | 246.40K | 4.06μs | 6.41μs | 0.88% | 3.84μs | 7.16μs | 3.52μs | 693.90μs | 123K |

## DataMap creation scales with cell count

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 102.80K | 9.73μs | 129.40μs | 11.50% | 7.82μs | 18.23μs | 6.82μs | 26.83ms | 51K |
| small | 4.38K | 228.34μs | 71.89μs | 1.32% | 222.84μs | 529.92μs | 197.00μs | 1.18ms | 2K |
| medium | 1.22K | 821.34μs | 465.61μs | 4.50% | 776.55μs | 4.44ms | 695.44μs | 5.88ms | 609 |
| large | 208.58 | 4.79ms | 1.26ms | 5.08% | 4.69ms | 10.99ms | 4.10ms | 11.04ms | 105 |
| huge | 50.31 | 19.88ms | 2.81ms | 5.71% | 20.14ms | 27.95ms | 17.31ms | 27.95ms | 26 |
| wide | 538.84 | 1.86ms | 924.67μs | 5.94% | 1.78ms | 8.54ms | 1.52ms | 8.79ms | 270 |
| tall | 534.77 | 1.87ms | 904.99μs | 5.79% | 1.82ms | 8.34ms | 1.54ms | 8.59ms | 268 |
| extraWide | 974.96 | 1.03ms | 466.73μs | 4.04% | 980.65μs | 4.19ms | 891.51μs | 6.11ms | 488 |
| extraTall | 890.50 | 1.12ms | 495.82μs | 4.10% | 1.07ms | 4.98ms | 962.83μs | 6.06ms | 446 |
| hubmap-lung | 1.16K | 865.47μs | 477.22μs | 4.50% | 829.31μs | 4.96ms | 754.45μs | 6.35ms | 578 |
| hubmap-kidney | 783.87 | 1.28ms | 385.05μs | 2.99% | 1.24ms | 4.21ms | 1.17ms | 4.76ms | 392 |
| hca-data | 106.35 | 9.40ms | 1.93ms | 5.60% | 9.44ms | 17.71ms | 8.04ms | 17.71ms | 54 |

## DerivedStates scales with cell count

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 141.43K | 7.07μs | 84.00μs | 8.76% | 6.32μs | 12.25μs | 5.60μs | 11.95ms | 71K |
| small | 7.73K | 129.39μs | 178.13μs | 4.34% | 125.21μs | 176.41μs | 115.75μs | 11.02ms | 4K |
| medium | 2.30K | 435.42μs | 81.18μs | 1.08% | 434.71μs | 535.96μs | 411.70μs | 2.99ms | 1K |
| large | 464.13 | 2.15ms | 127.21μs | 0.76% | 2.18ms | 2.67ms | 2.03ms | 3.64ms | 233 |
| huge | 154.66 | 6.47ms | 190.20μs | 0.66% | 6.50ms | 7.66ms | 6.19ms | 7.66ms | 78 |
| wide | 1.51K | 661.54μs | 51.26μs | 0.55% | 660.24μs | 854.86μs | 627.24μs | 1.60ms | 756 |
| tall | 825.91 | 1.21ms | 85.04μs | 0.68% | 1.21ms | 1.57ms | 1.15ms | 2.28ms | 413 |
| extraWide | 2.52K | 397.33μs | 60.04μs | 0.83% | 395.85μs | 578.32μs | 354.27μs | 1.32ms | 1K |
| extraTall | 2.42K | 412.60μs | 61.05μs | 0.83% | 409.58μs | 605.20μs | 379.61μs | 1.31ms | 1K |
| hubmap-lung | 4.77K | 209.65μs | 35.98μs | 0.69% | 209.99μs | 303.40μs | 187.45μs | 1.57ms | 2K |
| hubmap-kidney | 3.05K | 327.58μs | 54.76μs | 0.84% | 326.72μs | 453.33μs | 289.77μs | 2.13ms | 2K |
| hca-data | 651.22 | 1.54ms | 163.43μs | 1.16% | 1.53ms | 2.32ms | 1.46ms | 3.60ms | 326 |

# Export

## High-Resolution Canvas Export

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny @1x resolution | 51.64K | 19.36μs | 13.19μs | 0.83% | 18.72μs | 34.77μs | 16.96μs | 865.94μs | 26K |
| tiny @2x resolution | 52.04K | 19.21μs | 12.22μs | 0.77% | 18.48μs | 36.74μs | 16.69μs | 718.78μs | 26K |
| tiny @4x resolution | 52.39K | 19.09μs | 12.76μs | 0.81% | 18.39μs | 34.64μs | 16.74μs | 574.86μs | 26K |
| small @1x resolution | 2.19K | 456.42μs | 64.13μs | 0.83% | 453.27μs | 922.73μs | 417.74μs | 1.01ms | 1K |
| small @2x resolution | 2.15K | 464.61μs | 64.56μs | 0.83% | 467.21μs | 867.52μs | 419.34μs | 1.17ms | 1K |
| small @4x resolution | 2.19K | 456.08μs | 70.97μs | 0.92% | 450.23μs | 922.77μs | 419.90μs | 1.20ms | 1K |
| medium @1x resolution | 499.14 | 2.00ms | 234.07μs | 1.45% | 2.02ms | 2.99ms | 1.80ms | 3.66ms | 250 |
| medium @2x resolution | 500.62 | 2.00ms | 210.94μs | 1.31% | 2.02ms | 2.87ms | 1.77ms | 3.37ms | 251 |
| medium @4x resolution | 502.67 | 1.99ms | 209.50μs | 1.30% | 2.02ms | 2.93ms | 1.80ms | 3.33ms | 252 |
| large @1x resolution | 50.72 | 19.71ms | 2.66ms | 5.46% | 19.62ms | 25.75ms | 17.12ms | 25.75ms | 26 |
| large @2x resolution | 49.95 | 20.02ms | 1.56ms | 3.15% | 20.88ms | 23.81ms | 18.23ms | 23.81ms | 26 |
| large @4x resolution | 50.86 | 19.66ms | 2.23ms | 4.59% | 20.56ms | 26.18ms | 16.54ms | 26.18ms | 26 |
| huge @1x resolution | 9.99 | 100.12ms | 4.69ms | 3.35% | 101.75ms | 110.77ms | 93.97ms | 110.77ms | 10 |
| huge @2x resolution | 11.26 | 88.84ms | 7.11ms | 5.72% | 90.55ms | 106.75ms | 82.57ms | 106.75ms | 10 |
| huge @4x resolution | 9.46 | 105.67ms | 8.20ms | 5.55% | 112.05ms | 118.85ms | 96.51ms | 118.85ms | 10 |
| wide @1x resolution | 120.18 | 8.32ms | 2.18ms | 6.72% | 8.44ms | 23.49ms | 6.35ms | 23.49ms | 61 |
| wide @2x resolution | 117.59 | 8.50ms | 867.56μs | 2.66% | 8.98ms | 11.37ms | 7.38ms | 11.37ms | 59 |
| wide @4x resolution | 105.30 | 9.50ms | 1.34ms | 3.89% | 9.80ms | 14.77ms | 8.04ms | 14.77ms | 53 |
| tall @1x resolution | 126.69 | 7.89ms | 785.89μs | 2.49% | 8.30ms | 10.20ms | 6.42ms | 10.20ms | 64 |
| tall @2x resolution | 136.78 | 7.31ms | 900.76μs | 2.96% | 7.98ms | 10.03ms | 6.16ms | 10.03ms | 69 |
| tall @4x resolution | 135.16 | 7.40ms | 1.22ms | 3.99% | 7.62ms | 13.35ms | 6.16ms | 13.35ms | 68 |
| extraWide @1x resolution | 152.17 | 6.57ms | 561.36μs | 1.94% | 6.81ms | 8.41ms | 5.54ms | 8.41ms | 77 |
| extraWide @2x resolution | 146.53 | 6.82ms | 829.26μs | 2.82% | 7.25ms | 9.06ms | 5.28ms | 9.06ms | 74 |
| extraWide @4x resolution | 171.40 | 5.83ms | 882.20μs | 3.24% | 6.32ms | 9.76ms | 4.20ms | 9.76ms | 86 |
| extraTall @1x resolution | 180.88 | 5.53ms | 544.39μs | 2.05% | 5.88ms | 7.05ms | 4.43ms | 7.05ms | 91 |
| extraTall @2x resolution | 170.88 | 5.85ms | 754.68μs | 2.77% | 6.10ms | 8.34ms | 4.50ms | 8.34ms | 86 |
| extraTall @4x resolution | 180.41 | 5.54ms | 574.30μs | 2.16% | 5.86ms | 7.54ms | 4.58ms | 7.54ms | 91 |
| hubmap-lung @1x resolution | 1.47K | 678.68μs | 96.99μs | 1.03% | 674.07μs | 1.25ms | 629.61μs | 1.95ms | 737 |
| hubmap-lung @2x resolution | 1.43K | 698.93μs | 131.75μs | 1.38% | 687.37μs | 1.31ms | 619.84μs | 2.04ms | 716 |
| hubmap-lung @4x resolution | 1.44K | 694.63μs | 103.71μs | 1.09% | 687.11μs | 1.30ms | 620.08μs | 1.55ms | 720 |
| hubmap-kidney @1x resolution | 819.43 | 1.22ms | 157.75μs | 1.25% | 1.22ms | 1.98ms | 1.12ms | 2.95ms | 410 |
| hubmap-kidney @2x resolution | 823.02 | 1.22ms | 140.04μs | 1.11% | 1.21ms | 1.95ms | 1.13ms | 2.07ms | 412 |
| hubmap-kidney @4x resolution | 837.54 | 1.19ms | 119.47μs | 0.96% | 1.19ms | 1.90ms | 1.13ms | 2.01ms | 419 |
| hca-data @1x resolution | 109.18 | 9.16ms | 1.16ms | 3.42% | 9.67ms | 12.87ms | 7.23ms | 12.87ms | 55 |
| hca-data @2x resolution | 117.24 | 8.53ms | 801.10μs | 2.45% | 8.88ms | 10.77ms | 7.30ms | 10.77ms | 59 |
| hca-data @4x resolution | 120.82 | 8.28ms | 1.13ms | 3.49% | 8.43ms | 14.74ms | 6.99ms | 14.74ms | 61 |

## Canvas Size Limits

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - 10px cells (100×100px canvas) | 27.69K | 36.12μs | 42.68μs | 1.97% | 34.54μs | 67.02μs | 30.43μs | 2.67ms | 14K |
| tiny - 20px cells (200×200px canvas) | 28.05K | 35.66μs | 25.26μs | 1.17% | 33.80μs | 69.30μs | 30.23μs | 857.46μs | 14K |
| tiny - 50px cells (500×500px canvas) | 28.66K | 34.90μs | 21.19μs | 0.99% | 33.74μs | 64.45μs | 30.68μs | 835.06μs | 14K |
| tiny - 100px cells (1000×1000px canvas) | 28.75K | 34.79μs | 21.08μs | 0.99% | 33.85μs | 57.31μs | 30.91μs | 826.01μs | 14K |
| small - 10px cells (500×500px canvas) | 1.55K | 646.15μs | 75.62μs | 0.82% | 643.45μs | 1.16ms | 604.27μs | 1.36ms | 774 |
| small - 20px cells (1000×1000px canvas) | 1.50K | 667.17μs | 95.27μs | 1.02% | 680.70μs | 1.20ms | 596.91μs | 1.44ms | 750 |
| small - 50px cells (2500×2500px canvas) | 1.50K | 667.38μs | 88.24μs | 0.95% | 683.89μs | 1.17ms | 593.68μs | 1.51ms | 750 |
| small - 100px cells (5000×5000px canvas) | 1.56K | 641.39μs | 81.47μs | 0.89% | 636.18μs | 1.16ms | 599.17μs | 1.44ms | 780 |
| medium - 10px cells (1000×1000px canvas) | 393.39 | 2.54ms | 367.56μs | 2.02% | 2.52ms | 4.39ms | 2.31ms | 4.50ms | 197 |
| medium - 20px cells (2000×2000px canvas) | 391.21 | 2.56ms | 397.16μs | 2.18% | 2.52ms | 4.78ms | 2.31ms | 5.06ms | 196 |
| medium - 50px cells (5000×5000px canvas) | 381.07 | 2.62ms | 391.60μs | 2.12% | 2.65ms | 4.63ms | 2.34ms | 4.81ms | 191 |
| medium - 100px cells (10000×10000px canvas) | 394.18 | 2.54ms | 326.61μs | 1.79% | 2.53ms | 4.06ms | 2.31ms | 4.14ms | 198 |
| large - 10px cells (3000×2000px canvas) | 42.75 | 23.39ms | 1.65ms | 3.13% | 24.03ms | 27.41ms | 21.78ms | 27.41ms | 22 |
| large - 20px cells (6000×4000px canvas) | 37.97 | 26.34ms | 1.79ms | 3.28% | 26.87ms | 30.62ms | 23.73ms | 30.62ms | 19 |
| large - 50px cells (15000×10000px canvas) | 38.97 | 25.66ms | 2.13ms | 3.89% | 26.20ms | 30.15ms | 23.44ms | 30.15ms | 20 |
| large - 100px cells (30000×20000px canvas) | 41.13 | 24.31ms | 1.52ms | 2.85% | 24.58ms | 27.79ms | 22.48ms | 27.79ms | 21 |
| huge - 10px cells (5000×5000px canvas) | 7.72 | 129.50ms | 20.14ms | 11.12% | 133.03ms | 182.75ms | 112.49ms | 182.75ms | 10 |
| huge - 20px cells (10000×10000px canvas) | 7.92 | 126.34ms | 20.14ms | 11.40% | 128.16ms | 180.88ms | 113.86ms | 180.88ms | 10 |
| huge - 50px cells (25000×25000px canvas) | 8.12 | 123.13ms | 4.61ms | 2.68% | 127.22ms | 131.47ms | 117.51ms | 131.47ms | 10 |
| huge - 100px cells (50000×50000px canvas) | 7.54 | 132.56ms | 6.78ms | 3.66% | 136.91ms | 143.40ms | 124.40ms | 143.40ms | 10 |
| wide - 10px cells (5000×500px canvas) | 92.29 | 10.83ms | 1.06ms | 2.88% | 11.29ms | 13.32ms | 9.47ms | 13.32ms | 47 |
| wide - 20px cells (10000×1000px canvas) | 97.68 | 10.24ms | 1.03ms | 2.89% | 10.53ms | 13.40ms | 9.01ms | 13.40ms | 49 |
| wide - 50px cells (25000×2500px canvas) | 90.91 | 11.00ms | 1.53ms | 4.12% | 11.18ms | 17.88ms | 9.77ms | 17.88ms | 46 |
| wide - 100px cells (50000×5000px canvas) | 96.77 | 10.33ms | 1.03ms | 2.85% | 10.70ms | 14.00ms | 9.15ms | 14.00ms | 49 |
| tall - 10px cells (500×5000px canvas) | 98.46 | 10.16ms | 1.18ms | 3.30% | 10.28ms | 15.38ms | 8.74ms | 15.38ms | 50 |
| tall - 20px cells (1000×10000px canvas) | 99.88 | 10.01ms | 1.02ms | 2.91% | 10.49ms | 13.45ms | 8.19ms | 13.45ms | 50 |
| tall - 50px cells (2500×25000px canvas) | 107.49 | 9.30ms | 1.04ms | 3.06% | 9.97ms | 12.35ms | 7.86ms | 12.35ms | 54 |
| tall - 100px cells (5000×50000px canvas) | 111.92 | 8.93ms | 1.20ms | 3.59% | 8.97ms | 13.90ms | 7.77ms | 13.90ms | 56 |
| extraWide - 10px cells (10000×200px canvas) | 147.34 | 6.79ms | 735.13μs | 2.51% | 6.92ms | 9.53ms | 5.94ms | 9.53ms | 74 |
| extraWide - 20px cells (20000×400px canvas) | 149.88 | 6.67ms | 689.97μs | 2.38% | 6.81ms | 9.07ms | 5.81ms | 9.07ms | 75 |
| extraWide - 50px cells (50000×1000px canvas) | 129.94 | 7.70ms | 822.10μs | 2.63% | 8.13ms | 9.75ms | 6.14ms | 9.75ms | 66 |
| extraWide - 100px cells (100000×2000px canvas) | 133.34 | 7.50ms | 884.04μs | 2.88% | 8.05ms | 10.22ms | 6.02ms | 10.22ms | 67 |
| extraTall - 10px cells (200×10000px canvas) | 131.65 | 7.60ms | 919.78μs | 2.98% | 8.10ms | 10.73ms | 6.28ms | 10.73ms | 66 |
| extraTall - 20px cells (400×20000px canvas) | 118.61 | 8.43ms | 1.07ms | 3.29% | 8.92ms | 11.68ms | 6.18ms | 11.68ms | 60 |
| extraTall - 50px cells (1000×50000px canvas) | 123.62 | 8.09ms | 1.41ms | 4.42% | 8.56ms | 16.49ms | 6.36ms | 16.49ms | 62 |
| extraTall - 100px cells (2000×100000px canvas) | 121.47 | 8.23ms | 1.19ms | 3.71% | 8.59ms | 13.64ms | 6.52ms | 13.64ms | 61 |
| hubmap-lung - 10px cells (710×450px canvas) | 675.90 | 1.48ms | 361.43μs | 2.60% | 1.45ms | 3.86ms | 1.36ms | 4.29ms | 338 |
| hubmap-lung - 20px cells (1420×900px canvas) | 681.73 | 1.47ms | 353.42μs | 2.56% | 1.43ms | 3.91ms | 1.36ms | 4.06ms | 341 |
| hubmap-lung - 50px cells (3550×2250px canvas) | 657.79 | 1.52ms | 405.56μs | 2.88% | 1.47ms | 3.98ms | 1.36ms | 4.42ms | 329 |
| hubmap-lung - 100px cells (7100×4500px canvas) | 666.47 | 1.50ms | 373.81μs | 2.67% | 1.47ms | 3.97ms | 1.34ms | 4.64ms | 334 |
| hubmap-kidney - 10px cells (480×1080px canvas) | 407.82 | 2.45ms | 357.55μs | 2.00% | 2.43ms | 4.11ms | 2.24ms | 4.82ms | 204 |
| hubmap-kidney - 20px cells (960×2160px canvas) | 396.82 | 2.52ms | 398.76μs | 2.20% | 2.52ms | 4.51ms | 2.25ms | 5.54ms | 199 |
| hubmap-kidney - 50px cells (2400×5400px canvas) | 405.96 | 2.46ms | 347.08μs | 1.94% | 2.47ms | 4.38ms | 2.22ms | 4.46ms | 203 |
| hubmap-kidney - 100px cells (4800×10800px canvas) | 404.04 | 2.48ms | 339.40μs | 1.89% | 2.51ms | 4.16ms | 2.25ms | 4.42ms | 203 |
| hca-data - 10px cells (510×4840px canvas) | 54.68 | 18.29ms | 2.80ms | 5.93% | 19.22ms | 26.13ms | 15.41ms | 26.13ms | 28 |
| hca-data - 20px cells (1020×9680px canvas) | 47.73 | 20.95ms | 2.58ms | 5.19% | 20.42ms | 28.31ms | 18.89ms | 28.31ms | 24 |
| hca-data - 50px cells (2550×24200px canvas) | 48.44 | 20.65ms | 2.85ms | 5.69% | 21.06ms | 26.35ms | 16.99ms | 26.35ms | 25 |
| hca-data - 100px cells (5100×48400px canvas) | 53.36 | 18.74ms | 2.44ms | 5.16% | 19.23ms | 25.27ms | 15.64ms | 25.27ms | 27 |

## Export Memory Efficiency

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 27.25K | 36.70μs | 25.13μs | 1.15% | 34.08μs | 108.42μs | 30.39μs | 903.31μs | 14K |
| small | 1.44K | 696.53μs | 96.76μs | 1.02% | 703.19μs | 1.20ms | 625.82μs | 1.55ms | 718 |
| medium | 358.81 | 2.79ms | 421.10μs | 2.21% | 2.90ms | 4.62ms | 2.45ms | 4.71ms | 180 |
| large | 40.55 | 24.66ms | 2.06ms | 3.80% | 24.13ms | 30.35ms | 22.84ms | 30.35ms | 21 |
| huge | 7.40 | 135.10ms | 4.72ms | 2.50% | 138.57ms | 142.07ms | 128.62ms | 142.07ms | 10 |
| wide | 96.59 | 10.35ms | 1.36ms | 3.77% | 10.47ms | 13.92ms | 8.86ms | 13.92ms | 49 |
| tall | 88.74 | 11.27ms | 1.02ms | 2.73% | 11.51ms | 15.40ms | 10.13ms | 15.40ms | 45 |
| extraWide | 105.45 | 9.48ms | 1.27ms | 3.70% | 9.94ms | 13.46ms | 7.44ms | 13.46ms | 53 |
| extraTall | 120.08 | 8.33ms | 1.27ms | 3.91% | 8.96ms | 12.21ms | 5.74ms | 12.21ms | 61 |
| hubmap-lung | 617.66 | 1.62ms | 406.82μs | 2.80% | 1.62ms | 4.12ms | 1.39ms | 5.39ms | 309 |
| hubmap-kidney | 400.45 | 2.50ms | 421.34μs | 2.33% | 2.47ms | 4.38ms | 2.31ms | 6.22ms | 201 |
| hca-data | 49.00 | 20.41ms | 2.61ms | 5.28% | 20.87ms | 27.37ms | 16.73ms | 27.37ms | 25 |

## Complete Export Pipeline

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - full pipeline | 26.92K | 37.15μs | 43.21μs | 1.97% | 34.50μs | 87.55μs | 30.45μs | 3.74ms | 13K |
| small - full pipeline | 1.30K | 768.12μs | 276.05μs | 2.76% | 743.38μs | 1.44ms | 649.70μs | 5.71ms | 651 |
| medium - full pipeline | 282.88 | 3.54ms | 611.46μs | 2.85% | 3.71ms | 6.16ms | 2.81ms | 6.46ms | 142 |
| large - full pipeline | 39.99 | 25.01ms | 1.77ms | 3.31% | 25.69ms | 29.77ms | 22.83ms | 29.77ms | 20 |
| huge - full pipeline | 7.77 | 128.75ms | 4.70ms | 2.61% | 131.24ms | 135.78ms | 119.83ms | 135.78ms | 10 |
| wide - full pipeline | 82.04 | 12.19ms | 1.73ms | 4.43% | 12.52ms | 17.56ms | 9.69ms | 17.56ms | 42 |
| tall - full pipeline | 86.89 | 11.51ms | 1.13ms | 2.98% | 11.63ms | 15.66ms | 9.98ms | 15.66ms | 44 |
| extraWide - full pipeline | 107.43 | 9.31ms | 943.57μs | 2.77% | 9.49ms | 12.84ms | 7.61ms | 12.84ms | 54 |
| extraTall - full pipeline | 114.80 | 8.71ms | 1.15ms | 3.47% | 9.32ms | 11.24ms | 6.59ms | 11.24ms | 58 |
| hubmap-lung - full pipeline | 671.19 | 1.49ms | 399.34μs | 2.87% | 1.48ms | 3.90ms | 1.30ms | 4.79ms | 336 |
| hubmap-kidney - full pipeline | 430.54 | 2.32ms | 318.71μs | 1.83% | 2.31ms | 4.13ms | 2.16ms | 4.25ms | 216 |
| hca-data - full pipeline | 50.52 | 19.79ms | 3.87ms | 7.90% | 23.07ms | 28.19ms | 14.14ms | 28.19ms | 26 |

# Heatmap rendering

## Calculate Heatmap Cells

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 33.76K | 29.62μs | 271.42μs | 13.82% | 25.55μs | 66.69μs | 12.89μs | 20.72ms | 17K |
| small | 1.04K | 958.76μs | 1.13ms | 10.15% | 904.41μs | 1.55ms | 697.91μs | 19.19ms | 522 |
| medium | 202.98 | 4.93ms | 2.99ms | 11.90% | 5.09ms | 20.10ms | 3.01ms | 28.37ms | 102 |
| large | 39.75 | 25.16ms | 4.68ms | 8.71% | 25.36ms | 44.00ms | 22.38ms | 44.00ms | 20 |
| huge | 7.43 | 134.67ms | 22.39ms | 11.89% | 145.80ms | 188.20ms | 114.31ms | 188.20ms | 10 |
| wide | 97.91 | 10.21ms | 3.87ms | 10.79% | 9.92ms | 29.64ms | 8.54ms | 29.64ms | 50 |
| tall | 87.30 | 11.45ms | 4.20ms | 11.16% | 11.14ms | 30.01ms | 9.02ms | 30.01ms | 44 |
| extraWide | 118.42 | 8.44ms | 3.65ms | 11.18% | 8.17ms | 33.01ms | 6.77ms | 33.01ms | 60 |
| extraTall | 133.11 | 7.51ms | 2.64ms | 8.59% | 7.35ms | 22.49ms | 6.22ms | 22.49ms | 67 |
| hubmap-lung | 1.19K | 838.37μs | 1.35ms | 12.89% | 706.82μs | 2.78ms | 614.22μs | 24.64ms | 597 |
| hubmap-kidney | 623.95 | 1.60ms | 1.84ms | 12.71% | 1.43ms | 16.16ms | 1.22ms | 19.61ms | 312 |
| hca-data | 94.80 | 10.55ms | 3.16ms | 8.69% | 10.18ms | 25.85ms | 8.65ms | 25.85ms | 48 |

## Calculate Heatmap Cells with Expanded Rows

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - no expanded rows | 52.03K | 19.22μs | 246.41μs | 15.58% | 14.47μs | 37.46μs | 12.05μs | 19.70ms | 26K |
| tiny - 10% expanded rows | 47.39K | 21.10μs | 269.26μs | 16.25% | 19.06μs | 54.68μs | 10.61μs | 24.40ms | 24K |
| tiny - 50% expanded rows | 111.52K | 8.97μs | 168.47μs | 15.59% | 7.09μs | 14.19μs | 5.97μs | 20.35ms | 56K |
| small - no expanded rows | 1.58K | 631.24μs | 1.34ms | 14.78% | 523.37μs | 1.13ms | 467.41μs | 24.31ms | 793 |
| small - 10% expanded rows | 1.79K | 559.93μs | 994.33μs | 11.65% | 502.77μs | 1.05ms | 423.44μs | 15.74ms | 893 |
| small - 50% expanded rows | 3.14K | 318.77μs | 1.03ms | 16.01% | 259.92μs | 550.39μs | 225.45μs | 27.73ms | 2K |
| medium - no expanded rows | 344.87 | 2.90ms | 2.42ms | 12.45% | 2.91ms | 17.84ms | 2.04ms | 25.60ms | 173 |
| medium - 10% expanded rows | 365.19 | 2.74ms | 2.52ms | 13.31% | 2.57ms | 17.14ms | 1.84ms | 27.09ms | 184 |
| medium - 50% expanded rows | 770.92 | 1.30ms | 1.28ms | 9.85% | 1.14ms | 10.84ms | 1.01ms | 15.10ms | 386 |
| large - no expanded rows | 45.52 | 21.97ms | 5.70ms | 11.21% | 21.33ms | 42.76ms | 18.71ms | 42.76ms | 23 |
| large - 10% expanded rows | 49.64 | 20.15ms | 5.20ms | 10.65% | 19.31ms | 37.65ms | 16.98ms | 37.65ms | 25 |
| large - 50% expanded rows | 92.31 | 10.83ms | 3.81ms | 10.34% | 10.69ms | 28.56ms | 8.82ms | 28.56ms | 47 |
| huge - no expanded rows | 8.36 | 119.65ms | 23.17ms | 13.85% | 123.66ms | 181.51ms | 101.00ms | 181.51ms | 10 |
| huge - 10% expanded rows | 10.05 | 99.49ms | 9.30ms | 6.68% | 109.01ms | 116.77ms | 90.11ms | 116.77ms | 10 |
| huge - 50% expanded rows | 19.03 | 52.56ms | 4.26ms | 5.80% | 53.41ms | 63.25ms | 49.30ms | 63.25ms | 10 |
| wide - no expanded rows | 110.51 | 9.05ms | 3.15ms | 9.33% | 8.70ms | 25.55ms | 7.55ms | 25.55ms | 56 |
| wide - 10% expanded rows | 118.99 | 8.40ms | 4.51ms | 13.85% | 7.85ms | 39.22ms | 6.09ms | 39.22ms | 60 |
| wide - 50% expanded rows | 313.49 | 3.19ms | 2.06ms | 10.10% | 3.07ms | 15.95ms | 2.56ms | 20.71ms | 157 |
| tall - no expanded rows | 117.70 | 8.50ms | 3.63ms | 11.13% | 7.95ms | 27.78ms | 6.79ms | 27.78ms | 59 |
| tall - 10% expanded rows | 141.55 | 7.06ms | 2.69ms | 9.03% | 6.87ms | 26.58ms | 5.79ms | 26.58ms | 71 |
| tall - 50% expanded rows | 325.74 | 3.07ms | 1.77ms | 8.84% | 3.01ms | 15.68ms | 2.33ms | 15.95ms | 163 |
| extraWide - no expanded rows | 153.04 | 6.53ms | 3.94ms | 13.69% | 6.14ms | 33.02ms | 4.51ms | 33.02ms | 77 |
| extraWide - 10% expanded rows | 158.53 | 6.31ms | 2.84ms | 10.01% | 5.89ms | 20.79ms | 4.84ms | 20.79ms | 80 |
| extraWide - 50% expanded rows | 341.13 | 2.93ms | 1.95ms | 9.97% | 3.02ms | 15.78ms | 2.09ms | 16.10ms | 171 |
| extraTall - no expanded rows | 135.42 | 7.38ms | 3.00ms | 9.85% | 7.05ms | 26.26ms | 6.02ms | 26.26ms | 68 |
| extraTall - 10% expanded rows | 151.53 | 6.60ms | 2.40ms | 8.31% | 6.45ms | 21.02ms | 5.54ms | 21.02ms | 76 |
| extraTall - 50% expanded rows | 365.56 | 2.74ms | 2.49ms | 13.17% | 2.62ms | 18.90ms | 2.03ms | 27.42ms | 183 |
| hubmap-lung - no expanded rows | 1.28K | 783.80μs | 974.31μs | 9.65% | 725.28μs | 1.14ms | 640.33μs | 13.45ms | 638 |
| hubmap-lung - 10% expanded rows | 1.37K | 730.77μs | 1.06ms | 10.87% | 650.54μs | 1.35ms | 580.57μs | 18.83ms | 685 |
| hubmap-lung - 50% expanded rows | 2.37K | 421.46μs | 773.99μs | 10.33% | 375.62μs | 771.17μs | 321.46μs | 14.98ms | 1K |
| hubmap-kidney - no expanded rows | 623.58 | 1.60ms | 1.75ms | 12.14% | 1.47ms | 12.17ms | 1.17ms | 21.64ms | 312 |
| hubmap-kidney - 10% expanded rows | 758.65 | 1.32ms | 1.44ms | 11.01% | 1.17ms | 14.25ms | 1.07ms | 16.10ms | 380 |
| hubmap-kidney - 50% expanded rows | 1.33K | 749.63μs | 1.13ms | 11.49% | 678.18μs | 1.24ms | 581.93μs | 18.70ms | 667 |
| hca-data - no expanded rows | 103.20 | 9.69ms | 3.32ms | 9.55% | 9.66ms | 26.30ms | 7.59ms | 26.30ms | 52 |
| hca-data - 10% expanded rows | 119.41 | 8.37ms | 4.31ms | 13.31% | 7.80ms | 33.71ms | 6.48ms | 33.71ms | 60 |
| hca-data - 50% expanded rows | 302.41 | 3.31ms | 2.31ms | 11.09% | 2.91ms | 16.22ms | 2.67ms | 20.73ms | 152 |

## Render Cells to Canvas

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 5.30M | 0.19μs | 0.20μs | 0.13% | 0.19μs | 0.26μs | 0.16μs | 129.89μs | 3M |
| small | 277.42K | 3.60μs | 2.87μs | 0.42% | 3.24μs | 11.92μs | 2.98μs | 252.14μs | 139K |
| medium | 74.13K | 13.49μs | 1.57μs | 0.12% | 13.31μs | 21.65μs | 12.28μs | 99.68μs | 37K |
| large | 12.26K | 81.55μs | 13.02μs | 0.40% | 79.71μs | 142.06μs | 70.96μs | 396.84μs | 6K |
| huge | 1.13K | 882.71μs | 152.52μs | 1.42% | 949.44μs | 1.37ms | 551.15μs | 1.60ms | 567 |
| wide | 29.45K | 33.96μs | 7.20μs | 0.34% | 33.38μs | 57.35μs | 30.78μs | 286.73μs | 15K |
| tall | 29.65K | 33.72μs | 4.33μs | 0.21% | 33.24μs | 57.84μs | 30.08μs | 164.70μs | 15K |
| extraWide | 36.14K | 27.67μs | 3.11μs | 0.16% | 27.25μs | 45.00μs | 25.99μs | 132.19μs | 18K |
| extraTall | 35.83K | 27.91μs | 7.30μs | 0.38% | 27.17μs | 45.90μs | 25.29μs | 258.64μs | 18K |
| hubmap-lung | 239.72K | 4.17μs | 1.17μs | 0.16% | 4.12μs | 7.35μs | 3.89μs | 265.40μs | 120K |
| hubmap-kidney | 141.40K | 7.07μs | 1.36μs | 0.14% | 6.92μs | 13.25μs | 6.68μs | 85.11μs | 71K |
| hca-data | 30.01K | 33.32μs | 5.10μs | 0.24% | 32.47μs | 56.25μs | 28.86μs | 196.28μs | 15K |

## End-to-End: Calculate + Render

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 55.52K | 18.01μs | 268.51μs | 17.34% | 13.24μs | 28.26μs | 11.53μs | 18.28ms | 28K |
| small | 1.72K | 582.79μs | 1.16ms | 13.37% | 499.12μs | 825.72μs | 442.44μs | 18.66ms | 858 |
| medium | 350.97 | 2.85ms | 2.39ms | 12.42% | 2.88ms | 18.32ms | 1.94ms | 25.40ms | 176 |
| large | 40.26 | 24.84ms | 6.07ms | 11.12% | 23.99ms | 45.05ms | 21.23ms | 45.05ms | 21 |
| huge | 7.83 | 127.75ms | 20.16ms | 11.29% | 131.72ms | 177.34ms | 111.34ms | 177.34ms | 10 |
| wide | 95.53 | 10.47ms | 3.94ms | 10.95% | 9.90ms | 29.69ms | 8.57ms | 29.69ms | 48 |
| tall | 99.24 | 10.08ms | 2.33ms | 6.57% | 10.06ms | 25.97ms | 8.94ms | 25.97ms | 50 |
| extraWide | 117.61 | 8.50ms | 4.09ms | 12.55% | 8.21ms | 35.12ms | 6.62ms | 35.12ms | 59 |
| extraTall | 139.63 | 7.16ms | 2.61ms | 8.68% | 6.94ms | 22.70ms | 5.95ms | 22.70ms | 70 |
| hubmap-lung | 1.26K | 796.37μs | 1.01ms | 9.87% | 724.23μs | 1.08ms | 644.37μs | 15.91ms | 628 |
| hubmap-kidney | 639.89 | 1.56ms | 1.56ms | 10.93% | 1.41ms | 11.10ms | 1.18ms | 17.61ms | 320 |
| hca-data | 107.70 | 9.28ms | 3.19ms | 9.37% | 9.13ms | 25.93ms | 7.57ms | 25.93ms | 54 |

## Scalability: Cell Calculation Complexity

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 53.53K | 18.68μs | 235.32μs | 15.09% | 13.88μs | 43.11μs | 11.69μs | 17.46ms | 27K |
| small | 1.68K | 595.02μs | 1.03ms | 11.64% | 525.05μs | 907.96μs | 470.41μs | 15.96ms | 841 |
| medium | 322.66 | 3.10ms | 2.82ms | 14.03% | 3.03ms | 19.47ms | 2.07ms | 31.99ms | 162 |
| large | 44.95 | 22.25ms | 5.30ms | 10.30% | 22.02ms | 38.91ms | 19.48ms | 38.91ms | 23 |
| huge | 8.25 | 121.18ms | 12.92ms | 7.62% | 127.48ms | 152.48ms | 111.28ms | 152.48ms | 10 |
| wide | 102.91 | 9.72ms | 3.53ms | 10.12% | 9.25ms | 28.12ms | 8.16ms | 28.12ms | 52 |
| tall | 109.65 | 9.12ms | 5.69ms | 16.72% | 8.47ms | 42.77ms | 5.60ms | 42.77ms | 56 |
| extraWide | 147.75 | 6.77ms | 3.06ms | 10.28% | 6.61ms | 21.45ms | 5.06ms | 21.45ms | 77 |
| extraTall | 134.38 | 7.44ms | 3.15ms | 10.26% | 7.10ms | 22.23ms | 5.34ms | 22.23ms | 68 |
| hubmap-lung | 1.33K | 752.65μs | 988.44μs | 9.98% | 675.16μs | 1.35ms | 617.79μs | 14.58ms | 665 |
| hubmap-kidney | 689.87 | 1.45ms | 1.51ms | 10.99% | 1.32ms | 14.74ms | 1.14ms | 15.59ms | 345 |
| hca-data | 108.57 | 9.21ms | 3.65ms | 10.72% | 8.95ms | 27.01ms | 7.18ms | 27.01ms | 55 |

# Side graphs

## Data Preparation for Side Graphs

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 95.28K | 10.49μs | 6.12μs | 0.52% | 10.28μs | 19.03μs | 9.54μs | 655.14μs | 48K |
| small | 3.22K | 310.76μs | 56.23μs | 0.88% | 307.91μs | 628.00μs | 281.57μs | 1.20ms | 2K |
| medium | 899.32 | 1.11ms | 432.20μs | 3.59% | 1.10ms | 1.85ms | 963.70μs | 6.49ms | 450 |
| large | 163.12 | 6.13ms | 1.85ms | 6.63% | 6.22ms | 17.32ms | 5.16ms | 17.32ms | 82 |
| huge | 42.58 | 23.49ms | 3.99ms | 7.54% | 23.21ms | 35.80ms | 21.09ms | 35.80ms | 22 |
| wide | 489.32 | 2.04ms | 851.58μs | 5.22% | 1.98ms | 2.71ms | 1.89ms | 11.39ms | 245 |
| tall | 379.22 | 2.64ms | 952.18μs | 5.13% | 2.55ms | 9.82ms | 2.35ms | 10.18ms | 190 |
| extraWide | 860.82 | 1.16ms | 453.42μs | 3.68% | 1.12ms | 1.56ms | 1.03ms | 6.25ms | 431 |
| extraTall | 681.66 | 1.47ms | 353.37μs | 2.56% | 1.47ms | 4.26ms | 1.30ms | 4.91ms | 341 |
| hubmap-lung | 1.04K | 960.79μs | 529.95μs | 4.74% | 922.07μs | 1.45ms | 842.42μs | 7.88ms | 521 |
| hubmap-kidney | 638.89 | 1.57ms | 559.17μs | 3.91% | 1.55ms | 2.79ms | 1.36ms | 7.49ms | 320 |
| hca-data | 90.72 | 11.02ms | 2.87ms | 7.72% | 10.63ms | 23.30ms | 9.56ms | 23.30ms | 46 |

## Scale Creation for Side Graphs

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 287.61K | 3.48μs | 14.81μs | 2.20% | 3.17μs | 7.22μs | 2.80μs | 2.00ms | 144K |
| tiny - continuous scale for bars | 1.64M | 0.61μs | 12.27μs | 4.35% | 0.57μs | 1.16μs | 0.47μs | 11.05ms | 818K |
| small | 138.36K | 7.23μs | 22.53μs | 2.32% | 6.52μs | 15.17μs | 5.76μs | 1.71ms | 69K |
| small - continuous scale for bars | 1.70M | 0.59μs | 1.27μs | 0.46% | 0.55μs | 1.17μs | 0.46μs | 253.67μs | 849K |
| medium | 78.74K | 12.70μs | 53.17μs | 4.14% | 11.28μs | 22.29μs | 9.67μs | 3.14ms | 39K |
| medium - continuous scale for bars | 1.74M | 0.58μs | 0.63μs | 0.23% | 0.56μs | 1.07μs | 0.46μs | 186.37μs | 868K |
| large | 26.48K | 37.77μs | 86.75μs | 3.91% | 33.43μs | 69.63μs | 28.51μs | 2.43ms | 13K |
| large - continuous scale for bars | 1.63M | 0.61μs | 27.98μs | 9.89% | 0.56μs | 1.04μs | 0.47μs | 25.21ms | 813K |
| huge | 17.81K | 56.16μs | 51.32μs | 1.90% | 58.96μs | 97.49μs | 42.64μs | 1.36ms | 9K |
| huge - continuous scale for bars | 1.77M | 0.56μs | 1.12μs | 0.41% | 0.55μs | 0.98μs | 0.46μs | 786.87μs | 885K |
| wide | 19.50K | 51.27μs | 49.95μs | 1.93% | 48.16μs | 88.54μs | 41.29μs | 1.21ms | 10K |
| wide - continuous scale for bars | 1.74M | 0.57μs | 0.65μs | 0.24% | 0.56μs | 1.04μs | 0.47μs | 151.01μs | 871K |
| tall | 138.03K | 7.24μs | 24.71μs | 2.54% | 6.54μs | 14.54μs | 5.77μs | 1.68ms | 69K |
| tall - continuous scale for bars | 1.63M | 0.61μs | 32.59μs | 11.54% | 0.55μs | 1.02μs | 0.47μs | 29.42ms | 816K |
| extraWide | 8.50K | 117.71μs | 85.24μs | 2.18% | 121.17μs | 227.47μs | 90.73μs | 2.52ms | 4K |
| extraWide - continuous scale for bars | 1.76M | 0.57μs | 0.65μs | 0.24% | 0.55μs | 1.05μs | 0.46μs | 184.27μs | 879K |
| extraTall | 220.08K | 4.54μs | 18.69μs | 2.43% | 4.20μs | 7.95μs | 3.68μs | 1.77ms | 110K |
| extraTall - continuous scale for bars | 1.74M | 0.57μs | 0.92μs | 0.34% | 0.55μs | 1.17μs | 0.46μs | 312.24μs | 870K |
| hubmap-lung | 104.33K | 9.58μs | 26.51μs | 2.37% | 8.77μs | 18.38μs | 7.69μs | 1.44ms | 52K |
| hubmap-lung - continuous scale for bars | 1.71M | 0.58μs | 1.40μs | 0.51% | 0.55μs | 1.13μs | 0.46μs | 843.09μs | 856K |
| hubmap-kidney | 139.24K | 7.18μs | 25.66μs | 2.65% | 6.42μs | 15.01μs | 5.46μs | 1.80ms | 70K |
| hubmap-kidney - continuous scale for bars | 1.72M | 0.58μs | 1.29μs | 0.47% | 0.56μs | 1.11μs | 0.46μs | 801.25μs | 861K |
| hca-data | 133.78K | 7.48μs | 27.42μs | 2.78% | 6.83μs | 15.55μs | 5.80μs | 2.32ms | 67K |
| hca-data - continuous scale for bars | 1.71M | 0.58μs | 1.08μs | 0.39% | 0.57μs | 1.10μs | 0.47μs | 775.64μs | 856K |

## Data Aggregation for Violins (O(n×m) Complexity)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 53.97K | 18.53μs | 11.13μs | 0.72% | 18.04μs | 31.64μs | 15.80μs | 700.79μs | 27K |
| small | 1.52K | 656.24μs | 121.82μs | 1.32% | 645.45μs | 1.16ms | 569.22μs | 1.63ms | 762 |
| medium | 362.97 | 2.76ms | 497.18μs | 2.62% | 2.84ms | 4.93ms | 2.29ms | 5.75ms | 182 |
| large | 52.74 | 18.96ms | 1.32ms | 2.75% | 20.15ms | 21.71ms | 17.29ms | 21.71ms | 27 |
| huge | 9.26 | 108.01ms | 5.48ms | 3.63% | 110.31ms | 116.50ms | 99.06ms | 116.50ms | 10 |
| wide | 132.31 | 7.56ms | 4.01ms | 12.96% | 7.72ms | 38.73ms | 5.79ms | 38.73ms | 67 |
| tall | 116.72 | 8.57ms | 940.64μs | 2.86% | 9.11ms | 12.10ms | 7.27ms | 12.10ms | 59 |
| extraWide | 173.92 | 5.75ms | 712.41μs | 2.64% | 6.09ms | 7.95ms | 4.40ms | 7.95ms | 87 |
| extraTall | 153.68 | 6.51ms | 962.60μs | 3.36% | 6.84ms | 11.06ms | 5.28ms | 11.06ms | 77 |
| hubmap-lung | 615.33 | 1.63ms | 395.80μs | 2.72% | 1.61ms | 4.96ms | 1.42ms | 5.06ms | 308 |
| hubmap-kidney | 379.15 | 2.64ms | 416.89μs | 2.25% | 2.68ms | 5.56ms | 2.33ms | 5.84ms | 190 |
| hca-data | 48.10 | 20.79ms | 2.75ms | 5.45% | 21.19ms | 29.62ms | 18.26ms | 29.62ms | 25 |

## Fraction Normalization (Violin Prep)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 92.25K | 10.84μs | 7.20μs | 0.61% | 10.61μs | 19.19μs | 9.53μs | 599.13μs | 46K |
| small | 3.31K | 302.10μs | 68.20μs | 1.09% | 297.67μs | 655.25μs | 259.27μs | 1.01ms | 2K |
| medium | 869.16 | 1.15ms | 514.67μs | 4.20% | 1.13ms | 1.55ms | 1.01ms | 7.61ms | 435 |
| large | 148.75 | 6.72ms | 1.73ms | 5.93% | 6.71ms | 18.08ms | 5.60ms | 18.08ms | 75 |
| huge | 38.22 | 26.17ms | 2.91ms | 5.20% | 25.79ms | 38.03ms | 24.63ms | 38.03ms | 20 |
| wide | 468.17 | 2.14ms | 1.11ms | 6.62% | 2.03ms | 10.92ms | 1.92ms | 12.44ms | 235 |
| tall | 413.06 | 2.42ms | 801.10μs | 4.51% | 2.34ms | 8.69ms | 2.22ms | 9.40ms | 207 |
| extraWide | 886.82 | 1.13ms | 453.95μs | 3.74% | 1.10ms | 1.99ms | 1.01ms | 6.09ms | 444 |
| extraTall | 716.93 | 1.39ms | 445.59μs | 3.30% | 1.36ms | 4.81ms | 1.25ms | 5.62ms | 359 |
| hubmap-lung | 1.08K | 928.59μs | 540.64μs | 4.92% | 898.58μs | 1.27ms | 802.59μs | 6.81ms | 539 |
| hubmap-kidney | 717.63 | 1.39ms | 426.45μs | 3.16% | 1.38ms | 2.82ms | 1.23ms | 6.08ms | 360 |
| hca-data | 92.94 | 10.76ms | 2.54ms | 6.94% | 10.67ms | 22.74ms | 9.51ms | 22.74ms | 47 |

## Bar Stacking Calculations

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny  | 91.33K | 10.95μs | 4.54μs | 0.38% | 10.74μs | 19.21μs | 10.16μs | 596.94μs | 46K |
| small  | 202.41 | 4.94ms | 181.05μs | 0.72% | 4.94ms | 5.36ms | 4.81ms | 6.52ms | 102 |
| medium  | 15.96 | 62.65ms | 488.21μs | 0.56% | 62.57ms | 63.96ms | 62.30ms | 63.96ms | 10 |
| large  | 0.54 | 1.85s | 19.60ms | 0.76% | 1.86s | 1.88s | 1.82s | 1.88s | 10 |
| huge  | 0.03 | 36.49s | 249.82ms | 0.49% | 36.58s | 36.83s | 36.05s | 36.83s | 10 |
| wide  | 2.99 | 334.50ms | 6.42ms | 1.37% | 340.42ms | 346.35ms | 328.38ms | 346.35ms | 10 |
| tall  | 2.90 | 344.35ms | 6.74ms | 1.40% | 352.09ms | 355.07ms | 337.44ms | 355.07ms | 10 |
| extraWide  | 4.91 | 203.78ms | 6.43ms | 2.26% | 207.08ms | 215.00ms | 198.46ms | 215.00ms | 10 |
| extraTall  | 5.06 | 197.66ms | 885.48μs | 0.32% | 198.30ms | 199.00ms | 196.40ms | 199.00ms | 10 |
| hubmap-lung  | 102.82 | 9.73ms | 214.85μs | 0.62% | 9.72ms | 11.06ms | 9.57ms | 11.06ms | 52 |
| hubmap-kidney  | 36.29 | 27.55ms | 506.19μs | 0.89% | 27.75ms | 29.09ms | 26.47ms | 29.09ms | 19 |
| hca-data  | 1.49 | 672.90ms | 12.09ms | 1.29% | 673.13ms | 699.07ms | 663.20ms | 699.07ms | 10 |

## Scalability Analysis

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 50.21K | 19.91μs | 11.89μs | 0.74% | 18.44μs | 46.41μs | 16.90μs | 478.12μs | 25K |
| small | 1.43K | 699.68μs | 122.84μs | 1.29% | 724.34μs | 1.14ms | 570.61μs | 1.54ms | 715 |
| medium | 306.80 | 3.26ms | 641.83μs | 3.11% | 3.57ms | 6.28ms | 2.34ms | 6.31ms | 154 |
| large | 43.96 | 22.75ms | 2.12ms | 4.13% | 24.25ms | 26.66ms | 18.42ms | 26.66ms | 22 |
| huge | 7.99 | 125.11ms | 9.01ms | 5.15% | 129.71ms | 142.80ms | 110.17ms | 142.80ms | 10 |
| wide | 90.84 | 11.01ms | 1.46ms | 3.94% | 12.18ms | 15.28ms | 9.15ms | 15.28ms | 46 |
| tall | 101.09 | 9.89ms | 1.25ms | 3.55% | 10.32ms | 15.54ms | 8.06ms | 15.54ms | 51 |
| extraWide | 134.50 | 7.43ms | 1.22ms | 3.98% | 8.04ms | 11.71ms | 5.61ms | 11.71ms | 68 |
| extraTall | 145.70 | 6.86ms | 776.12μs | 2.64% | 7.39ms | 8.88ms | 5.42ms | 8.88ms | 73 |
| hubmap-lung | 573.01 | 1.75ms | 425.81μs | 2.82% | 1.72ms | 5.20ms | 1.61ms | 6.05ms | 287 |
| hubmap-kidney | 333.89 | 2.99ms | 432.49μs | 2.19% | 3.03ms | 6.03ms | 2.70ms | 6.04ms | 167 |
| hca-data | 43.76 | 22.85ms | 1.85ms | 3.58% | 23.34ms | 30.24ms | 21.22ms | 30.24ms | 22 |

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

