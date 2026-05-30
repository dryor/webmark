# @webmarkjs/cli

Measure a URL's web performance from your terminal. Runs Lighthouse the specified number of times and reports the distribution (avg, σ, min, max, p75, p99) instead of a single noisy number.

## Install

Install globally to use `webmark` anywhere:

```bash
npm install -g @webmarkjs/cli
```

Or run once without installing:

```bash
npx @webmarkjs/cli https://example.com
```

## Requirements

- **Node.js 24+**
- **Chrome or Chromium** installed. webmark launches whatever Chrome it finds in headless mode.

If no Chrome is found, the command fails with a clear message:

```
error: Could not launch Chrome to run the measurement.
hint:  Install Chrome or Chromium, or point CHROME_PATH at an existing binary.
```

To use a specific browser:

```bash
CHROME_PATH=/usr/bin/chromium webmark https://example.com
```

## Usage

```
webmark <url> [options]
```

The scheme is optional — `webmark example.com` is treated as `https://example.com`.

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `-n, --runs <count>` | `5` | Number of measurement runs |
| `--json` | off | Output JSON instead of a table |
| `--silent` | off | Suppress per-run progress on stderr |
| `-h, --help` | | Show help |
| `-v, --version` | | Show version |

### Output

```
https://example.com/

metric  p50    sd     (min…max)     p75    p99
LCP     1.7s   210ms  (1.5s…2.3s)   1.9s   2.3s
FCP     1.1s   130ms  (900ms…1.3s)  1.2s   1.3s
CLS     0.021  0.012  (0.000…0.040) 0.031  0.040
TTI     2.0s   330ms  (1.7s…2.8s)   2.3s   2.8s
```

`p50` is the median — the midpoint of the distribution. Unlike the arithmetic mean it is not skewed by outliers (a single slow run caused by a CPU spike won't pull it up).

Color is shown only in an interactive terminal and is disabled by `NO_COLOR`, so piped or redirected output stays plain.

## Examples

Run more times for a tighter distribution:

```bash
webmark https://example.com --runs 10
```

Save results as JSON (measurements go to stdout, progress to stderr):

```bash
webmark https://example.com --json > result.json
```

Pipe into `jq`:

```bash
webmark https://example.com --json | jq '.field.lcp.p75'
```

Suppress progress output entirely:

```bash
webmark https://example.com --silent
```

Check the exit code in a script:

```bash
webmark https://example.com --silent || echo "measurement failed"
```

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Runtime error (e.g. invalid URL, Chrome not found) |
| `2` | Usage error (e.g. missing URL) |

## JSON output schema

```json
{
  "url": "https://example.com/",
  "field": {
    "lcp": { "p50": 1700, "min": 1500, "max": 2300, "p75": 1900, "p99": 2300, "sd": 210, "values": [...] },
    "fcp": { ... },
    "cls": { ... },
    "ttfb": { ... }
  },
  "lab": {
    "tbt": { ... },
    "tti": { ... },
    "si":  { ... }
  }
}
```

Time-based metrics are in milliseconds. CLS is a unitless score.

## License

MIT
