export interface Logger {
  onRunStart(run: number, total: number, url: URL): void
  onRunEnd(run: number, total: number): void
}

export const consoleLogger: Logger = {
  onRunStart(run, total, url) {
    process.stdout.write(`[webmark] run ${run}/${total} — ${url.href}\n`)
  },
  onRunEnd(run, total) {
    process.stdout.write(`[webmark] run ${run}/${total} done\n`)
  },
}

