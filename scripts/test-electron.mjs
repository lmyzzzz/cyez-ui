import assert from 'node:assert/strict'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { _electron, expect } from '@playwright/test'
const root = process.cwd()
await mkdir('artifacts/screenshots', { recursive: true })
const profile = await mkdtemp(path.join(root, 'artifacts/electron-profile-'))
const target = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve('apps/electron-template')
const packaged = target.endsWith('.exe')
const env = { ...process.env, SERIES_USER_DATA_DIR: profile }
delete env.ELECTRON_RUN_AS_NODE
const app = await _electron.launch({
  ...(packaged ? { executablePath: target, args: [] } : { args: [target] }),
  env,
  timeout: 45000
})
const errors = []
let exited = false
app.on('close', () => {
  exited = true
})
try {
  const page = await app.firstWindow()
  page.on('pageerror', (error) => errors.push(error.message))
  await expect(page.getByRole('heading', { name: '开始工作' })).toBeVisible()
  await expect(page.locator('[data-ui="startup"]')).toHaveCount(0)
  await expect(page.locator('#root')).toHaveJSProperty('inert', false)
  const security = await page.evaluate(() => ({
    require: typeof window.require,
    process: typeof window.process,
    capabilities: Object.keys(window.desktop.windowControls).sort()
  }))
  assert.equal(security.require, 'undefined')
  assert.equal(security.process, 'undefined')
  assert.deepEqual(security.capabilities, [
    'close',
    'getMaximized',
    'minimize',
    'onMaximizedChange',
    'toggleMaximize'
  ])
  const prefs = await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0]
    const preferences = window.webContents.getLastWebPreferences()
    return {
      sandbox: preferences.sandbox,
      contextIsolation: preferences.contextIsolation,
      nodeIntegration: preferences.nodeIntegration,
      resizable: window.isResizable()
    }
  })
  assert.deepEqual(prefs, {
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
    resizable: true
  })
  await page.getByRole('button', { name: '最大化', exact: true }).click()
  await expect
    .poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMaximized()))
    .toBe(true)
  await expect(page.getByRole('button', { name: '还原', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '还原', exact: true }).click()
  await expect
    .poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMaximized()))
    .toBe(false)
  await page.getByRole('button', { name: '最小化', exact: true }).click()
  await expect
    .poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMinimized()))
    .toBe(true)
  await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0]
    window.restore()
    window.show()
  })
  await page.getByRole('link', { name: '设置', exact: true }).click()
  await page.getByRole('combobox', { name: '明暗模式' }).selectOption('dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('heading', { name: '开始工作' })).toBeVisible()
  await page.getByRole('button', { name: '示例操作', exact: true }).click()
  await expect(page.getByText('示例操作已完成', { exact: true })).toBeVisible()
  await page.screenshot({
    path: 'artifacts/screenshots/electron' + (packaged ? '-packaged' : '') + '.png',
    animations: 'disabled'
  })
  assert.deepEqual(errors, [])
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await expect.poll(() => exited).toBe(true)
  const result = {
    passed: true,
    packaged,
    security,
    preferences: prefs,
    checks: [
      'launch',
      'sandbox',
      'finite-preload',
      'maximize',
      'restore',
      'minimize',
      'theme-persistence',
      'toast',
      'close'
    ],
    errors
  }
  await writeFile(
    'artifacts/electron' + (packaged ? '-packaged' : '') + '-results.json',
    JSON.stringify(result, null, 2)
  )
  console.log(JSON.stringify(result, null, 2))
} finally {
  if (!exited) await app.close()
}
