import type { MeasureResult } from '@webmarkjs/core';
import pc from 'picocolors';
import { type MetricRow, toRows } from './format';

const COLUMNS = [
  { key: 'metric', header: 'metric' },
  { key: 'p50', header: 'p50' },
  { key: 'sd', header: 'sd' },
  { key: 'range', header: '(min…max)' },
  { key: 'p75', header: 'p75' },
  { key: 'p99', header: 'p99' },
] as const satisfies ReadonlyArray<{ key: keyof MetricRow; header: string }>;

const GAP = '  ';

function renderTable(rows: MetricRow[]): string {
  const widths = COLUMNS.map(({ key, header }) =>
    rows.reduce((max, row) => Math.max(max, row[key].length), header.length),
  );

  const pad = (text: string, width: number, align: 'left' | 'right') =>
    align === 'left' ? text.padEnd(width) : text.padStart(width);

  const headerLine = COLUMNS.map(({ header }, i) =>
    pad(
      pc.dim(header),
      widths[i] + (pc.dim(header).length - header.length),
      'left',
    ),
  )
    .join(GAP)
    .trimEnd();

  const bodyLines = rows.map((row) =>
    COLUMNS.map(({ key }, i) => {
      const value = row[key];
      const colored = key === 'metric' ? pc.cyan(value) : value;
      const padding = colored.length - value.length;
      return pad(
        colored,
        widths[i] + padding,
        key === 'metric' ? 'left' : 'right',
      );
    })
      .join(GAP)
      .trimEnd(),
  );

  return [headerLine, ...bodyLines].join('\n');
}

export function reportResult(result: MeasureResult, asJson: boolean): void {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(serialize(result), null, 2)}\n`);
    return;
  }

  const rows = toRows(result);
  if (rows.length === 0) {
    process.stdout.write('No metrics were collected.\n');
    return;
  }
  process.stdout.write(`${pc.bold(result.url.href)}\n\n${renderTable(rows)}\n`);
}

function serialize(result: MeasureResult) {
  return { url: result.url.href, field: result.field, lab: result.lab };
}
