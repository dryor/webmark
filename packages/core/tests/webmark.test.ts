import { describe, expect, test } from '@rstest/core';
import { createWebmark } from '../src/index';
import type { Reporter, Runner, RunSample } from '../src/index';

const sampleRunner = (sample: RunSample): Runner =>
  async () => sample;

const failingRunner: Runner = async () => {
  throw new Error('Chrome not found');
};

const silentReporter: Reporter = {};

describe('createWebmark', () => {
  test('runs exactly the requested number of times', async () => {
    let calls = 0;
    const runner: Runner = async () => {
      calls++;
      return { field: { lcp: 1800 }, lab: {} };
    };

    const wm = createWebmark({ runner, reporter: silentReporter });
    await wm.measure(new URL('https://example.com'), { runs: 3, silent: true });
    expect(calls).toBe(3);
  });

  test('result contains stats for metrics the runner reported', async () => {
    const wm = createWebmark({
      runner: sampleRunner({ field: { lcp: 1800, fcp: 1100 }, lab: { tti: 2100 } }),
      reporter: silentReporter,
    });
    const result = await wm.measure(new URL('https://example.com'), { runs: 1, silent: true });
    expect(result.field.lcp).toBeDefined();
    expect(result.field.fcp).toBeDefined();
    expect(result.lab.tti).toBeDefined();
  });

  test('a single failing run is dropped but the rest complete', async () => {
    let call = 0;
    const runner: Runner = async () => {
      call++;
      if (call === 2) throw new Error('spike');
      return { field: { lcp: 1800 }, lab: {} };
    };

    const wm = createWebmark({ runner, reporter: silentReporter });
    const result = await wm.measure(new URL('https://example.com'), { runs: 3, silent: true });
    expect(result.field.lcp?.values).toHaveLength(2);
  });

  test('all runs failing returns empty field and lab', async () => {
    const wm = createWebmark({ runner: failingRunner, reporter: silentReporter });
    const result = await wm.measure(new URL('https://example.com'), { runs: 3, silent: true });
    expect(result.field).toEqual({});
    expect(result.lab).toEqual({});
  });

  test('silent:true does not invoke any reporter hooks', async () => {
    const calls: string[] = [];
    const reporter: Reporter = {
      onMeasureStart: () => calls.push('onMeasureStart'),
      onRunStart: () => calls.push('onRunStart'),
      onRunEnd: () => calls.push('onRunEnd'),
      onMeasureEnd: () => calls.push('onMeasureEnd'),
    };

    const wm = createWebmark({
      runner: sampleRunner({ field: { lcp: 1800 }, lab: {} }),
      reporter,
    });
    await wm.measure(new URL('https://example.com'), { runs: 2, silent: true });
    expect(calls).toEqual([]);
  });

  test('result url matches the input url', async () => {
    const wm = createWebmark({
      runner: sampleRunner({ field: {}, lab: {} }),
      reporter: silentReporter,
    });
    const url = new URL('https://example.com/path');
    const result = await wm.measure(url, { silent: true });
    expect(result.url).toBe(url);
  });
});
