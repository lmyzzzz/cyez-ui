import { build } from 'esbuild'
const options = { bundle: true, platform: 'node', target: 'node22', external: ['electron'], sourcemap: true }
await build({ ...options, entryPoints: ['src/main.ts','src/preload.ts','src/shared.ts'], outdir: 'dist', format: 'esm' })
await build({ ...options, entryPoints: ['src/preload.ts'], outfile: 'dist/preload.cjs', format: 'cjs' })
