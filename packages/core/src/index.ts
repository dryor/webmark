import { computeStats } from './stats';
import { lighthouseRunner } from './runner';
import { consoleLogger } from './logger';
import type { Runner } from './runner';
import type { Logger } from './logger';
import type {
  FieldMetric,
  LabMetric,
  MeasureOptions,
  MeasureResult,
  MetricStats,
  Webmark,
} from './types';

export type { Runner, RunSample } from './runner';
export type { Logger } from './logger';
export { consoleLogger } from './logger';
export type {
  FieldMetric,
  LabMetric,
  MeasureOptions,
  MeasureResult,
  MetricStats,
  Webmark,
} from './types';

interface WebmarkOptions {
  runner?: Runner;
  logger?: Logger;
}

export function createWebmark({
  runner = lighthouseRunner,
  logger = consoleLogger,
}: WebmarkOptions = {}): Webmark {
  return {
    async measure(
      url: URL,
      { runs = 5, silent = false }: MeasureOptions = {},
    ): Promise<MeasureResult> {
      const field: Record<FieldMetric, number[]> = {
        lcp: [],
        fcp: [],
        cls: [],
        ttfb: [],
      };
      const lab: Record<LabMetric, number[]> = { tbt: [], tti: [], si: [] };

      for (let i = 0; i < runs; i++) {
        if (!silent) logger.onRunStart(i + 1, runs, url);
        const sample = await runner(url);
        if (!silent) logger.onRunEnd(i + 1, runs);

        for (const [metric, value] of Object.entries(sample.field) as [
          FieldMetric,
          number,
        ][]) {
          field[metric].push(value);
        }

        for (const [metric, value] of Object.entries(sample.lab) as [
          LabMetric,
          number,
        ][]) {
          lab[metric].push(value);
        }
      }

      return {
        url,
        field: Object.fromEntries(
          Object.entries(field)
            .filter(([, values]) => values.length > 0)
            .map(([metric, values]) => [metric, computeStats(values)]),
        ) as MeasureResult['field'],
        lab: Object.fromEntries(
          Object.entries(lab)
            .filter(([, values]) => values.length > 0)
            .map(([metric, values]) => [metric, computeStats(values)]),
        ) as MeasureResult['lab'],
      };
    },
  };
}
