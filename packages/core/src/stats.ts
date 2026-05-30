import type { MetricStats } from './types';

export function computeStats(values: number[]): MetricStats {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const avg = sorted.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(sorted.reduce((s, v) => s + (v - avg) ** 2, 0) / n);

  return {
    avg,
    min: sorted[0],
    max: sorted[n - 1],
    p75: percentile(sorted, 0.75),
    p99: percentile(sorted, 0.99),
    sd,
    values,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0];
  const idx = p * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
