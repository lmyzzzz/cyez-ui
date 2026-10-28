import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export function runPackageManager(args, cwd) {
  const cli = process.env.npm_execpath
  if (!cli)
    throw new Error('Run this script through pnpm run so the package-manager CLI is available.')
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    stdio: 'inherit',
    env: process.env
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error('Package manager failed: ' + args.join(' '))
}
export async function createApp(destination) {
  const target = path.resolve(destination)
  try {
    await fs.access(target)
    throw new Error('Destination already exists: ' + target)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  for (const packageName of ['ui', 'electron'])
    await fs.access(path.join(root, 'packages', packageName, 'dist'))
  const packDir = path.join(root, 'artifacts/packages')
  await fs.mkdir(packDir, { recursive: true })
  for (const packageName of ['ui', 'electron'])
    runPackageManager(
      ['pack', '--pack-destination', packDir],
      path.join(root, 'packages', packageName)
    )
  const template = path.join(root, 'apps/electron-template')
  await fs.mkdir(target, { recursive: true })
  for (const file of [
    'src',
    'scripts',
    'resources',
    'app.config.json',
    'electron.vite.config.ts',
    'vite.browser.config.ts',
    'electron-builder.cjs',
    'package.json',
    'tsconfig.json',
    'README.md'
  ]) {
    await fs.cp(path.join(template, file), path.join(target, file), { recursive: true })
  }
  await fs.copyFile(path.join(root, 'LICENSE'), path.join(target, 'LICENSE'))
  await fs.copyFile(path.join(root, 'NOTICE.md'), path.join(target, 'NOTICE.md'))
  await fs.mkdir(path.join(target, 'vendor'))
  const manifest = JSON.parse(await fs.readFile(path.join(target, 'package.json'), 'utf8'))
  for (const name of ['ui', 'electron']) {
    const sourceManifest = JSON.parse(
      await fs.readFile(path.join(root, 'packages', name, 'package.json'), 'utf8')
    )
    const archive =
      sourceManifest.name.replace(/^@/, '').replace('/', '-') +
      '-' +
      sourceManifest.version +
      '.tgz'
    await fs.copyFile(path.join(packDir, archive), path.join(target, 'vendor', archive))
    manifest.dependencies['@series/' + name] = 'file:vendor/' + archive
  }
  manifest.packageManager = 'pnpm@10.33.0'
  await fs.writeFile(path.join(target, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  await fs.writeFile(
    path.join(target, 'pnpm-workspace.yaml'),
    'onlyBuiltDependencies:\n  - electron\n  - esbuild\n'
  )
  await fs.writeFile(
    path.join(target, '.gitignore'),
    'node_modules/\nout/\nrelease/\nbrowser-dist/\n'
  )
  return target
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const destination = process.argv.slice(2).filter((value) => value !== '--')[0]
  if (!destination) throw new Error('Usage: pnpm run create:app -- <new-directory>')
  console.log('Created independent application:', await createApp(destination))
}
