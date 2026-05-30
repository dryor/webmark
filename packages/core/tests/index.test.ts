import { expect, test } from '@rstest/core'
import { createWebmark } from '../src/index'
import type { MetricStats } from '../src/types'

function fmt(metric: string, value: number): string {
  if (metric === 'cls') return value.toFixed(2)
  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`
}

function printTable(results: Record<string, MetricStats | undefined>) {
  const rows = Object.entries(results).filter(([, s]) => s != null) as [string, MetricStats][]

  const header = ['metric', 'p50', 'sd', '(min … max)', 'p75', 'p99']
  const lines = rows.map(([metric, s]) => [
    metric.toUpperCase(),
    fmt(metric, s.p50),
    fmt(metric, s.sd),
    `(${fmt(metric, s.min)}…${fmt(metric, s.max)})`,
    fmt(metric, s.p75),
    fmt(metric, s.p99),
  ])

  const cols = header.map((_, i) => Math.max(header[i].length, ...lines.map((r) => r[i].length)))

  const pad = (s: string, i: number) => s.padEnd(cols[i])
  console.log('\n' + [header, ...lines].map((r) => r.map(pad).join('    ').trimEnd()).join('\n') + '\n')
}

function expectMetrics(result: Awaited<ReturnType<ReturnType<typeof createWebmark>['measure']>>) {
  expect(result.field.lcp).toBeDefined()
  expect(result.field.fcp).toBeDefined()
  expect(result.field.cls).toBeDefined()
  expect(result.lab.tti).toBeDefined()
  expect(result.lab.si).toBeDefined()
}

test.skip('measure qwik-app', async () => {
  const wm = createWebmark()
  const result = await wm.measure(new URL('https://qwik-app.heud6174.workers.dev/'), { runs: 5 })

  printTable({
    lcp: result.field.lcp,
    fcp: result.field.fcp,
    cls: result.field.cls,
    ttfb: result.field.ttfb,
    tbt: result.lab.tbt,
    tti: result.lab.tti,
    si: result.lab.si,
  })

  expectMetrics(result)
}, { timeout: 300_000 })
