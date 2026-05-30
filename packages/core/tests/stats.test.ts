import { describe, expect, test } from '@rstest/core';
import { computeStats } from '../src/stats';

describe('computeStats', () => {
  describe('percentiles', () => {
    test('p50 is the exact middle value for an odd-length array', () => {
      const s = computeStats([100, 200, 300]);
      expect(s.p50).toBe(200);
    });

    test('p50 interpolates linearly for an even-length array', () => {
      const s = computeStats([100, 200]);
      expect(s.p50).toBe(150);
    });

    test('p75 and p99 are distinct and ordered correctly', () => {
      const s = computeStats([100, 200, 300, 400, 500]);
      expect(s.p50).toBe(300);
      expect(s.p75).toBe(400);
      expect(s.p99).toBeCloseTo(496, 0);
      expect(s.p50).toBeLessThan(s.p75);
      expect(s.p75).toBeLessThan(s.p99);
    });

    test('n=1: all percentiles equal the single value', () => {
      const s = computeStats([42]);
      expect(s.p50).toBe(42);
      expect(s.p75).toBe(42);
      expect(s.p99).toBe(42);
    });
  });

  describe('min / max', () => {
    test('min and max are correct regardless of input order', () => {
      const s = computeStats([300, 100, 200]);
      expect(s.min).toBe(100);
      expect(s.max).toBe(300);
    });

    test('min equals max when all values are the same', () => {
      const s = computeStats([5, 5, 5]);
      expect(s.min).toBe(5);
      expect(s.max).toBe(5);
    });
  });

  describe('standard deviation', () => {
    test('sd is 0 when all values are identical', () => {
      const s = computeStats([7, 7, 7]);
      expect(s.sd).toBe(0);
    });

    test('sd is positive when values differ', () => {
      const s = computeStats([100, 200, 300]);
      expect(s.sd).toBeGreaterThan(0);
    });

    test('sd is symmetric — same result regardless of value order', () => {
      const a = computeStats([100, 200, 300]);
      const b = computeStats([300, 100, 200]);
      expect(a.sd).toBeCloseTo(b.sd, 10);
    });
  });

  describe('values', () => {
    test('preserves the original unsorted input in values', () => {
      const input = [300, 100, 200];
      const s = computeStats(input);
      expect(s.values).toEqual([300, 100, 200]);
    });
  });
});
