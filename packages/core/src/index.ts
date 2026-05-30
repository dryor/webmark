import { createAggregator } from './aggregator';
import { lighthouseRunner } from './runner';
import { consoleReporter, noopReporter } from './reporter';
import type { Runner } from './runner';
import type { Reporter } from './reporter';
import type {
  FieldMetric,
  LabMetric,
  MeasureOptions,
  MeasureResult,
  Webmark,
} from './types';

export { createAggregator } from './aggregator';
export type { Aggregator } from './aggregator';
export type { Runner, RunSample } from './runner';
export type { Reporter } from './reporter';
export { consoleReporter } from './reporter';
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
  reporter?: Reporter;
}

export function createWebmark({
  runner = lighthouseRunner,
  reporter = consoleReporter,
}: WebmarkOptions = {}): Webmark {
  return {
    async measure(
      url: URL,
      { runs = 5, silent = false }: MeasureOptions = {},
    ): Promise<MeasureResult> {
      const emit = silent ? noopReporter : reporter;
      const field = createAggregator<FieldMetric>();
      const lab = createAggregator<LabMetric>();

      emit.onMeasureStart?.(url, runs);

      for (let i = 0; i < runs; i++) {
        const run = i + 1;
        emit.onRunStart?.(run, runs, url);
        try {
          const sample = await runner(url);
          field.add(sample.field);
          lab.add(sample.lab);
          emit.onRunEnd?.(run, runs);
        } catch (error) {
          // A failed run (CPU spike, timeout) drops its sample but doesn't sink the batch.
          emit.onError?.(run, error);
        }
      }

      const result: MeasureResult = {
        url,
        field: field.collect(),
        lab: lab.collect(),
      };

      emit.onMeasureEnd?.(result);
      return result;
    },
  };
}


