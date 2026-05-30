import type {
  FieldMetric,
  LabMetric,
  MeasureResult,
  MetricStats,
} from '@webmarkjs/core';

type Metric = FieldMetric | LabMetric;

const METRIC_UNIT: Record<Metric, 'ms' | 'score'> = {
  lcp: 'ms',
  fcp: 'ms',
  ttfb: 'ms',
  tbt: 'ms',
  tti: 'ms',
  si: 'ms',
  cls: 'score',
};

const METRIC_LABEL: Record<Metric, string> = {
  lcp: 'LCP',
  fcp: 'FCP',
  cls: 'CLS',
  ttfb: 'TTFB',
  tbt: 'TBT',
  tti: 'TTI',
  si: 'SI',
};

const FIELD_ORDER: FieldMetric[] = ['lcp', 'fcp', 'cls', 'ttfb'];
const LAB_ORDER: LabMetric[] = ['tbt', 'tti', 'si'];

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatScore(value: number): string {
  return value.toFixed(3);
}

export function formatValue(metric: Metric, value: number): string {
  return METRIC_UNIT[metric] === 'ms' ? formatMs(value) : formatScore(value);
}

export interface MetricRow {
  metric: string;
  avg: string;
  sd: string;
  range: string;
  p75: string;
  p99: string;
}

function toRow(metric: Metric, stats: MetricStats): MetricRow {
  const fmt = (v: number) => formatValue(metric, v);
  return {
    metric: METRIC_LABEL[metric],
    avg: fmt(stats.avg),
    sd: fmt(stats.sd),
    range: `${fmt(stats.min)}…${fmt(stats.max)}`,
    p75: fmt(stats.p75),
    p99: fmt(stats.p99),
  };
}

export function toRows(result: MeasureResult): MetricRow[] {
  const rows: MetricRow[] = [];
  for (const metric of FIELD_ORDER) {
    const stats = result.field[metric];
    if (stats) rows.push(toRow(metric, stats));
  }
  for (const metric of LAB_ORDER) {
    const stats = result.lab[metric];
    if (stats) rows.push(toRow(metric, stats));
  }
  return rows;
}
