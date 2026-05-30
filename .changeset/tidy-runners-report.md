---
"@webmarkjs/core": minor
---

Add extension seams to the measurement core. `measure` is now a thin orchestrator over an open-ended `Aggregator` (carries any metric a runner emits) and a `Reporter` lifecycle (`onMeasureStart`, `onRunStart`, `onRunEnd`, `onError`, `onMeasureEnd`, all optional). A failed run no longer sinks the whole batch. Renames `Logger`/`consoleLogger` to `Reporter`/`consoleReporter`.
