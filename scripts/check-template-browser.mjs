import assert from 'node:assert/strict'
import { chromium, expect } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('http://127.0.0.1:4174')
  await expect(page.getByRole('heading', { name: '开始工作' })).toBeVisible()
  await expect(page.getByText('浏览器预览', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '最小化', exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: '设置', exact: true }).click()
  await page.getByRole('combobox', { name: '明暗模式' }).selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.screenshot({ path: 'artifacts/screenshots/template-browser.png' })
  assert.deepEqual(errors, [])
  await writeFile(
    'artifacts/template-browser-results.json',
    JSON.stringify(
      {
        passed: true,
        checks: ['no-electron-global', 'hidden-native-controls', 'navigation', 'theme'],
        errors
      },
      null,
      2
    )
  )
  console.log('Template browser preview passed.')
} finally {
  await browser.close()
}
