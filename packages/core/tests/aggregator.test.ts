import { describe, expect, test } from '@rstest/core';
import { createAggregator } from '../src/aggregator';

describe('createAggregator', () => {
  test('collect returns empty object when add was never called', () => {
    const agg = createAggregator<'lcp'>();
    expect(agg.collect()).toEqual({});
  });

  test('accumulates values across multiple add calls', () => {
    const agg = createAggregator<'lcp'>();
    agg.add({ lcp: 1500 });
    agg.add({ lcp: 1800 });
    agg.add({ lcp: 2100 });
    const result = agg.collect();
    expect(result.lcp?.values).toEqual([1500, 1800, 2100]);
  });

  test('a metric absent in one run does not reset its bucket', () => {
    const agg = createAggregator<'lcp' | 'ttfb'>();
    agg.add({ lcp: 1500, ttfb: 200 });
    agg.add({ lcp: 1800 });
    const result = agg.collect();
    expect(result.lcp?.values).toEqual([1500, 1800]);
    expect(result.ttfb?.values).toEqual([200]);
  });

  test('null and undefined values are silently skipped', () => {
    const agg = createAggregator<'lcp'>();
    agg.add({ lcp: undefined });
    agg.add({ lcp: null as unknown as number });
    expect(agg.collect()).toEqual({});
  });

  test('collect produces stats with the correct p50 for accumulated values', () => {
    const agg = createAggregator<'lcp'>();
    agg.add({ lcp: 100 });
    agg.add({ lcp: 200 });
    agg.add({ lcp: 300 });
    const result = agg.collect();
    expect(result.lcp?.p50).toBe(200);
    expect(result.lcp?.min).toBe(100);
    expect(result.lcp?.max).toBe(300);
  });
});
