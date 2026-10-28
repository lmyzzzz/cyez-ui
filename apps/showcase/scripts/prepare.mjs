import { createRequire } from 'node:module'
import { mkdir, copyFile } from 'node:fs/promises'
const require = createRequire(import.meta.url)
await mkdir('public', { recursive: true })
await copyFile(require.resolve('@series/ui/appearance-init.js'), 'public/appearance-init.js')
