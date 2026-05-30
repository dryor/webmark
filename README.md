# webmark

Synthetic web performance measurement focused on user-centric metrics.

A single run is a single data point — it can be skewed by a CPU spike, a network hiccup, or GC. webmark runs multiple times and computes **avg, min, max, p75, p99, σ, and histogram** over the results, giving you a distribution instead of a guess.

```
metric    avg      sd     (min … max)      p75      p99
LCP       1.8s    0.2s   (1.5s…2.3s)      1.9s     2.3s
FCP       1.1s    0.1s   (0.9s…1.3s)      1.2s     1.3s
CLS       0.02    0.01   (0.00…0.04)      0.03     0.04
TTI       2.1s    0.3s   (1.7s…2.8s)      2.3s     2.8s
```

## Packages

| Package | Description |
|---------|-------------|
| [`@webmarkjs/core`](./packages/core) | Core measurement primitives |
| [`@webmarkjs/cli`](./packages/cli) | Terminal interface |
| `@webmarkjs/ci` *(soon)* | GitHub Actions — comment results on PRs |
