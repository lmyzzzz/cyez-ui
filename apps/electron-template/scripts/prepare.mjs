import { createRequire } from 'node:module'
import { mkdir, copyFile } from 'node:fs/promises'
const require = createRequire(import.meta.url)
await mkdir('src/renderer/public', { recursive: true })
await copyFile(require.resolve('@series/ui/appearance-init.js'), 'src/renderer/public/appearance-init.js')
