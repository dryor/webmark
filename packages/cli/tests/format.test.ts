import { describe, expect, test } from '@rstest/core';
import type { MeasureResult, MetricStats } from '@webmarkjs/core';
import { formatValue, toRows } from '../src/format';

const stats = (p50: number, extras: Partial<MetricStats> = {}): MetricStats => ({
  p50,
  min: extras.min ?? p50 * 0.8,
  max: extras.max ?? p50 * 1.2,
  p75: extras.p75 ?? p50 * 1.1,
  p99: extras.p99 ?? p50 * 1.2,
  sd: extras.sd ?? 50,
  values: [p50],
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
  });

  test('all row fields are populated and distinct', () => {
    const result: MeasureResult = {
      url: new URL('https://example.com'),
      field: {
        lcp: stats(1800, { min: 1500, max: 2300, p75: 1900, p99: 2300, sd: 210 }),
      },
      lab: {},
    };

    const [lcp] = toRows(result);
    expect(lcp.p50).toBe('1.8s');
    expect(lcp.sd).toBe('210ms');
    expect(lcp.range).toBe('1.5s…2.3s');
    expect(lcp.p75).toBe('1.9s');
    expect(lcp.p99).toBe('2.3s');
  });

  test('CLS row formats all fields as scores', () => {
    const result: MeasureResult = {
      url: new URL('https://example.com'),
      field: {
        cls: stats(0.022, { min: 0, max: 0.04, p75: 0.031, p99: 0.04, sd: 0.012 }),
      },
      lab: {},
    };

    const [cls] = toRows(result);
    expect(cls.p50).toBe('0.022');
    expect(cls.range).toBe('0.000…0.040');
    expect(cls.p75).toBe('0.031');
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
