# @webmarkjs/cli

## 0.0.4

### Patch Changes

- e096f49: Replace `avg` with `p50` (median) in `MetricStats`. The median is a more robust central value for latency distributions — unlike the arithmetic mean, it is not skewed by outlier runs caused by CPU spikes or GC pauses.
- Updated dependencies [e096f49]
  - @webmarkjs/core@0.2.0

## 0.0.3

### Patch Changes

- 398e6f0: Add npm metadata (keywords, homepage, repository, bugs) and rewrite READMEs with full API docs, examples, and requirements.
- Updated dependencies [398e6f0]
  - @webmarkjs/core@0.1.1

## 0.0.2

### Patch Changes

- Updated dependencies [10c92be]
  - @webmarkjs/core@0.1.0
