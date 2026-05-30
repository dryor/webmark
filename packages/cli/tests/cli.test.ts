import { afterEach, describe, expect, rs, test } from '@rstest/core';
import type { MeasureOptions, MeasureResult, Webmark } from '@webmarkjs/core';
import { runMeasure } from '../src/cli';

function fakeWebmark(): Webmark & {
  calls: Array<{ url: URL; options?: MeasureOptions }>;
} {
  const calls: Array<{ url: URL; options?: MeasureOptions }> = [];
  return {
    calls,
    async measure(url: URL, options?: MeasureOptions): Promise<MeasureResult> {
      calls.push({ url, options });
      return {
        url,
        field: {
          lcp: {
            p50: 1800,
            min: 1500,
            max: 2300,
            p75: 1900,
            p99: 2300,
            sd: 200,
            values: [1500, 1800, 2300],
          },
          cls: {
            p50: 0.02,
            min: 0,
            max: 0.04,
            p75: 0.03,
            p99: 0.04,
            sd: 0.01,
            values: [0, 0.02, 0.04],
          },
        },
        lab: {},
      };
    },
  };
}

function captureStdout() {
  const chunks: string[] = [];
  const spy = rs
    .spyOn(process.stdout, 'write')
    .mockImplementation((chunk: string | Uint8Array) => {
      chunks.push(String(chunk));
      return true;
    });
  return { output: () => chunks.join(''), restore: () => spy.mockRestore() };
}

afterEach(() => {
  rs.restoreAllMocks();
});

describe('runMeasure', () => {
  test('normalizes the URL and forwards runs/silent to the core', async () => {
    const wm = fakeWebmark();
    const cap = captureStdout();
    await runMeasure('example.com', { runs: 7, json: true, silent: true }, wm);
    cap.restore();

    expect(wm.calls).toHaveLength(1);
    expect(wm.calls[0].url.href).toBe('https://example.com/');
    expect(wm.calls[0].options).toEqual({ runs: 7, silent: true });
  });

  test('JSON output contains the full MetricStats schema for each metric', async () => {
    const cap = captureStdout();
    await runMeasure(
      'https://example.com',
      { runs: 5, json: true, silent: true },
      fakeWebmark(),
    );
    cap.restore();

    const parsed = JSON.parse(cap.output());
    expect(parsed.url).toBe('https://example.com/');

    const lcp = parsed.field.lcp;
    expect(lcp.p50).toBe(1800);
    expect(lcp.min).toBe(1500);
    expect(lcp.max).toBe(2300);
    expect(lcp.p75).toBe(1900);
    expect(lcp.p99).toBe(2300);
    expect(lcp.sd).toBe(200);
    expect(lcp.values).toEqual([1500, 1800, 2300]);
  });

  test('table output contains the correct headers and formatted values', async () => {
    const cap = captureStdout();
    await runMeasure(
      'https://example.com',
      { runs: 5, json: false, silent: true },
      fakeWebmark(),
    );
    cap.restore();

    const out = cap.output();
    expect(out).toContain('https://example.com/');
    expect(out).toContain('p50');
    expect(out).toContain('sd');
    expect(out).toContain('p75');
    expect(out).toContain('p99');
    expect(out).toContain('LCP');
    expect(out).toContain('1.8s');
    expect(out).toContain('0.020');
  });

  test('rejects an invalid URL before calling the core', async () => {
    const wm = fakeWebmark();
    await expect(
      runMeasure('not a url', { runs: 5, json: true, silent: true }, wm),
    ).rejects.toThrow();
    expect(wm.calls).toHaveLength(0);
  });
});
