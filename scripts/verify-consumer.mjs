import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createApp, runPackageManager } from './create-app.mjs'
const work = process.env.SERIES_WORK_DIR
  ? path.resolve(process.env.SERIES_WORK_DIR)
  : path.resolve('../../work')
await fs.mkdir(work, { recursive: true })
const destination = path.join(work, 'series-consumer-' + Date.now())
const target = await createApp(destination)
runPackageManager(['install'], target)
const appRequire = createRequire(path.join(target, 'package.json'))
const uiRequire = createRequire(path.join(target, 'node_modules/@series/ui/package.json'))
if (
  (await fs.realpath(appRequire.resolve('react'))) !==
  (await fs.realpath(uiRequire.resolve('react')))
) {
  throw new Error('Consumer and UI resolve different React copies')
}
runPackageManager(['run', 'typecheck'], target)
runPackageManager(['run', 'build'], target)
const uiManifest = JSON.parse(
  await fs.readFile(path.join(target, 'node_modules/@series/ui/package.json'), 'utf8')
)
const adapterManifest = JSON.parse(
  await fs.readFile(path.join(target, 'node_modules/@series/electron/package.json'), 'utf8')
)
if (JSON.stringify([uiManifest, adapterManifest]).includes('workspace:'))
  throw new Error('Packed manifest leaks workspace protocol')
const preload = await fs.readFile(path.join(target, 'out/preload/index.cjs'), 'utf8')
if (/ipcMain|BrowserWindow/.test(preload)) throw new Error('Preload includes main-only code')
const rendererFiles = await fs.readdir(path.join(target, 'out/renderer/assets'))
for (const filename of rendererFiles.filter((file) => file.endsWith('.js'))) {
  const source = await fs.readFile(path.join(target, 'out/renderer/assets', filename), 'utf8')
  if (/@ls101\//.test(source)) throw new Error('Renderer retains a legacy workspace dependency')
}
await fs.writeFile(
  'artifacts/consumer-results.json',
  JSON.stringify(
    {
      passed: true,
      path: target,
      checks: [
        'packed-install',
        'single-react-instance',
        'independent-typecheck',
        'independent-electron-build',
        'no-workspace-protocol',
        'no-main-code-in-preload',
        'no-legacy-renderer-imports'
      ]
    },
    null,
    2
  )
)
console.log('Independent consumer verified:', target)
