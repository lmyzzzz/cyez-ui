import { test, expect } from '@playwright/test'
import { mkdirSync } from 'node:fs'
mkdirSync('artifacts/screenshots', { recursive: true })
for (const brand of ['teal', 'violet'])
  for (const theme of ['light', 'dark']) {
    test(brand + ' / ' + theme + ' uses CSS theme across pages and portals', async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('/')
      await page.getByRole('combobox', { name: '品牌主题' }).selectOption(brand)
      await page.getByRole('link', { name: '外观设置' }).click()
      await page.getByRole('combobox', { name: '明暗模式' }).selectOption(theme)
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      await page.getByRole('link', { name: '概览', exact: true }).click()
      await expect(page.getByRole('heading', { name: '工作概览' })).toBeVisible()
      await page.screenshot({
        path: 'artifacts/screenshots/' + brand + '-' + theme + '.png',
        animations: 'disabled'
      })
      const expectedAccent =
        brand === 'teal'
          ? theme === 'dark'
            ? 'rgb(85, 184, 172)'
            : 'rgb(8, 124, 114)'
          : theme === 'dark'
            ? 'rgb(177, 166, 255)'
            : 'rgb(81, 70, 206)'
      await expect(page.getByRole('button', { name: '新建项目', exact: true })).toHaveCSS(
        'background-color',
        expectedAccent
      )
      await page.getByRole('button', { name: '新建项目', exact: true }).click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await page.getByLabel('项目名称', { exact: true }).fill('主题验证')
      await expect(dialog.getByRole('button', { name: '创建项目' })).toHaveCSS(
        'background-color',
        expectedAccent
      )
      await dialog.getByRole('button', { name: '取消', exact: true }).click()
      await page.getByRole('link', { name: '组件', exact: true }).click()
      await expect(page.locator('[data-ui="banner"][data-tone="success"]')).toHaveCSS(
        'color',
        theme === 'dark' ? 'rgb(116, 198, 157)' : 'rgb(8, 124, 80)'
      )
      await page.screenshot({
        path: 'artifacts/screenshots/' + brand + '-' + theme + '-components.png',
        animations: 'disabled'
      })
      expect(errors).toEqual([])
      expect(await page.evaluate(() => 'desktop' in window || 'require' in window)).toBe(false)
    })
  }
test('modal focus, keyboard menu, sidebar, form and split interactions', async ({ page }) => {
  await page.goto('/')
  const create = page.getByRole('button', { name: '新建项目', exact: true })
  await create.click()
  await page.getByLabel('项目名称', { exact: true }).fill('键盘验收项目')
  await page.getByRole('button', { name: '创建项目', exact: true }).click()
  await expect(page.getByRole('cell', { name: '键盘验收项目', exact: true })).toBeVisible()
  await expect(create).toBeFocused()
  await page.getByRole('button', { name: '收起侧边栏' }).click()
  await expect(page.locator('[data-ui="sidebar"]')).toHaveAttribute('data-collapsed', 'true')
  await page.getByRole('link', { name: '组件', exact: true }).click()
  const menu = page.getByRole('button', { name: '更多操作' })
  await menu.focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitem', { name: '复制' })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitem', { name: '删除' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await page.getByRole('button', { name: '删除示例' }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.getByRole('button', { name: '取消', exact: true }).click()
  const split = page.getByRole('separator', { name: '调整示例分栏' })
  await split.focus()
  const before = Number(await split.getAttribute('aria-valuenow'))
  await page.keyboard.press('ArrowRight')
  expect(Number(await split.getAttribute('aria-valuenow'))).toBeGreaterThan(before)
  const toggle = page.getByRole('switch', { name: '启用提醒' })
  await toggle.uncheck()
  await expect(toggle).not.toBeChecked()
})
test('system theme, preference persistence, reduced motion and public CSS overrides', async ({
  page
}) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce')
  await expect(page.locator('[data-ui="page"]')).toHaveCSS('animation-duration', '0s')
  await page.getByRole('link', { name: '外观设置' }).click()
  await page.getByRole('combobox', { name: '明暗模式' }).selectOption('light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.addStyleTag({
    content:
      "@layer app-overrides { :root { --color-accent: #a32273; } [data-ui='button'][data-variant='primary'] { border-radius: 20px; } }"
  })
  const button = page.getByRole('button', { name: '新建项目', exact: true })
  await expect(button).toHaveCSS('background-color', 'rgb(163, 34, 115)')
  await expect(button).toHaveCSS('border-radius', '20px')
})
test('minimum desktop viewport remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 560 })
  await page.goto('/')
  await page.getByRole('link', { name: '外观设置' }).click()
  await expect(page.getByRole('combobox', { name: '明暗模式' })).toBeInViewport()
  await page.screenshot({
    path: 'artifacts/screenshots/narrow-settings.png',
    animations: 'disabled'
  })
  const size = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }))
  expect(size.scroll).toBeLessThanOrEqual(size.width)
})

test('restores dark appearance before the application module is available', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'series:showcase:appearance',
      JSON.stringify({ theme: 'dark', motion: 'reduce' })
    )
  )
  await page.route('**/assets/*.js', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce')
})

test('explicit full motion overrides the system preference consistently', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('link', { name: '外观设置' }).click()
  await page.getByRole('combobox', { name: '动态效果' }).selectOption('full')
  await page.getByRole('link', { name: '组件', exact: true }).click()
  await expect(page.locator('[data-ui="task-progress"] [data-status="running"] > svg')).toHaveCSS('animation-duration', '0.9s')
})
