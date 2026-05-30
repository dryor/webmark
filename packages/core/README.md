# @webmarkjs/core

Core measurement primitives for webmark. Runs Lighthouse over a URL the specified number of times and returns statistical aggregates (avg, σ, min, max, p75, p99) for each metric.

Use this package if you want to build your own output layer — a custom reporter, a CI integration, or a dashboard — on top of the measurement engine. If you just want to measure from the terminal, use [`@webmarkjs/cli`](../cli) instead.

## Install

```bash
npm install @webmarkjs/core
```

`chrome-launcher` and `lighthouse` are peer dependencies — install them alongside:

```bash
npm install @webmarkjs/core chrome-launcher lighthouse
```

## Requirements

- **Node.js 24+**
- **Chrome or Chromium** installed. Set `CHROME_PATH` to point at a specific binary.

## Usage

```ts
import { createWebmark } from '@webmarkjs/core';

const webmark = createWebmark();
const result = await webmark.measure(new URL('https://example.com'), { runs: 5 });

console.log(result.field.lcp);
// {
//   avg: 1800,
//   min: 1500,
//   max: 2300,
//   p75: 1900,
//   p99: 2300,
//   sd: 210,
//   values: [...]
// }
```

Values are in milliseconds for time-based metrics and unitless scores for CLS.

## API

### `createWebmark(options?)`

Returns a `Webmark` instance.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `runner` | `Runner` | `lighthouseRunner` | Function that drives a single browser run |
| `reporter` | `Reporter` | `consoleReporter` | Hooks called during measurement progress |

### `webmark.measure(url, options?)`

Runs the URL the specified number of times and returns a `MeasureResult`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `runs` | `number` | `5` | Number of measurement runs |
| `silent` | `boolean` | `false` | Suppress the built-in reporter for this call |

### `MeasureResult`

```ts
interface MeasureResult {
  url: URL;
  field: Partial<Record<FieldMetric, MetricStats>>;
  lab:   Partial<Record<LabMetric,   MetricStats>>;
}
```

**Field metrics** (`FieldMetric`): `lcp`, `fcp`, `cls`, `ttfb`

**Lab metrics** (`LabMetric`): `tbt`, `tti`, `si`

Each present metric maps to a `MetricStats` object:

```ts
interface MetricStats {
  avg:    number;
  min:    number;
  max:    number;
  p75:    number;
  p99:    number;
  sd:     number;
  values: number[];  // raw per-run values
}
```

### Custom reporter

```ts
import { createWebmark, type Reporter } from '@webmarkjs/core';

const myReporter: Reporter = {
  onRunStart(run, total, url) {
    console.log(`starting run ${run}/${total}`);
  },
  onRunEnd(run, total) {
    console.log(`finished run ${run}/${total}`);
  },
  onError(run, error) {
    console.error(`run ${run} failed:`, error);
  },
  onMeasureEnd(result) {
    console.log('done', result);
  },
};

const webmark = createWebmark({ reporter: myReporter });
```

### Custom runner

Replace the Lighthouse runner entirely — useful for testing or alternate measurement strategies:

```ts
import { createWebmark, type Runner } from '@webmarkjs/core';

const myRunner: Runner = async (url) => ({
  field: { lcp: 1800, fcp: 1100 },
  lab:   { tti: 2100 },
});

const webmark = createWebmark({ runner: myRunner });
```

## Exported types

| Symbol | Description |
|--------|-------------|
| `Webmark` | The measurement instance interface |
| `MeasureResult` | Return value of `measure()` |
| `MeasureOptions` | Options passed to `measure()` |
| `MetricStats` | Per-metric statistics object |
| `FieldMetric` | Union of field metric keys |
| `LabMetric` | Union of lab metric keys |
| `Runner` | Single-run function signature |
| `RunSample` | Raw values returned by a runner |
| `Reporter` | Progress hook interface |
| `Aggregator` | Low-level accumulator (advanced use) |

## License

MIT
