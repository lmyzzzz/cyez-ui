import { test, expect } from '@playwright/test'

test('startup uses the selected brand and CSS animation while the application loads', async ({
  page
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('series:showcase:brand', 'violet')
    localStorage.setItem(
      'series:showcase:appearance',
      JSON.stringify({ theme: 'dark', motion: 'full' })
    )
  })
  let release!: () => void
  const loading = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/assets/main-*.js', async (route) => {
    await loading
    await route.continue()
  })
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const startup = page.locator('[data-ui="startup"]')
    await expect(startup).toHaveAttribute('data-state', 'loading')
    await expect(startup.locator('h1')).toHaveText('星序工作台')
    await expect(startup.locator('[data-part="icon"]')).toBeVisible()
    await expect(startup.locator('[data-part="mark"]')).toHaveCSS('animation-duration', '0.42s')
    await expect(startup).toHaveCSS('background-color', 'rgb(21, 25, 24)')
    await expect(page.locator('#root')).toHaveJSProperty('inert', true)
    // Freeze the entry at its final position for the visual record; loading is still pending.
    await page.screenshot({
      path: 'artifacts/screenshots/startup-violet-dark.png',
      animations: 'disabled'
    })
    await page.addStyleTag({
      content: "@layer app-overrides { [data-ui='startup'] { --startup-exit-duration: 600ms; } }"
    })
    release()
    await expect(startup).toHaveAttribute('data-state', 'leaving')
    // React has already committed; input remains blocked until the visual handoff completes.
    await expect(page.locator('#root h1')).toHaveText('工作概览')
    await expect(page.locator('#root')).toHaveJSProperty('inert', true)
    await expect(startup).toHaveCount(0)
    await expect(page.locator('#root')).toHaveJSProperty('inert', false)
    await page.getByRole('button', { name: '新建项目', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  } finally {
    release()
  }
})

test('reduced motion removes startup movement and still completes the handoff', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let release!: () => void
  const loading = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/assets/main-*.js', async (route) => {
    await loading
    await route.continue()
  })
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const startup = page.locator('[data-ui="startup"]')
    await expect(startup.locator('[data-part="mark"]')).toHaveCSS('animation-duration', '0s')
    await expect(startup.locator('h1')).toHaveCSS('animation-delay', '0s')
    expect(
      await startup
        .locator('[data-part="progress"]')
        .evaluate((element) => getComputedStyle(element, '::after').animationDuration)
    ).toBe('0s')
    release()
    await expect(startup).toHaveCount(0)
    await expect(page.locator('#root')).toHaveJSProperty('inert', false)
    await expect(page.getByRole('heading', { name: '工作概览' })).toBeVisible()
  } finally {
    release()
  }
})

test('a failed application load leaves a visible retry screen without an input lock', async ({
  page
}) => {
  await page.route('**/assets/main-*.js', (route) => route.abort())
  await page.goto('/')
  const startup = page.locator('[data-ui="startup"]')
  await expect(startup).toHaveAttribute('data-state', 'error')
  await expect(page.getByRole('alert')).toContainText('应用初始化失败')
  await expect(startup.locator('h1')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('#root')).toHaveJSProperty('inert', false)
  await page.getByRole('button', { name: '重新加载' }).focus()
  await expect(page.getByRole('button', { name: '重新加载' })).toBeFocused()
})
