import { computeStats } from './stats';
import type { MetricStats } from './types';

export interface Aggregator<K extends string> {
  add(values: Partial<Record<K, number>>): void;
  collect(): Partial<Record<K, MetricStats>>;
}

export function createAggregator<K extends string>(): Aggregator<K> {
  const buckets = new Map<K, number[]>();

  return {
    add(values) {
      for (const [metric, value] of Object.entries(values) as [K, number | undefined][]) {
        if (value == null) continue;
        const bucket = buckets.get(metric);
        if (bucket) bucket.push(value);
        else buckets.set(metric, [value]);
      }
    },
    collect() {
      const out: Partial<Record<K, MetricStats>> = {};
      for (const [metric, values] of buckets) {
        if (values.length > 0) out[metric] = computeStats(values);
      }
      return out;
    },
  };
}
