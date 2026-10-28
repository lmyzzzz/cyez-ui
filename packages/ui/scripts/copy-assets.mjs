import { copyFileSync } from 'node:fs';
copyFileSync('src/styles/app.css', 'dist/app.css');

import { build } from 'esbuild';
await build({ entryPoints: ['src/theme/early-appearance.ts'], outfile: 'dist/appearance-init.js', bundle: true, platform: 'browser', format: 'iife', minify: true });
