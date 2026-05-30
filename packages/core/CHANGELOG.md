# @webmarkjs/core

## 0.2.0

### Minor Changes

- e096f49: Replace `avg` with `p50` (median) in `MetricStats`. The median is a more robust central value for latency distributions — unlike the arithmetic mean, it is not skewed by outlier runs caused by CPU spikes or GC pauses.

## 0.1.1

### Patch Changes

- 398e6f0: Add npm metadata (keywords, homepage, repository, bugs) and rewrite READMEs with full API docs, examples, and requirements.

## 0.1.0

### Minor Changes

- 10c92be: Add extension seams to the measurement core. `measure` is now a thin orchestrator over an open-ended `Aggregator` (carries any metric a runner emits) and a `Reporter` lifecycle (`onMeasureStart`, `onRunStart`, `onRunEnd`, `onError`, `onMeasureEnd`, all optional). A failed run no longer sinks the whole batch. Renames `Logger`/`consoleLogger` to `Reporter`/`consoleReporter`.
