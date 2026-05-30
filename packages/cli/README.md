# @webmark/cli

Measure a URL's performance from your terminal. Runs [Lighthouse](https://github.com/GoogleChrome/lighthouse)
several times and reports the distribution (avg, σ, min/max, p75, p99) instead
of a single noisy number.

## Install

```bash
npm install -g @webmark/cli
```

Or run it once without installing:

```bash
npx @webmark/cli https://example.com
```

## Usage

```bash
webmark <url> [options]
```

```
https://example.com/

metric  avg    sd     (min…max)     p75    p99
LCP     1.8s   210ms  (1.5s…2.3s)   1.9s   2.3s
FCP     1.1s   130ms  (900ms…1.3s)  1.2s   1.3s
CLS     0.022  0.012  (0.000…0.040) 0.031  0.040
TTI     2.1s   330ms  (1.7s…2.8s)   2.3s   2.8s
```

The scheme is optional — `webmark example.com` is measured as
`https://example.com`.

## Options

| Option               | Default | Description                            |
| -------------------- | ------- | -------------------------------------- |
| `-n, --runs <count>` | `5`     | Number of measurement runs             |
| `--json`             | off     | Output JSON instead of a table         |
| `--silent`           | off     | Hide per-run progress                  |
| `-h, --help`         |         | Show help                              |
| `-v, --version`      |         | Show version                           |

## Examples

Measure with more runs for a tighter distribution:

```bash
webmark https://example.com --runs 10
```

Save machine-readable results (data goes to stdout, progress to stderr):

```bash
webmark https://example.com --json > result.json
```

Pipe into `jq`:

```bash
webmark https://example.com --json | jq '.field.lcp.p75'
```

Use in a script and check the exit code:

```bash
webmark https://example.com --silent || echo "measurement failed"
```

| Exit code | Meaning                          |
| --------- | -------------------------------- |
| `0`       | Success                          |
| `1`       | Runtime error (e.g. invalid URL) |
| `2`       | Usage error (e.g. missing URL)   |

Color is shown only in an interactive terminal and is disabled by `NO_COLOR`,
so piped or redirected output stays plain.

## Requirements

- **Node.js 18+**
- **Chrome or Chromium installed.** Lighthouse and chrome-launcher ship with
  the CLI, but the browser itself does not — webmark launches whatever Chrome
  it finds on your machine in headless mode.

If no Chrome is found, the command fails with a clear message:

```
error: Could not launch Chrome to run the measurement.
hint:  Install Chrome or Chromium, or point CHROME_PATH at an existing binary.
```

To use a specific browser, set `CHROME_PATH`:

```bash
CHROME_PATH=/usr/bin/chromium webmark https://example.com
```
