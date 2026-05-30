import { createRequire } from 'node:module';
import { defineConfig } from '@rslib/core';

const require = createRequire(import.meta.url);
const { version } = require('./package.json') as { version: string };

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: false,
      banner: { js: '#!/usr/bin/env node' },
      autoExternal: true,
    },
  ],
  source: {
    define: {
      __VERSION__: JSON.stringify(version),
    },
  },
});
