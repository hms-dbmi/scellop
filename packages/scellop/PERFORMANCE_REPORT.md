# Scellop Performance Report

Generated: 2026-09-18T22:47:39.216Z

## Summary

This report presents benchmark results for Scellop's core operations across various dataset sizes. Cell counts in benchmark names refer to non-empty cells in the sparse heatmap matrix.

## Datasets

All benchmarks run on the following datasets:

| Dataset | Type | Dimensions | Non-Zero Cells | Density | Row Sum Avg | Row Sum Range |
|---------|------|------------|----------------|---------|-------------|---------------|
| tiny | synthetic | 10×10 | 84 | 84.0% | 4K | 3K-5K |
| small | synthetic | 50×50 | 2K | 60.8% | 15K | 11K-20K |
| medium | synthetic | 100×100 | 4K | 40.0% | 20K | 13K-28K |
| extraWide | synthetic | 20×1000 | 5K | 24.9% | 123K | 109K-143K |
| extraTall | synthetic | 1000×20 | 5K | 24.7% | 2K | 0-6K |
| wide | synthetic | 50×500 | 7K | 29.7% | 74K | 62K-89K |
| tall | synthetic | 500×50 | 7K | 29.9% | 7K | 3K-14K |
| large | synthetic | 200×300 | 18K | 30.1% | 45K | 30K-58K |
| huge | synthetic | 500×500 | 50K | 20.0% | 50K | 36K-65K |
| hubmap-lung | real-world | 45×71 | 1K | 44.9% | 17K | 4K-75K |
| hubmap-kidney | real-world | 108×48 | 4K | 73.1% | 12K | 382-51K |
| hca-data | real-world | 484×51 | 12K | 48.0% | 5K | 8-54K |

# Data processing

## DataMap Creation (Raw Counts)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 119.78K | 9.92μs | 55.03μs | 3.42% | 9.00μs | 24.20μs | 6.85μs | 6.58ms | 101K |
| small | 5.10K | 202.19μs | 65.22μs | 0.90% | 200.04μs | 412.65μs | 176.84μs | 2.51ms | 5K |
| medium | 1.68K | 612.38μs | 191.87μs | 1.52% | 590.47μs | 2.10ms | 557.87μs | 2.94ms | 2K |
| hubmap-lung | 1.51K | 684.30μs | 221.21μs | 1.66% | 662.73μs | 2.01ms | 590.88μs | 3.63ms | 1K |
| extraWide | 1.37K | 750.68μs | 195.97μs | 1.40% | 725.84μs | 2.17ms | 676.86μs | 2.91ms | 1K |
| extraTall | 1.32K | 780.57μs | 220.41μs | 1.55% | 754.28μs | 2.22ms | 694.88μs | 3.05ms | 1K |
| hubmap-kidney | 970.35 | 1.05ms | 217.73μs | 1.32% | 1.02ms | 2.37ms | 965.90μs | 3.31ms | 952 |
| wide | 789.92 | 1.32ms | 407.07μs | 2.20% | 1.26ms | 3.64ms | 1.13ms | 4.47ms | 758 |
| tall | 772.75 | 1.36ms | 456.27μs | 2.43% | 1.29ms | 3.84ms | 1.15ms | 5.35ms | 738 |
| large | 312.65 | 3.31ms | 769.13μs | 2.63% | 3.20ms | 6.15ms | 2.87ms | 8.77ms | 303 |
| hca-data | 154.63 | 6.67ms | 1.38ms | 3.34% | 6.95ms | 11.79ms | 5.20ms | 13.82ms | 150 |
| huge | 87.80 | 11.69ms | 2.19ms | 4.01% | 12.68ms | 18.26ms | 9.55ms | 24.59ms | 86 |

## Derived States Calculation

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 159.93K | 7.09μs | 81.08μs | 5.97% | 6.12μs | 13.34μs | 5.79μs | 13.70ms | 141K |
| small | 8.59K | 119.55μs | 96.48μs | 1.73% | 115.76μs | 184.83μs | 110.22μs | 7.67ms | 8K |
| hubmap-lung | 5.08K | 199.98μs | 39.56μs | 0.55% | 194.94μs | 318.99μs | 180.99μs | 1.51ms | 5K |
| hubmap-kidney | 3.31K | 308.17μs | 66.73μs | 0.75% | 300.30μs | 506.20μs | 278.39μs | 2.30ms | 3K |
| medium | 2.56K | 395.87μs | 85.40μs | 0.84% | 393.52μs | 638.17μs | 365.96μs | 3.18ms | 3K |
| extraWide | 2.61K | 399.56μs | 132.85μs | 1.30% | 396.33μs | 826.22μs | 336.60μs | 2.63ms | 3K |
| wide | 1.52K | 679.87μs | 175.07μs | 1.32% | 735.94μs | 1.51ms | 568.25μs | 2.77ms | 1K |
| extraTall | 1.13K | 895.67μs | 126.52μs | 0.83% | 869.83μs | 1.43ms | 815.39μs | 2.24ms | 1K |
| tall | 878.20 | 1.15ms | 162.99μs | 0.94% | 1.12ms | 1.87ms | 1.05ms | 3.08ms | 868 |
| hca-data | 692.56 | 1.47ms | 236.55μs | 1.21% | 1.43ms | 2.56ms | 1.33ms | 3.49ms | 682 |
| large | 494.98 | 2.04ms | 207.90μs | 0.90% | 1.99ms | 2.90ms | 1.90ms | 4.01ms | 492 |
| huge | 167.07 | 6.05ms | 670.81μs | 1.70% | 6.43ms | 8.21ms | 5.47ms | 8.82ms | 166 |

## Row Fraction Normalization

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 125.00K | 8.56μs | 17.25μs | 1.16% | 8.95μs | 18.22μs | 6.91μs | 4.39ms | 117K |
| small | 4.45K | 228.40μs | 44.58μs | 0.58% | 226.95μs | 391.93μs | 206.67μs | 1.29ms | 4K |
| medium | 1.39K | 752.94μs | 254.31μs | 1.82% | 796.10μs | 1.70ms | 611.46μs | 3.97ms | 1K |
| hubmap-lung | 1.35K | 780.59μs | 285.34μs | 2.00% | 828.30μs | 1.97ms | 635.51μs | 4.63ms | 1K |
| extraWide | 1.28K | 803.56μs | 232.15μs | 1.60% | 767.94μs | 1.77ms | 726.76μs | 5.04ms | 1K |
| extraTall | 1.25K | 825.31μs | 228.18μs | 1.56% | 799.82μs | 2.52ms | 739.06μs | 3.04ms | 1K |
| hubmap-kidney | 876.72 | 1.18ms | 293.75μs | 1.68% | 1.14ms | 2.87ms | 1.04ms | 3.99ms | 851 |
| wide | 726.89 | 1.41ms | 382.24μs | 2.00% | 1.36ms | 4.56ms | 1.31ms | 5.45ms | 710 |
| tall | 649.55 | 1.57ms | 385.93μs | 1.91% | 1.54ms | 3.90ms | 1.45ms | 5.57ms | 638 |
| large | 294.04 | 3.50ms | 788.02μs | 2.62% | 3.51ms | 7.25ms | 3.03ms | 9.34ms | 286 |
| hca-data | 144.91 | 7.09ms | 1.43ms | 3.34% | 7.43ms | 13.07ms | 5.82ms | 13.29ms | 142 |
| huge | 86.63 | 11.71ms | 1.58ms | 2.90% | 11.87ms | 17.14ms | 9.90ms | 18.62ms | 86 |

## Log Normalization

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 103.89K | 10.99μs | 49.73μs | 2.94% | 10.75μs | 25.03μs | 8.28μs | 3.95ms | 91K |
| small | 4.70K | 218.65μs | 62.48μs | 0.83% | 215.02μs | 403.47μs | 195.01μs | 2.44ms | 5K |
| medium | 1.66K | 627.77μs | 254.53μs | 1.99% | 597.18μs | 1.33ms | 547.80μs | 4.03ms | 2K |
| hubmap-lung | 1.35K | 777.71μs | 284.40μs | 2.00% | 816.92μs | 1.76ms | 639.82μs | 3.80ms | 1K |
| extraWide | 1.15K | 913.30μs | 316.68μs | 2.05% | 964.97μs | 2.55ms | 753.64μs | 4.44ms | 1K |
| extraTall | 1.11K | 946.97μs | 348.21μs | 2.22% | 993.25μs | 2.68ms | 765.56μs | 5.75ms | 1K |
| hubmap-kidney | 828.37 | 1.26ms | 337.24μs | 1.87% | 1.34ms | 3.22ms | 1.05ms | 4.18ms | 797 |
| wide | 680.40 | 1.56ms | 618.58μs | 3.08% | 1.62ms | 4.95ms | 1.25ms | 7.51ms | 644 |
| tall | 651.17 | 1.61ms | 591.39μs | 2.89% | 1.70ms | 4.68ms | 1.28ms | 7.58ms | 620 |
| large | 309.55 | 3.35ms | 840.27μs | 2.86% | 3.42ms | 7.63ms | 2.80ms | 8.71ms | 299 |
| hca-data | 147.57 | 6.97ms | 1.41ms | 3.33% | 7.38ms | 12.85ms | 5.69ms | 14.02ms | 144 |
| huge | 86.02 | 12.02ms | 2.54ms | 4.58% | 12.46ms | 20.28ms | 9.99ms | 20.84ms | 84 |

## Metadata Processing

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| Extract column metadata keys - tiny | 2.10M | 0.49μs | 0.99μs | 0.28% | 0.48μs | 0.76μs | 0.44μs | 765.53μs | 2M |
| Extract row metadata keys - tiny | 1.87M | 0.57μs | 2.60μs | 0.68% | 0.53μs | 1.06μs | 0.48μs | 1.67ms | 2M |
| Extract column metadata keys - extraTall | 1.21M | 0.85μs | 0.38μs | 0.08% | 0.82μs | 1.50μs | 0.76μs | 201.66μs | 1M |
| Extract row metadata keys - extraWide | 1.08M | 0.97μs | 2.78μs | 0.55% | 0.91μs | 1.71μs | 0.83μs | 1.42ms | 1M |
| Extract column metadata keys - hubmap-kidney | 877.14K | 1.19μs | 2.24μs | 0.40% | 1.15μs | 1.91μs | 1.01μs | 1.22ms | 844K |
| Extract column metadata keys - hubmap-lung | 614.81K | 1.68μs | 2.32μs | 0.35% | 1.64μs | 2.73μs | 1.44μs | 971.41μs | 594K |
| Extract column metadata keys - tall | 519.62K | 2.07μs | 6.60μs | 0.90% | 2.03μs | 3.55μs | 1.68μs | 1.78ms | 484K |
| Extract column metadata keys - small | 523.58K | 2.07μs | 13.28μs | 1.81% | 1.92μs | 3.61μs | 1.67μs | 7.90ms | 482K |
| Extract row metadata keys - small | 476.43K | 2.22μs | 4.94μs | 0.65% | 2.10μs | 3.89μs | 1.88μs | 1.26ms | 451K |
| Extract row metadata keys - wide | 462.85K | 2.32μs | 6.51μs | 0.84% | 2.39μs | 4.66μs | 1.87μs | 1.69ms | 430K |
| Extract column metadata keys - medium | 285.67K | 3.59μs | 3.95μs | 0.41% | 3.52μs | 5.82μs | 3.22μs | 1.61ms | 279K |
| Extract column metadata keys - hca-data | 276.36K | 3.78μs | 6.68μs | 0.67% | 3.56μs | 7.02μs | 3.33μs | 2.22ms | 265K |
| Extract row metadata keys - medium | 251.96K | 4.18μs | 15.59μs | 1.50% | 3.96μs | 7.52μs | 3.61μs | 7.22ms | 239K |
| Extract row metadata keys - hubmap-lung | 187.74K | 5.44μs | 5.08μs | 0.43% | 5.28μs | 9.75μs | 5.01μs | 1.52ms | 184K |
| Extract row metadata keys - large | 131.49K | 7.81μs | 20.94μs | 1.47% | 7.62μs | 13.64μs | 7.07μs | 7.43ms | 128K |
| Extract column metadata keys - large | 96.21K | 10.77μs | 7.38μs | 0.44% | 10.34μs | 19.82μs | 9.41μs | 889.56μs | 93K |
| Extract row metadata keys - hubmap-kidney | 77.77K | 13.67μs | 30.93μs | 1.64% | 12.65μs | 25.14μs | 11.60μs | 6.65ms | 73K |
| Extract column metadata keys - huge | 55.47K | 19.04μs | 16.31μs | 0.73% | 18.87μs | 39.46μs | 15.61μs | 1.71ms | 53K |
| Extract column metadata keys - wide | 53.72K | 19.73μs | 13.17μs | 0.58% | 20.43μs | 41.88μs | 15.80μs | 1.72ms | 51K |
| Extract row metadata keys - huge | 50.62K | 20.67μs | 16.56μs | 0.71% | 19.62μs | 36.53μs | 17.36μs | 1.70ms | 48K |
| Extract row metadata keys - tall | 48.08K | 22.84μs | 25.70μs | 1.05% | 22.98μs | 57.04μs | 17.36μs | 1.77ms | 44K |
| Extract column metadata keys - extraWide | 29.16K | 34.91μs | 14.09μs | 0.47% | 33.99μs | 53.30μs | 31.79μs | 1.95ms | 29K |
| Extract row metadata keys - extraTall | 25.96K | 39.25μs | 10.17μs | 0.32% | 38.03μs | 60.70μs | 35.62μs | 336.36μs | 25K |
| Extract row metadata keys - hca-data | 17.50K | 57.75μs | 16.06μs | 0.41% | 57.00μs | 75.29μs | 54.03μs | 1.60ms | 17K |

# Export

## High-Resolution Canvas Export

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny @4x resolution | 70.27K | 14.54μs | 6.53μs | 0.34% | 14.21μs | 25.56μs | 13.22μs | 602.08μs | 69K |
| tiny @2x resolution | 70.16K | 14.66μs | 8.65μs | 0.44% | 14.19μs | 26.99μs | 13.25μs | 763.39μs | 68K |
| tiny @1x resolution | 69.58K | 14.71μs | 6.79μs | 0.35% | 14.33μs | 24.73μs | 13.21μs | 775.62μs | 68K |
| small @1x resolution | 2.76K | 366.60μs | 49.91μs | 0.51% | 364.50μs | 678.98μs | 336.66μs | 1.07ms | 3K |
| small @4x resolution | 2.75K | 369.66μs | 79.67μs | 0.81% | 364.31μs | 709.93μs | 338.10μs | 2.26ms | 3K |
| small @2x resolution | 2.67K | 383.91μs | 91.54μs | 0.92% | 375.88μs | 721.48μs | 338.16μs | 2.47ms | 3K |
| hubmap-lung @4x resolution | 1.72K | 583.04μs | 57.42μs | 0.47% | 585.77μs | 964.46μs | 546.09μs | 1.63ms | 2K |
| hubmap-lung @1x resolution | 1.64K | 623.09μs | 117.74μs | 0.92% | 669.38μs | 1.07ms | 540.10μs | 2.55ms | 2K |
| hubmap-lung @2x resolution | 1.60K | 646.49μs | 150.77μs | 1.16% | 694.06μs | 1.31ms | 541.69μs | 2.51ms | 2K |
| hubmap-kidney @1x resolution | 986.29 | 1.02ms | 78.61μs | 0.48% | 1.02ms | 1.42ms | 970.03μs | 1.74ms | 982 |
| hubmap-kidney @4x resolution | 985.79 | 1.02ms | 113.96μs | 0.70% | 1.01ms | 1.45ms | 966.43μs | 3.32ms | 980 |
| hubmap-kidney @2x resolution | 984.79 | 1.02ms | 122.87μs | 0.75% | 1.01ms | 1.45ms | 950.52μs | 3.09ms | 977 |
| medium @2x resolution | 661.67 | 1.52ms | 168.05μs | 0.85% | 1.50ms | 2.18ms | 1.43ms | 2.73ms | 656 |
| medium @1x resolution | 656.58 | 1.54ms | 210.18μs | 1.05% | 1.51ms | 2.46ms | 1.40ms | 3.52ms | 649 |
| medium @4x resolution | 655.20 | 1.55ms | 267.60μs | 1.33% | 1.49ms | 2.70ms | 1.42ms | 3.85ms | 644 |
| extraTall @4x resolution | 309.85 | 3.27ms | 419.80μs | 1.44% | 3.19ms | 4.52ms | 3.00ms | 6.40ms | 307 |
| extraTall @1x resolution | 278.88 | 3.74ms | 908.12μs | 2.92% | 3.95ms | 6.45ms | 3.02ms | 10.04ms | 268 |
| extraTall @2x resolution | 268.79 | 3.81ms | 635.92μs | 2.03% | 4.21ms | 6.05ms | 3.04ms | 6.53ms | 263 |
| extraWide @1x resolution | 247.60 | 4.12ms | 671.69μs | 2.06% | 4.14ms | 6.89ms | 3.67ms | 7.42ms | 243 |
| extraWide @4x resolution | 244.95 | 4.23ms | 1.17ms | 3.54% | 4.26ms | 8.06ms | 3.55ms | 17.70ms | 237 |
| extraWide @2x resolution | 237.24 | 4.32ms | 775.18μs | 2.32% | 4.62ms | 6.94ms | 3.62ms | 8.01ms | 232 |
| wide @4x resolution | 212.35 | 4.75ms | 512.26μs | 1.46% | 4.77ms | 6.46ms | 4.34ms | 6.53ms | 211 |
| tall @4x resolution | 213.17 | 4.83ms | 968.44μs | 2.74% | 5.14ms | 7.98ms | 4.05ms | 11.22ms | 208 |
| hca-data @4x resolution | 207.30 | 4.86ms | 430.14μs | 1.22% | 4.96ms | 6.11ms | 4.47ms | 6.52ms | 206 |
| hca-data @2x resolution | 202.59 | 4.98ms | 527.47μs | 1.47% | 5.22ms | 6.53ms | 4.47ms | 8.87ms | 201 |
| tall @2x resolution | 205.19 | 5.01ms | 926.75μs | 2.58% | 5.42ms | 7.86ms | 4.14ms | 9.57ms | 200 |
| tall @1x resolution | 195.43 | 5.32ms | 1.19ms | 3.21% | 5.74ms | 9.42ms | 4.09ms | 10.23ms | 188 |
| wide @1x resolution | 182.04 | 5.69ms | 1.27ms | 3.32% | 6.05ms | 9.24ms | 4.41ms | 14.85ms | 176 |
| wide @2x resolution | 175.65 | 5.83ms | 963.31μs | 2.49% | 6.34ms | 8.88ms | 4.48ms | 9.68ms | 172 |
| hca-data @1x resolution | 172.77 | 6.10ms | 1.65ms | 4.18% | 6.48ms | 12.08ms | 4.47ms | 13.73ms | 164 |
| large @2x resolution | 71.67 | 14.28ms | 2.25ms | 3.72% | 16.00ms | 18.76ms | 11.24ms | 19.17ms | 71 |
| large @4x resolution | 65.49 | 15.65ms | 2.54ms | 4.06% | 17.37ms | 21.86ms | 12.08ms | 23.24ms | 64 |
| large @1x resolution | 63.57 | 15.93ms | 1.91ms | 2.99% | 17.13ms | 21.28ms | 13.67ms | 21.80ms | 64 |
| huge @1x resolution | 12.96 | 78.67ms | 12.55ms | 3.98% | 80.98ms | 127.15ms | 58.41ms | 132.10ms | 64 |
| huge @4x resolution | 12.59 | 80.34ms | 9.73ms | 3.02% | 83.30ms | 123.05ms | 65.56ms | 124.64ms | 64 |
| huge @2x resolution | 12.53 | 80.91ms | 10.96ms | 3.38% | 82.62ms | 129.46ms | 66.73ms | 135.79ms | 64 |

## Canvas Size Limits

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - 20px cells (200×200px canvas) | 34.22K | 30.34μs | 18.14μs | 0.65% | 28.97μs | 62.12μs | 26.40μs | 1.80ms | 33K |
| tiny - 50px cells (500×500px canvas) | 33.12K | 31.71μs | 17.23μs | 0.60% | 33.36μs | 74.77μs | 26.00μs | 1.71ms | 32K |
| tiny - 10px cells (100×100px canvas) | 33.10K | 32.22μs | 23.68μs | 0.82% | 33.65μs | 82.27μs | 26.46μs | 1.73ms | 31K |
| tiny - 100px cells (1000×1000px canvas) | 32.75K | 32.64μs | 27.32μs | 0.94% | 34.03μs | 77.35μs | 25.97μs | 2.03ms | 31K |
| small - 100px cells (5000×5000px canvas) | 1.78K | 566.74μs | 61.26μs | 0.50% | 556.97μs | 847.93μs | 530.01μs | 1.28ms | 2K |
| small - 50px cells (2500×2500px canvas) | 1.71K | 594.71μs | 86.64μs | 0.70% | 593.14μs | 943.99μs | 528.51μs | 1.39ms | 2K |
| small - 10px cells (500×500px canvas) | 1.67K | 611.43μs | 105.03μs | 0.83% | 622.07μs | 1.03ms | 519.18μs | 1.67ms | 2K |
| small - 20px cells (1000×1000px canvas) | 1.62K | 642.81μs | 170.09μs | 1.31% | 694.28μs | 1.28ms | 534.17μs | 2.50ms | 2K |
| hubmap-lung - 10px cells (710×450px canvas) | 845.64 | 1.20ms | 200.74μs | 1.14% | 1.17ms | 2.26ms | 1.11ms | 3.27ms | 833 |
| hubmap-lung - 20px cells (1420×900px canvas) | 809.25 | 1.28ms | 335.19μs | 1.84% | 1.25ms | 2.68ms | 1.11ms | 5.15ms | 782 |
| hubmap-lung - 50px cells (3550×2250px canvas) | 753.55 | 1.38ms | 340.59μs | 1.80% | 1.50ms | 2.83ms | 1.12ms | 3.60ms | 723 |
| hubmap-lung - 100px cells (7100×4500px canvas) | 730.49 | 1.43ms | 362.04μs | 1.88% | 1.52ms | 3.10ms | 1.13ms | 4.40ms | 701 |
| hubmap-kidney - 50px cells (2400×5400px canvas) | 516.80 | 1.94ms | 147.60μs | 0.66% | 1.93ms | 2.78ms | 1.86ms | 2.82ms | 515 |
| hubmap-kidney - 20px cells (960×2160px canvas) | 510.51 | 1.97ms | 201.35μs | 0.89% | 1.94ms | 2.85ms | 1.85ms | 3.16ms | 507 |
| hubmap-kidney - 100px cells (4800×10800px canvas) | 501.59 | 2.02ms | 276.43μs | 1.21% | 1.96ms | 3.14ms | 1.86ms | 4.42ms | 496 |
| hubmap-kidney - 10px cells (480×1080px canvas) | 490.58 | 2.08ms | 351.34μs | 1.51% | 2.07ms | 3.42ms | 1.87ms | 4.29ms | 481 |
| medium - 50px cells (5000×5000px canvas) | 458.58 | 2.20ms | 221.32μs | 0.93% | 2.16ms | 3.18ms | 2.06ms | 3.32ms | 456 |
| medium - 20px cells (2000×2000px canvas) | 458.50 | 2.21ms | 300.39μs | 1.26% | 2.16ms | 3.31ms | 2.04ms | 4.76ms | 453 |
| medium - 10px cells (1000×1000px canvas) | 442.26 | 2.30ms | 380.04μs | 1.56% | 2.30ms | 3.94ms | 2.06ms | 4.84ms | 434 |
| medium - 100px cells (10000×10000px canvas) | 440.03 | 2.32ms | 393.05μs | 1.60% | 2.28ms | 4.11ms | 2.07ms | 4.89ms | 432 |
| extraTall - 100px cells (2000×100000px canvas) | 218.24 | 4.72ms | 889.88μs | 2.55% | 5.15ms | 7.74ms | 3.71ms | 8.01ms | 212 |
| extraTall - 20px cells (400×20000px canvas) | 215.34 | 4.79ms | 929.27μs | 2.65% | 5.25ms | 7.43ms | 3.76ms | 9.14ms | 209 |
| extraTall - 10px cells (200×10000px canvas) | 213.13 | 4.83ms | 1.03ms | 2.92% | 5.22ms | 7.46ms | 3.77ms | 15.05ms | 208 |
| extraTall - 50px cells (1000×50000px canvas) | 207.68 | 4.97ms | 932.11μs | 2.60% | 5.50ms | 7.63ms | 3.78ms | 7.91ms | 202 |
| extraWide - 100px cells (100000×2000px canvas) | 192.69 | 5.29ms | 914.39μs | 2.48% | 5.35ms | 8.92ms | 4.43ms | 12.50ms | 189 |
| extraWide - 10px cells (10000×200px canvas) | 179.66 | 5.76ms | 1.16ms | 3.02% | 6.49ms | 9.28ms | 4.49ms | 10.62ms | 174 |
| extraWide - 20px cells (20000×400px canvas) | 177.03 | 5.79ms | 996.10μs | 2.58% | 6.40ms | 8.88ms | 4.56ms | 9.44ms | 173 |
| extraWide - 50px cells (50000×1000px canvas) | 174.13 | 5.93ms | 1.20ms | 3.08% | 6.42ms | 10.95ms | 4.74ms | 11.67ms | 169 |
| tall - 100px cells (5000×50000px canvas) | 149.59 | 6.91ms | 1.35ms | 3.22% | 7.46ms | 11.27ms | 5.48ms | 12.00ms | 145 |
| tall - 20px cells (1000×10000px canvas) | 146.86 | 6.93ms | 1.06ms | 2.50% | 6.95ms | 10.31ms | 5.50ms | 13.02ms | 145 |
| tall - 50px cells (2500×25000px canvas) | 145.86 | 7.01ms | 1.13ms | 2.67% | 7.61ms | 11.14ms | 5.41ms | 11.81ms | 143 |
| wide - 10px cells (5000×500px canvas) | 133.60 | 7.73ms | 1.43ms | 3.21% | 8.72ms | 11.35ms | 5.72ms | 11.61ms | 130 |
| wide - 50px cells (25000×2500px canvas) | 131.00 | 7.74ms | 985.86μs | 2.21% | 8.18ms | 10.41ms | 6.42ms | 12.26ms | 130 |
| wide - 20px cells (10000×1000px canvas) | 131.41 | 7.77ms | 1.14ms | 2.56% | 8.58ms | 11.11ms | 5.63ms | 12.14ms | 129 |
| tall - 10px cells (500×5000px canvas) | 126.04 | 8.07ms | 1.10ms | 2.41% | 8.57ms | 11.23ms | 5.86ms | 12.20ms | 124 |
| wide - 100px cells (50000×5000px canvas) | 120.62 | 8.48ms | 1.31ms | 2.82% | 9.08ms | 11.60ms | 5.95ms | 13.36ms | 118 |
| hca-data - 100px cells (5100×48400px canvas) | 106.07 | 9.49ms | 873.33μs | 1.77% | 9.32ms | 12.22ms | 8.93ms | 13.08ms | 106 |
| hca-data - 50px cells (2550×24200px canvas) | 104.70 | 9.63ms | 981.71μs | 1.98% | 9.55ms | 13.05ms | 8.93ms | 13.24ms | 104 |
| hca-data - 10px cells (510×4840px canvas) | 94.51 | 10.67ms | 1.01ms | 1.95% | 11.06ms | 13.65ms | 9.24ms | 14.00ms | 94 |
| hca-data - 20px cells (1020×9680px canvas) | 93.63 | 10.93ms | 1.87ms | 3.53% | 11.32ms | 16.39ms | 9.07ms | 17.74ms | 92 |
| large - 100px cells (30000×20000px canvas) | 56.51 | 17.77ms | 1.18ms | 1.66% | 18.42ms | 21.26ms | 16.13ms | 21.33ms | 64 |
| large - 20px cells (6000×4000px canvas) | 55.57 | 18.04ms | 926.72μs | 1.28% | 18.60ms | 20.50ms | 16.90ms | 21.27ms | 64 |
| large - 10px cells (3000×2000px canvas) | 54.97 | 18.33ms | 1.70ms | 2.32% | 18.98ms | 24.49ms | 16.31ms | 25.31ms | 64 |
| large - 50px cells (15000×10000px canvas) | 52.55 | 19.22ms | 1.97ms | 2.57% | 20.29ms | 23.65ms | 14.97ms | 24.63ms | 64 |
| huge - 100px cells (50000×50000px canvas) | 11.05 | 92.93ms | 17.27ms | 4.64% | 96.92ms | 154.25ms | 71.71ms | 158.89ms | 64 |
| huge - 10px cells (5000×5000px canvas) | 10.58 | 95.94ms | 12.99ms | 3.38% | 97.53ms | 141.38ms | 77.66ms | 142.45ms | 64 |
| huge - 20px cells (10000×10000px canvas) | 10.13 | 99.89ms | 12.08ms | 3.02% | 103.31ms | 144.58ms | 85.16ms | 149.30ms | 64 |
| huge - 50px cells (25000×25000px canvas) | 10.10 | 100.18ms | 12.15ms | 3.03% | 104.50ms | 143.42ms | 84.10ms | 152.06ms | 64 |

## Export Memory Efficiency

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 32.58K | 32.95μs | 26.33μs | 0.90% | 33.94μs | 86.16μs | 26.38μs | 1.85ms | 30K |
| small | 1.64K | 623.90μs | 118.16μs | 0.93% | 623.87μs | 1.08ms | 537.75μs | 1.91ms | 2K |
| hubmap-lung | 835.40 | 1.22ms | 210.21μs | 1.18% | 1.19ms | 2.38ms | 1.11ms | 3.51ms | 823 |
| hubmap-kidney | 500.54 | 2.02ms | 229.61μs | 1.00% | 1.99ms | 2.99ms | 1.83ms | 3.48ms | 496 |
| medium | 444.15 | 2.28ms | 296.94μs | 1.22% | 2.23ms | 3.66ms | 2.08ms | 4.34ms | 439 |
| extraTall | 251.74 | 4.04ms | 767.11μs | 2.37% | 3.95ms | 6.33ms | 3.69ms | 13.01ms | 248 |
| extraWide | 181.99 | 5.62ms | 938.23μs | 2.47% | 6.02ms | 8.19ms | 4.55ms | 10.65ms | 178 |
| tall | 171.73 | 5.88ms | 646.13μs | 1.66% | 5.76ms | 8.67ms | 5.46ms | 10.09ms | 171 |
| wide | 156.14 | 6.53ms | 1.16ms | 2.82% | 6.72ms | 9.79ms | 5.70ms | 16.62ms | 154 |
| hca-data | 88.50 | 11.70ms | 2.33ms | 4.27% | 13.32ms | 17.41ms | 8.92ms | 19.24ms | 86 |
| large | 51.24 | 19.93ms | 2.89ms | 3.63% | 21.95ms | 25.89ms | 14.97ms | 26.13ms | 64 |
| huge | 10.58 | 96.21ms | 14.40ms | 3.74% | 100.05ms | 144.19ms | 77.36ms | 154.79ms | 64 |

## Complete Export Pipeline

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - full pipeline | 34.53K | 30.49μs | 25.14μs | 0.89% | 28.76μs | 70.63μs | 25.61μs | 1.90ms | 33K |
| small - full pipeline | 1.77K | 579.67μs | 119.95μs | 0.98% | 597.43μs | 1.03ms | 501.98μs | 2.15ms | 2K |
| hubmap-lung - full pipeline | 786.23 | 1.30ms | 238.52μs | 1.30% | 1.27ms | 2.46ms | 1.17ms | 2.98ms | 770 |
| medium - full pipeline | 471.18 | 2.16ms | 354.83μs | 1.50% | 2.13ms | 3.44ms | 1.94ms | 5.15ms | 463 |
| hubmap-kidney - full pipeline | 466.16 | 2.19ms | 341.77μs | 1.44% | 2.24ms | 3.60ms | 1.95ms | 3.85ms | 458 |
| extraTall - full pipeline | 208.59 | 4.88ms | 736.52μs | 2.08% | 4.96ms | 7.60ms | 4.12ms | 9.77ms | 205 |
| extraWide - full pipeline | 177.91 | 5.78ms | 1.03ms | 2.67% | 6.39ms | 8.28ms | 4.46ms | 9.05ms | 173 |
| tall - full pipeline | 167.46 | 6.09ms | 950.50μs | 2.40% | 6.18ms | 9.69ms | 5.42ms | 10.03ms | 165 |
| wide - full pipeline | 153.53 | 6.67ms | 1.17ms | 2.84% | 7.08ms | 10.80ms | 5.70ms | 13.11ms | 150 |
| hca-data - full pipeline | 86.64 | 11.68ms | 1.39ms | 2.56% | 12.25ms | 15.57ms | 10.42ms | 18.04ms | 86 |
| large - full pipeline | 56.47 | 17.92ms | 1.97ms | 2.75% | 19.10ms | 22.60ms | 14.46ms | 22.86ms | 64 |
| huge - full pipeline | 11.13 | 91.37ms | 13.24ms | 3.62% | 94.37ms | 140.37ms | 65.46ms | 150.41ms | 64 |

# Heatmap rendering

## Calculate Heatmap Cells

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 93.57K | 10.98μs | 7.33μs | 0.43% | 10.56μs | 20.18μs | 9.95μs | 851.37μs | 91K |
| small | 3.07K | 336.61μs | 109.31μs | 1.17% | 325.46μs | 681.71μs | 297.75μs | 2.33ms | 3K |
| hubmap-lung | 1.89K | 533.91μs | 77.14μs | 0.65% | 527.55μs | 834.30μs | 491.88μs | 1.66ms | 2K |
| hubmap-kidney | 1.04K | 965.81μs | 97.95μs | 0.62% | 951.14μs | 1.43ms | 907.60μs | 1.67ms | 1K |
| medium | 696.41 | 1.47ms | 273.42μs | 1.40% | 1.59ms | 2.51ms | 1.28ms | 3.48ms | 680 |
| extraTall | 313.98 | 3.29ms | 722.49μs | 2.48% | 3.34ms | 6.37ms | 2.83ms | 7.74ms | 305 |
| extraWide | 272.43 | 3.76ms | 827.00μs | 2.65% | 3.74ms | 6.71ms | 3.33ms | 12.74ms | 266 |
| wide | 220.24 | 4.61ms | 673.73μs | 1.95% | 4.65ms | 7.00ms | 4.14ms | 8.72ms | 217 |
| tall | 212.31 | 4.89ms | 1.06ms | 2.98% | 5.34ms | 8.43ms | 3.85ms | 10.02ms | 205 |
| hca-data | 195.59 | 5.29ms | 1.08ms | 2.93% | 5.79ms | 8.34ms | 4.19ms | 8.70ms | 190 |
| large | 67.71 | 15.15ms | 2.53ms | 4.11% | 16.25ms | 21.92ms | 10.66ms | 22.30ms | 66 |
| huge | 13.91 | 73.10ms | 10.24ms | 3.50% | 76.61ms | 106.55ms | 57.43ms | 113.94ms | 64 |

## Calculate Heatmap Cells with Expanded Rows

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - 50% expanded rows | 182.61K | 5.60μs | 4.83μs | 0.40% | 5.47μs | 9.97μs | 5.10μs | 782.73μs | 179K |
| tiny - 10% expanded rows | 101.40K | 10.10μs | 6.76μs | 0.42% | 9.81μs | 18.51μs | 9.36μs | 617.42μs | 99K |
| tiny - no expanded rows | 93.24K | 10.89μs | 6.18μs | 0.37% | 10.69μs | 16.88μs | 10.19μs | 428.29μs | 92K |
| small - 50% expanded rows | 5.78K | 176.61μs | 42.73μs | 0.63% | 178.75μs | 282.82μs | 159.49μs | 1.44ms | 6K |
| hubmap-lung - 50% expanded rows | 3.43K | 303.23μs | 89.88μs | 1.01% | 304.34μs | 723.47μs | 259.97μs | 1.49ms | 3K |
| small - 10% expanded rows | 3.19K | 325.16μs | 102.10μs | 1.11% | 312.61μs | 848.88μs | 288.54μs | 2.04ms | 3K |
| small - no expanded rows | 2.96K | 343.78μs | 96.80μs | 1.02% | 339.62μs | 600.29μs | 316.47μs | 3.45ms | 3K |
| hubmap-lung - 10% expanded rows | 1.93K | 531.97μs | 116.02μs | 0.99% | 524.57μs | 1.02ms | 471.60μs | 2.19ms | 2K |
| hubmap-kidney - 50% expanded rows | 1.91K | 537.09μs | 128.88μs | 1.09% | 523.78μs | 1.03ms | 468.16μs | 2.42ms | 2K |
| hubmap-lung - no expanded rows | 1.79K | 567.38μs | 95.89μs | 0.79% | 552.30μs | 1.01ms | 507.83μs | 1.62ms | 2K |
| medium - 50% expanded rows | 1.39K | 731.57μs | 117.37μs | 0.85% | 714.07μs | 1.30ms | 668.94μs | 1.79ms | 1K |
| hubmap-kidney - 10% expanded rows | 1.05K | 976.09μs | 181.39μs | 1.14% | 1.04ms | 1.77ms | 846.80μs | 2.54ms | 1K |
| hubmap-kidney - no expanded rows | 987.25 | 1.03ms | 134.95μs | 0.83% | 1.02ms | 1.55ms | 932.26μs | 2.03ms | 975 |
| medium - 10% expanded rows | 769.60 | 1.31ms | 146.66μs | 0.79% | 1.31ms | 1.96ms | 1.19ms | 2.26ms | 763 |
| medium - no expanded rows | 718.26 | 1.40ms | 112.89μs | 0.59% | 1.39ms | 1.90ms | 1.32ms | 2.41ms | 715 |
| extraTall - 50% expanded rows | 603.83 | 1.68ms | 260.39μs | 1.25% | 1.70ms | 2.82ms | 1.50ms | 3.75ms | 594 |
| extraWide - 50% expanded rows | 520.76 | 1.95ms | 297.25μs | 1.32% | 2.01ms | 3.10ms | 1.74ms | 4.38ms | 512 |
| tall - 50% expanded rows | 483.91 | 2.11ms | 392.35μs | 1.68% | 2.03ms | 3.74ms | 1.91ms | 6.85ms | 476 |
| hca-data - 50% expanded rows | 460.12 | 2.18ms | 190.98μs | 0.80% | 2.16ms | 2.92ms | 2.06ms | 4.65ms | 458 |
| wide - 50% expanded rows | 446.53 | 2.27ms | 280.31μs | 1.16% | 2.24ms | 3.33ms | 2.05ms | 3.97ms | 442 |
| extraTall - 10% expanded rows | 330.03 | 3.09ms | 472.33μs | 1.67% | 3.27ms | 4.87ms | 2.70ms | 6.06ms | 325 |
| extraTall - no expanded rows | 315.43 | 3.22ms | 605.03μs | 2.10% | 3.17ms | 4.52ms | 2.94ms | 11.90ms | 311 |
| extraWide - 10% expanded rows | 286.37 | 3.55ms | 581.29μs | 1.91% | 3.53ms | 6.15ms | 3.18ms | 7.41ms | 283 |
| tall - 10% expanded rows | 270.89 | 3.74ms | 515.50μs | 1.66% | 3.68ms | 6.44ms | 3.42ms | 7.11ms | 268 |
| extraWide - no expanded rows | 247.45 | 4.12ms | 671.47μs | 2.06% | 4.33ms | 6.66ms | 3.54ms | 8.13ms | 243 |
| hca-data - 10% expanded rows | 242.09 | 4.18ms | 498.21μs | 1.52% | 4.42ms | 5.77ms | 3.68ms | 6.20ms | 240 |
| wide - 10% expanded rows | 240.82 | 4.20ms | 508.52μs | 1.54% | 4.13ms | 6.41ms | 3.83ms | 7.00ms | 239 |
| tall - no expanded rows | 228.56 | 4.46ms | 714.54μs | 2.11% | 4.35ms | 7.28ms | 3.95ms | 8.44ms | 225 |
| hca-data - no expanded rows | 219.53 | 4.64ms | 747.04μs | 2.16% | 4.57ms | 8.04ms | 4.21ms | 9.13ms | 216 |
| large - 50% expanded rows | 209.17 | 4.81ms | 420.05μs | 1.19% | 4.77ms | 6.26ms | 4.42ms | 6.57ms | 208 |
| wide - no expanded rows | 198.83 | 5.18ms | 993.81μs | 2.72% | 5.60ms | 8.56ms | 4.31ms | 9.49ms | 194 |
| large - 10% expanded rows | 101.54 | 9.97ms | 1.16ms | 2.30% | 10.45ms | 12.51ms | 8.44ms | 14.95ms | 101 |
| large - no expanded rows | 69.38 | 14.75ms | 3.17ms | 5.21% | 14.79ms | 25.35ms | 12.57ms | 37.80ms | 68 |
| huge - 50% expanded rows | 29.29 | 34.79ms | 4.82ms | 3.46% | 38.75ms | 46.11ms | 25.68ms | 46.46ms | 64 |
| huge - 10% expanded rows | 14.41 | 70.70ms | 10.52ms | 3.72% | 73.72ms | 103.21ms | 57.60ms | 106.81ms | 64 |
| huge - no expanded rows | 13.51 | 75.38ms | 11.41ms | 3.78% | 76.22ms | 114.01ms | 62.28ms | 118.57ms | 64 |

## Render Cells to Canvas

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 5.63M | 0.18μs | 0.87μs | 0.40% | 0.18μs | 0.25μs | 0.15μs | 1.76ms | 5M |
| small | 361.23K | 2.82μs | 1.01μs | 0.12% | 2.89μs | 5.37μs | 2.39μs | 421.52μs | 354K |
| hubmap-lung | 270.70K | 3.85μs | 3.00μs | 0.30% | 3.79μs | 7.57μs | 3.07μs | 827.63μs | 260K |
| hubmap-kidney | 169.48K | 5.97μs | 0.89μs | 0.07% | 6.04μs | 10.41μs | 5.29μs | 72.13μs | 168K |
| medium | 79.83K | 12.63μs | 1.39μs | 0.08% | 12.96μs | 19.06μs | 10.33μs | 86.95μs | 79K |
| extraTall | 44.49K | 22.69μs | 2.76μs | 0.11% | 22.70μs | 37.37μs | 20.93μs | 98.63μs | 44K |
| extraWide | 42.03K | 24.07μs | 2.95μs | 0.12% | 25.60μs | 35.91μs | 20.92μs | 121.36μs | 42K |
| hca-data | 35.18K | 28.84μs | 15.13μs | 0.55% | 29.13μs | 42.37μs | 25.17μs | 2.06ms | 35K |
| wide | 32.46K | 31.66μs | 21.05μs | 0.73% | 31.87μs | 57.43μs | 26.00μs | 3.27ms | 32K |
| tall | 31.81K | 31.95μs | 8.87μs | 0.31% | 32.58μs | 50.45μs | 26.26μs | 677.09μs | 31K |
| large | 13.89K | 72.66μs | 8.98μs | 0.21% | 75.69μs | 97.72μs | 62.36μs | 623.95μs | 14K |
| huge | 2.09K | 495.06μs | 111.27μs | 0.98% | 529.55μs | 752.31μs | 335.21μs | 2.67ms | 2K |

## End-to-End: Calculate + Render

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 85.94K | 12.05μs | 12.21μs | 0.69% | 11.47μs | 21.43μs | 10.67μs | 1.23ms | 83K |
| small | 2.73K | 380.94μs | 114.28μs | 1.15% | 374.32μs | 944.30μs | 323.00μs | 2.05ms | 3K |
| hubmap-lung | 1.76K | 574.99μs | 96.27μs | 0.79% | 560.89μs | 1.03ms | 530.38μs | 2.23ms | 2K |
| hubmap-kidney | 973.11 | 1.04ms | 105.47μs | 0.64% | 1.02ms | 1.55ms | 952.48μs | 2.00ms | 966 |
| medium | 625.39 | 1.65ms | 323.59μs | 1.57% | 1.78ms | 2.72ms | 1.39ms | 4.15ms | 608 |
| extraTall | 284.41 | 3.64ms | 918.40μs | 3.00% | 3.76ms | 6.14ms | 3.03ms | 12.84ms | 275 |
| extraWide | 241.68 | 4.26ms | 865.41μs | 2.61% | 4.49ms | 7.03ms | 3.63ms | 9.35ms | 235 |
| tall | 220.69 | 4.64ms | 818.35μs | 2.37% | 4.71ms | 7.79ms | 4.06ms | 9.11ms | 216 |
| wide | 201.23 | 5.10ms | 1.02ms | 2.80% | 5.27ms | 8.04ms | 4.33ms | 13.08ms | 196 |
| hca-data | 189.94 | 5.39ms | 887.09μs | 2.38% | 5.93ms | 7.84ms | 4.43ms | 9.22ms | 186 |
| large | 68.85 | 14.96ms | 2.65ms | 4.32% | 16.59ms | 21.66ms | 10.55ms | 21.73ms | 67 |
| huge | 13.08 | 77.79ms | 11.62ms | 3.73% | 82.28ms | 121.42ms | 57.27ms | 141.77ms | 64 |

## Scalability: Cell Calculation Complexity

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 88.57K | 12.10μs | 19.54μs | 1.10% | 11.03μs | 27.11μs | 10.34μs | 1.69ms | 83K |
| small | 2.78K | 371.41μs | 104.92μs | 1.07% | 366.91μs | 815.07μs | 321.00μs | 2.59ms | 3K |
| hubmap-lung | 1.77K | 580.14μs | 132.99μs | 1.08% | 568.29μs | 1.22ms | 506.23μs | 2.49ms | 2K |
| hubmap-kidney | 959.39 | 1.07ms | 239.92μs | 1.44% | 1.06ms | 2.08ms | 937.98μs | 3.02ms | 932 |
| medium | 683.00 | 1.48ms | 171.90μs | 0.88% | 1.45ms | 2.27ms | 1.37ms | 2.58ms | 677 |
| extraTall | 318.40 | 3.21ms | 633.35μs | 2.20% | 3.07ms | 5.35ms | 2.91ms | 11.03ms | 312 |
| extraWide | 253.59 | 4.01ms | 583.44μs | 1.81% | 4.21ms | 6.03ms | 3.49ms | 6.87ms | 250 |
| wide | 218.18 | 4.71ms | 928.11μs | 2.66% | 4.92ms | 7.33ms | 3.98ms | 12.04ms | 213 |
| tall | 197.37 | 5.27ms | 1.24ms | 3.36% | 5.57ms | 10.20ms | 4.09ms | 12.38ms | 190 |
| hca-data | 190.97 | 5.41ms | 1.09ms | 2.92% | 5.92ms | 8.61ms | 4.27ms | 10.24ms | 185 |
| large | 75.27 | 13.52ms | 1.89ms | 3.25% | 14.45ms | 19.36ms | 10.80ms | 19.68ms | 74 |
| huge | 14.44 | 70.53ms | 10.57ms | 3.74% | 75.16ms | 105.00ms | 58.29ms | 119.43ms | 64 |

# Side graphs

## Data Preparation for Side Graphs

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 111.77K | 9.53μs | 17.78μs | 1.13% | 10.00μs | 21.01μs | 7.72μs | 3.26ms | 105K |
| small | 4.08K | 247.17μs | 35.58μs | 0.44% | 245.56μs | 380.79μs | 231.53μs | 1.75ms | 4K |
| hubmap-lung | 1.41K | 729.42μs | 213.95μs | 1.55% | 695.65μs | 1.60ms | 653.50μs | 3.36ms | 1K |
| extraWide | 1.29K | 788.39μs | 174.01μs | 1.21% | 773.48μs | 1.14ms | 746.42μs | 2.77ms | 1K |
| medium | 1.27K | 809.94μs | 224.62μs | 1.55% | 774.24μs | 1.82ms | 740.50μs | 4.61ms | 1K |
| extraTall | 1.05K | 967.03μs | 184.87μs | 1.16% | 950.49μs | 2.36ms | 904.10μs | 2.85ms | 1K |
| hubmap-kidney | 913.08 | 1.11ms | 178.42μs | 1.05% | 1.09ms | 1.62ms | 1.05ms | 3.10ms | 905 |
| wide | 653.99 | 1.57ms | 425.41μs | 2.11% | 1.51ms | 4.53ms | 1.41ms | 6.04ms | 636 |
| tall | 494.09 | 2.08ms | 465.94μs | 2.01% | 2.08ms | 4.57ms | 1.80ms | 5.55ms | 480 |
| large | 242.98 | 4.21ms | 751.75μs | 2.28% | 4.46ms | 7.29ms | 3.66ms | 8.43ms | 238 |
| hca-data | 141.70 | 7.15ms | 957.10μs | 2.24% | 7.10ms | 11.24ms | 6.51ms | 11.43ms | 140 |
| huge | 68.82 | 14.68ms | 1.60ms | 2.62% | 15.41ms | 19.98ms | 12.52ms | 20.77ms | 69 |

## Scale Creation for Side Graphs

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny - continuous scale for bars | 2.08M | 0.51μs | 2.49μs | 0.68% | 0.51μs | 0.89μs | 0.41μs | 1.87ms | 2M |
| small - continuous scale for bars | 2.07M | 0.53μs | 2.59μs | 0.70% | 0.50μs | 1.26μs | 0.40μs | 1.51ms | 2M |
| hubmap-kidney - continuous scale for bars | 2.05M | 0.53μs | 3.12μs | 0.84% | 0.51μs | 1.10μs | 0.41μs | 1.98ms | 2M |
| extraTall - continuous scale for bars | 2.03M | 0.53μs | 4.30μs | 1.15% | 0.53μs | 1.07μs | 0.40μs | 5.01ms | 2M |
| large - continuous scale for bars | 2.02M | 0.54μs | 7.19μs | 1.92% | 0.53μs | 1.14μs | 0.41μs | 9.29ms | 2M |
| extraWide - continuous scale for bars | 2.01M | 0.54μs | 2.23μs | 0.59% | 0.53μs | 1.09μs | 0.41μs | 739.20μs | 2M |
| medium - continuous scale for bars | 2.04M | 0.54μs | 7.91μs | 2.11% | 0.52μs | 1.11μs | 0.41μs | 9.99ms | 2M |
| hubmap-lung - continuous scale for bars | 2.01M | 0.54μs | 2.67μs | 0.71% | 0.53μs | 1.16μs | 0.41μs | 1.66ms | 2M |
| hca-data - continuous scale for bars | 1.99M | 0.55μs | 2.43μs | 0.64% | 0.54μs | 1.22μs | 0.41μs | 1.66ms | 2M |
| huge - continuous scale for bars | 2.02M | 0.55μs | 4.15μs | 1.10% | 0.52μs | 1.16μs | 0.41μs | 1.77ms | 2M |
| tall - continuous scale for bars | 2.02M | 0.55μs | 2.36μs | 0.63% | 0.53μs | 1.82μs | 0.41μs | 803.72μs | 2M |
| wide - continuous scale for bars | 2.02M | 0.55μs | 3.34μs | 0.88% | 0.54μs | 1.20μs | 0.40μs | 1.65ms | 2M |
| tiny | 329.66K | 3.54μs | 31.31μs | 3.26% | 3.35μs | 7.38μs | 2.61μs | 10.32ms | 283K |
| extraTall | 264.92K | 4.56μs | 57.93μs | 5.31% | 4.00μs | 9.44μs | 3.35μs | 22.16ms | 219K |
| small | 168.29K | 6.91μs | 40.40μs | 3.01% | 6.04μs | 12.28μs | 5.17μs | 3.37ms | 145K |
| hubmap-kidney | 170.22K | 6.97μs | 68.25μs | 5.07% | 6.06μs | 12.22μs | 5.18μs | 19.71ms | 143K |
| tall | 161.69K | 7.46μs | 43.65μs | 3.13% | 6.83μs | 16.48μs | 5.20μs | 3.17ms | 134K |
| hca-data | 140.28K | 8.49μs | 47.16μs | 3.17% | 7.78μs | 20.05μs | 5.72μs | 8.01ms | 118K |
| hubmap-lung | 115.37K | 10.58μs | 58.67μs | 3.53% | 9.52μs | 22.52μs | 7.12μs | 8.77ms | 95K |
| medium | 94.94K | 12.63μs | 62.74μs | 3.46% | 11.60μs | 25.04μs | 8.80μs | 9.71ms | 79K |
| large | 30.54K | 40.20μs | 175.11μs | 5.41% | 36.08μs | 85.85μs | 26.13μs | 16.71ms | 25K |
| huge | 21.92K | 52.48μs | 112.86μs | 3.05% | 51.47μs | 93.11μs | 38.64μs | 7.57ms | 19K |
| wide | 21.69K | 53.37μs | 111.27μs | 2.98% | 51.34μs | 101.09μs | 38.78μs | 7.67ms | 19K |
| extraWide | 9.81K | 118.75μs | 291.60μs | 5.24% | 109.97μs | 244.28μs | 79.57μs | 17.04ms | 8K |

## Data Aggregation for Violins (O(n×m) Complexity)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 65.01K | 15.88μs | 12.53μs | 0.62% | 15.22μs | 30.04μs | 13.80μs | 2.39ms | 63K |
| small | 2.09K | 488.69μs | 105.09μs | 0.93% | 473.37μs | 818.20μs | 434.90μs | 2.10ms | 2K |
| hubmap-lung | 823.12 | 1.24ms | 244.17μs | 1.36% | 1.22ms | 2.59ms | 1.08ms | 3.13ms | 805 |
| medium | 541.58 | 1.89ms | 338.17μs | 1.53% | 2.03ms | 3.21ms | 1.57ms | 3.88ms | 529 |
| hubmap-kidney | 504.14 | 2.01ms | 246.65μs | 1.08% | 2.00ms | 3.08ms | 1.79ms | 3.88ms | 499 |
| extraWide | 315.34 | 3.23ms | 512.48μs | 1.77% | 3.31ms | 4.82ms | 2.75ms | 7.15ms | 310 |
| extraTall | 309.83 | 3.26ms | 399.95μs | 1.38% | 3.21ms | 5.34ms | 2.86ms | 6.11ms | 307 |
| wide | 211.44 | 4.86ms | 862.06μs | 2.44% | 5.42ms | 7.25ms | 3.98ms | 8.17ms | 206 |
| tall | 206.55 | 4.95ms | 802.04μs | 2.25% | 5.40ms | 7.16ms | 4.24ms | 7.98ms | 202 |
| hca-data | 91.52 | 11.22ms | 1.91ms | 3.57% | 12.33ms | 16.08ms | 8.81ms | 16.10ms | 90 |
| large | 69.21 | 14.81ms | 2.30ms | 3.77% | 16.21ms | 20.18ms | 9.65ms | 21.01ms | 68 |
| huge | 15.66 | 64.33ms | 5.65ms | 2.19% | 67.67ms | 77.94ms | 54.05ms | 79.16ms | 64 |

## Fraction Normalization (Violin Prep)

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 114.89K | 9.27μs | 10.52μs | 0.68% | 9.77μs | 22.41μs | 7.46μs | 1.21ms | 108K |
| small | 4.09K | 248.92μs | 55.59μs | 0.69% | 241.59μs | 426.44μs | 225.27μs | 1.75ms | 4K |
| hubmap-lung | 1.44K | 712.71μs | 207.76μs | 1.52% | 688.25μs | 1.43ms | 644.80μs | 2.99ms | 1K |
| medium | 1.33K | 766.82μs | 205.79μs | 1.46% | 741.18μs | 1.57ms | 700.04μs | 3.63ms | 1K |
| extraWide | 1.25K | 816.36μs | 199.80μs | 1.37% | 796.84μs | 1.74ms | 749.20μs | 2.88ms | 1K |
| extraTall | 1.06K | 958.24μs | 185.94μs | 1.18% | 944.06μs | 2.42ms | 891.83μs | 2.86ms | 1K |
| hubmap-kidney | 896.90 | 1.14ms | 222.30μs | 1.29% | 1.10ms | 1.96ms | 1.04ms | 3.30ms | 881 |
| wide | 659.69 | 1.55ms | 370.89μs | 1.85% | 1.52ms | 4.76ms | 1.43ms | 4.90ms | 648 |
| tall | 539.85 | 1.88ms | 337.47μs | 1.53% | 1.84ms | 4.26ms | 1.77ms | 4.51ms | 532 |
| large | 265.84 | 3.85ms | 731.39μs | 2.32% | 3.77ms | 7.12ms | 3.42ms | 9.67ms | 260 |
| hca-data | 130.75 | 7.88ms | 1.49ms | 3.33% | 8.56ms | 13.64ms | 5.64ms | 14.47ms | 127 |
| huge | 69.23 | 14.75ms | 2.22ms | 3.64% | 15.73ms | 20.24ms | 11.60ms | 20.67ms | 68 |

## Bar Stacking Calculations

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny  | 98.87K | 10.44μs | 18.54μs | 1.12% | 9.94μs | 20.37μs | 9.51μs | 5.18ms | 96K |
| small  | 226.46 | 4.42ms | 59.27μs | 0.18% | 4.43ms | 4.62ms | 4.32ms | 5.00ms | 227 |
| hubmap-lung  | 113.84 | 8.84ms | 781.03μs | 1.64% | 8.70ms | 12.62ms | 8.36ms | 13.58ms | 114 |
| hubmap-kidney  | 42.88 | 23.42ms | 1.60ms | 1.71% | 23.83ms | 28.68ms | 21.95ms | 29.53ms | 64 |
| medium  | 17.45 | 57.90ms | 6.25ms | 2.70% | 62.19ms | 71.09ms | 52.35ms | 71.57ms | 64 |
| extraTall  | 6.50 | 154.17ms | 7.86ms | 1.27% | 157.61ms | 173.53ms | 145.48ms | 174.59ms | 64 |
| extraWide  | 6.16 | 162.72ms | 8.09ms | 1.24% | 166.17ms | 188.66ms | 152.39ms | 188.73ms | 64 |
| tall  | 3.42 | 293.12ms | 14.13ms | 1.20% | 301.34ms | 341.44ms | 272.43ms | 343.62ms | 64 |
| wide  | 3.35 | 299.68ms | 18.08ms | 1.51% | 310.44ms | 347.00ms | 277.76ms | 366.97ms | 64 |
| hca-data  | 1.83 | 547.77ms | 28.96ms | 1.32% | 567.00ms | 629.99ms | 512.90ms | 639.93ms | 64 |
| large  | 0.61 | 1.64s | 54.12ms | 0.82% | 1.68s | 1.77s | 1.56s | 1.79s | 64 |
| huge  | 0.05 | 20.53s | 314.54ms | 0.38% | 20.73s | 21.14s | 19.83s | 21.15s | 64 |

## Scalability Analysis

| Benchmark | Ops/sec | Mean | SD | RME | p75 | p99 | Min | Max | Samples |
|-----------|---------|------|-----|-----|-----|-----|-----|-----|---------|
| tiny | 63.84K | 16.28μs | 13.20μs | 0.64% | 15.40μs | 32.14μs | 14.16μs | 1.68ms | 61K |
| small | 2.21K | 454.94μs | 31.60μs | 0.29% | 460.25μs | 632.41μs | 430.50μs | 994.80μs | 2K |
| hubmap-lung | 846.54 | 1.19ms | 160.80μs | 0.91% | 1.18ms | 2.37ms | 1.11ms | 2.85ms | 839 |
| medium | 605.44 | 1.66ms | 159.44μs | 0.77% | 1.66ms | 2.59ms | 1.57ms | 2.81ms | 602 |
| hubmap-kidney | 496.36 | 2.05ms | 345.62μs | 1.50% | 2.00ms | 3.33ms | 1.85ms | 5.62ms | 488 |
| extraTall | 308.10 | 3.26ms | 253.57μs | 0.87% | 3.26ms | 4.43ms | 3.04ms | 5.37ms | 307 |
| extraWide | 307.95 | 3.31ms | 531.56μs | 1.82% | 3.23ms | 5.25ms | 2.86ms | 6.50ms | 303 |
| wide | 218.40 | 4.62ms | 492.05μs | 1.43% | 4.65ms | 6.42ms | 4.00ms | 7.46ms | 217 |
| tall | 202.61 | 5.01ms | 675.89μs | 1.88% | 5.06ms | 7.19ms | 4.42ms | 8.45ms | 200 |
| hca-data | 105.80 | 9.54ms | 1.04ms | 2.11% | 9.65ms | 12.72ms | 8.68ms | 13.52ms | 105 |
| large | 93.27 | 10.79ms | 907.17μs | 1.73% | 11.10ms | 13.75ms | 9.43ms | 13.89ms | 93 |
| huge | 18.63 | 54.57ms | 7.15ms | 3.27% | 59.24ms | 70.57ms | 43.71ms | 78.74ms | 64 |

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

