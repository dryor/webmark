import type { MeasureResult } from './types';

export interface Reporter {
  onMeasureStart?(url: URL, runs: number): void;
  onRunStart?(run: number, total: number, url: URL): void;
  onRunEnd?(run: number, total: number): void;
  onError?(run: number, error: unknown): void;
  onMeasureEnd?(result: MeasureResult): void;
}

export const consoleReporter: Reporter = {
  onRunStart(run, total, url) {
    process.stdout.write(`[webmark] run ${run}/${total} — ${url.href}\n`);
  },
  onRunEnd(run, total) {
    process.stdout.write(`[webmark] run ${run}/${total} done\n`);
  },
};

export const noopReporter: Reporter = {};
