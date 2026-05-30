import { createWebmark, type Logger, type Webmark } from '@webmark/core';
import { cac } from 'cac';
import { CliError, parseRuns, parseUrl, reportError } from './errors';
import { reportResult } from './output';

const stderrLogger: Logger = {
  onRunStart(run, total, url) {
    process.stderr.write(`run ${run}/${total} — ${url.href}\n`);
  },
  onRunEnd(run, total) {
    process.stderr.write(`run ${run}/${total} done\n`);
  },
};

interface MeasureFlags {
  runs: number;
  json: boolean;
  silent: boolean;
}

export async function runMeasure(
  rawUrl: string,
  flags: MeasureFlags,
  webmark: Webmark,
): Promise<void> {
  const url = parseUrl(rawUrl);
  const runs = parseRuns(flags.runs);
  const result = await webmark.measure(url, { runs, silent: flags.silent });
  reportResult(result, flags.json);
}

// `argv` is the raw process.argv; cac drops the first two entries itself.
export async function main(argv: string[], version: string): Promise<number> {
  const cli = cac('webmark');

  cli
    .command('[url]', 'Measure a URL and report aggregated metrics')
    .option('-n, --runs <count>', 'Number of measurement runs', { default: 5 })
    .option('--json', 'Output machine-readable JSON instead of a table')
    .option('--silent', 'Suppress per-run progress on stderr')
    .example('webmark https://example.com')
    .example('webmark https://example.com --runs 10 --json')
    .action(async (url: string | undefined, flags: Record<string, unknown>) => {
      if (!url) {
        cli.outputHelp();
        throw new CliError('Missing URL.', {
          exitCode: 2,
          hint: 'Usage: webmark <url> [--runs <n>] [--json]',
        });
      }
      await runMeasure(
        url,
        {
          runs: Number(flags.runs),
          json: Boolean(flags.json),
          silent: Boolean(flags.silent),
        },
        createWebmark({ logger: stderrLogger }),
      );
    });

  cli.help();
  cli.version(version);

  try {
    cli.parse(argv, { run: false });
    if (cli.options.help || cli.options.version) return 0;
    await cli.runMatchedCommand();
    return 0;
  } catch (error) {
    return reportError(error);
  }
}
