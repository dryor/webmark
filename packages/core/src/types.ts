export type FieldMetric = 'lcp' | 'fcp' | 'cls' | 'ttfb';
export type LabMetric = 'tbt' | 'tti' | 'si';

export interface MetricStats {
  avg: number;
  min: number;
  max: number;
  p75: number;
  p99: number;
  sd: number;
  values: number[];
}

export interface MeasureResult {
  url: URL;
  field: Partial<Record<FieldMetric, MetricStats>>;
  lab: Partial<Record<LabMetric, MetricStats>>;
}

export interface MeasureOptions {
  runs?: number;
  silent?: boolean;
}

export interface Webmark {
  measure(url: URL, options?: MeasureOptions): Promise<MeasureResult>;
}
