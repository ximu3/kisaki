import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: 'esm',
  clean: true,
  banner: '#!/usr/bin/env node'
})
