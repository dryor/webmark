import { describe, expect, test } from '@rstest/core';
import type { MeasureResult, MetricStats } from '@webmark/core';
import { formatValue, toRows } from '../src/format';

const stats = (avg: number): MetricStats => ({
  avg,
  min: avg,
  max: avg,
  p75: avg,
  p99: avg,
  sd: 0,
  values: [avg],
});

describe('formatValue', () => {
  test('renders sub-second durations in ms', () => {
    expect(formatValue('lcp', 420)).toBe('420ms');
    expect(formatValue('fcp', 999.6)).toBe('1000ms');
  });

  test('renders durations >= 1s in seconds with one decimal', () => {
    expect(formatValue('lcp', 1847.3)).toBe('1.8s');
    expect(formatValue('tti', 2800)).toBe('2.8s');
  });

  test('renders CLS as a unitless score with three decimals', () => {
    expect(formatValue('cls', 0.0231)).toBe('0.023');
    expect(formatValue('cls', 0)).toBe('0.000');
  });
});

describe('toRows', () => {
  test('orders field metrics before lab metrics and skips absent ones', () => {
    const result: MeasureResult = {
      url: new URL('https://example.com'),
      field: { lcp: stats(1800), cls: stats(0.02) },
      lab: { tti: stats(2100) },
    };

    const rows = toRows(result);

    expect(rows.map((r) => r.metric)).toEqual(['LCP', 'CLS', 'TTI']);
    const lcp = rows[0];
    expect(lcp.avg).toBe('1.8s');
    expect(lcp.range).toBe('1.8s…1.8s');
  });

  test('returns an empty list when no metrics were collected', () => {
    const result: MeasureResult = {
      url: new URL('https://example.com'),
      field: {},
      lab: {},
    };
    expect(toRows(result)).toEqual([]);
  });
});
