export class CliError extends Error {
  readonly exitCode: number;
  readonly hint?: string;

  constructor(
    message: string,
    options: { exitCode?: number; hint?: string } = {},
  ) {
    super(message);
    this.name = 'CliError';
    this.exitCode = options.exitCode ?? 1;
    this.hint = options.hint;
  }
}

export function parseUrl(input: string): URL {
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    return new URL(candidate);
  } catch {
    throw new CliError(`"${input}" is not a valid URL.`, {
      hint: 'Pass a full address, e.g. webmark https://example.com',
    });
  }
}

export function parseRuns(input: number): number {
  if (!Number.isInteger(input) || input < 1) {
    throw new CliError(`--runs must be a positive integer, got "${input}".`, {
      hint: 'Try a value like --runs 5',
    });
  }
  return input;
}

const CHROME_LAUNCH_CODES = new Set([
  'ERR_LAUNCHER_NOT_INSTALLED',
  'ERR_LAUNCHER_PATH_NOT_SET',
  'ERR_LAUNCHER_UNSUPPORTED_PLATFORM',
]);

function asCliError(error: unknown): CliError {
  if (error instanceof CliError) return error;

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : undefined;

  if (code && CHROME_LAUNCH_CODES.has(code)) {
    return new CliError('Could not launch Chrome to run the measurement.', {
      hint: 'Install Chrome or Chromium, or point CHROME_PATH at an existing binary.',
    });
  }

  const message = error instanceof Error ? error.message : String(error);
  return new CliError(message);
}

export function reportError(error: unknown): number {
  const cliError = asCliError(error);
  process.stderr.write(`error: ${cliError.message}\n`);
  if (cliError.hint) process.stderr.write(`hint:  ${cliError.hint}\n`);
  return cliError.exitCode;
}
