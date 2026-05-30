---
"@webmarkjs/core": minor
"@webmarkjs/cli": patch
---

Replace `avg` with `p50` (median) in `MetricStats`. The median is a more robust central value for latency distributions — unlike the arithmetic mean, it is not skewed by outlier runs caused by CPU spikes or GC pauses.
