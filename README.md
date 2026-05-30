# webmark

Synthetic web performance measurement focused on user-centric metrics.

A single Lighthouse run is a single data point — it can be skewed by a CPU spike, a network hiccup, or GC. webmark runs multiple times and reports the **distribution** (avg, σ, min, max, p75, p99) instead of a single noisy number.

```
https://example.com/

metric  avg    sd     (min…max)     p75    p99
LCP     1.8s   210ms  (1.5s…2.3s)   1.9s   2.3s
FCP     1.1s   130ms  (900ms…1.3s)  1.2s   1.3s
CLS     0.022  0.012  (0.000…0.040) 0.031  0.040
TTI     2.1s   330ms  (1.7s…2.8s)   2.3s   2.8s
```

## Quick start

```bash
npx @webmarkjs/cli https://example.com
```

That's it. webmark launches Chrome headlessly, runs Lighthouse 5 times, and prints the table above.

## Packages

| Package | Description |
|---------|-------------|
| [`@webmarkjs/core`](./packages/core) | Core measurement primitives — programmatic API |
| [`@webmarkjs/cli`](./packages/cli) | `webmark` CLI — terminal interface |
| `@webmarkjs/ci` *(coming soon)* | GitHub Actions — comment results on pull requests |

## Requirements

- **Node.js 24+**
- **Chrome or Chromium** installed locally. webmark launches whatever Chrome it finds in headless mode. To use a specific binary, set `CHROME_PATH`.

## Contributing

```bash
# Clone and install
git clone https://github.com/your-org/web-mark.git
cd web-mark
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

See [`DEPLOY.md`](./DEPLOY.md) for how versioning and publishing to npm work.

## License

MIT
