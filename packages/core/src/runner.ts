import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import type { FieldMetric, LabMetric } from './types';

export interface RunSample {
  field: Partial<Record<FieldMetric, number>>;
  lab: Partial<Record<LabMetric, number>>;
}

export type Runner = (url: URL) => Promise<RunSample>;

const FIELD_AUDIT_KEYS: Record<FieldMetric, string> = {
  lcp: 'largest-contentful-paint',
  fcp: 'first-contentful-paint',
  cls: 'cumulative-layout-shift',
  ttfb: 'time-to-first-byte',
};

const LAB_AUDIT_KEYS: Record<LabMetric, string> = {
  tbt: 'total-blocking-time',
  tti: 'interactive',
  si: 'speed-index',
};

export const lighthouseRunner: Runner = async (url) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  try {
    const result = await lighthouse(url.toString(), {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
    });

    const audits = result?.lhr?.audits;
    if (!audits) return { field: {}, lab: {} };

    const field: Partial<Record<FieldMetric, number>> = {};
    const lab: Partial<Record<LabMetric, number>> = {};

    for (const [metric, key] of Object.entries(FIELD_AUDIT_KEYS) as [
      FieldMetric,
      string,
    ][]) {
      const value = audits[key]?.numericValue;
      if (value != null) field[metric] = value;
    }

    for (const [metric, key] of Object.entries(LAB_AUDIT_KEYS) as [
      LabMetric,
      string,
    ][]) {
      const value = audits[key]?.numericValue;
      if (value != null) lab[metric] = value;
    }

    return { field, lab };
  } finally {
    await chrome.kill();
  }
};
