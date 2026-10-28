import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import {
  createAppearanceController,
  type AppearanceController
} from '../../packages/ui/src/theme/controller'
let controllers: AppearanceController[] = []
let media: Map<string, EventTarget & { matches: boolean }>
beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  media = new Map()
  vi.stubGlobal('matchMedia', (query: string) => {
    if (!media.has(query)) media.set(query, Object.assign(new EventTarget(), { matches: false }))
    return media.get(query)
  })
})
afterEach(() => {
  controllers.forEach((controller) => controller.dispose())
  controllers = []
  vi.unstubAllGlobals()
})
function make(options: Parameters<typeof createAppearanceController>[0] = {}) {
  const controller = createAppearanceController(options)
  controllers.push(controller)
  return controller
}
describe('appearance lifecycle', () => {
  it('restores persisted preferences before React and follows system changes only in system mode', () => {
    localStorage.setItem('test', JSON.stringify({ theme: 'dark', motion: 'reduce' }))
    const controller = make({ storageKey: 'test' })
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.dataset.motion).toBe('reduce')
    controller.setTheme('system')
    expect(document.documentElement.dataset.theme).toBe('light')
    const dark = media.get('(prefers-color-scheme: dark)')!
    dark.matches = true
    dark.dispatchEvent(new Event('change'))
    expect(controller.getSnapshot().resolvedTheme).toBe('dark')
    controller.setTheme('light')
    dark.dispatchEvent(new Event('change'))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(JSON.parse(localStorage.getItem('test')!).theme).toBe('light')
  })
  it('survives invalid or unavailable storage and still applies preference changes', () => {
    const onError = vi.fn()
    const controller = make({
      storage: {
        load() {
          throw new Error('storage blocked')
        },
        save() {
          throw new Error('quota')
        }
      },
      onError
    })
    controller.setTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(onError).toHaveBeenCalledTimes(2)
    const second = make({ storage: { load: () => ({ theme: 'invalid' }), save() {} } })
    expect(second.getSnapshot().theme).toBe('system')
  })
  it('unsubscribes and detaches system listeners on disposal', () => {
    const controller = make()
    const listener = vi.fn()
    const unsubscribe = controller.subscribe(listener)
    controller.setMotion('reduce')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    controller.setMotion('full')
    expect(listener).toHaveBeenCalledTimes(1)
    controller.dispose()
    const dark = media.get('(prefers-color-scheme: dark)')!
    dark.matches = true
    dark.dispatchEvent(new Event('change'))
    expect(controller.getSnapshot().resolvedTheme).toBe('light')
  })
})
