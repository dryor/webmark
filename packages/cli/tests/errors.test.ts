import { describe, expect, rs, test } from '@rstest/core';
import { CliError, parseRuns, parseUrl, reportError } from '../src/errors';

describe('parseUrl', () => {
  test('accepts a full URL unchanged', () => {
    expect(parseUrl('https://example.com/path').href).toBe(
      'https://example.com/path',
    );
  });

  test('prepends https:// when the scheme is missing', () => {
    expect(parseUrl('example.com').href).toBe('https://example.com/');
  });

  test('throws a CliError with a hint on an unparseable input', () => {
    try {
      parseUrl('http://');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(CliError);
      expect((error as CliError).hint).toContain('webmark https://');
    }
  });
});

describe('parseRuns', () => {
  test('passes through a positive integer', () => {
    expect(parseRuns(10)).toBe(10);
  });

  test('rejects zero, negatives and non-integers', () => {
    for (const bad of [0, -3, 2.5]) {
      expect(() => parseRuns(bad)).toThrow(CliError);
    }
  });
});

describe('reportError', () => {
  test('writes message and hint to stderr and returns the exit code', () => {
    const writes: string[] = [];
    const spy = rs
      .spyOn(process.stderr, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        writes.push(String(chunk));
        return true;
      });

    const code = reportError(
      new CliError('boom', { exitCode: 2, hint: 'do this' }),
    );
    spy.mockRestore();

    expect(code).toBe(2);
    expect(writes.join('')).toContain('error: boom');
    expect(writes.join('')).toContain('hint:  do this');
  });

  test('maps unknown errors to exit code 1', () => {
    const spy = rs
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    expect(reportError(new Error('unexpected'))).toBe(1);
    spy.mockRestore();
  });

  test('turns a Chrome launch failure into an actionable message', () => {
    const writes: string[] = [];
    const spy = rs
      .spyOn(process.stderr, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        writes.push(String(chunk));
        return true;
      });

    const launchError = Object.assign(
      new Error('No Chrome installations found.'),
      {
        code: 'ERR_LAUNCHER_NOT_INSTALLED',
      },
    );
    const code = reportError(launchError);
    spy.mockRestore();

    expect(code).toBe(1);
    expect(writes.join('')).toContain('Could not launch Chrome');
    expect(writes.join('')).toContain('CHROME_PATH');
  });
});
