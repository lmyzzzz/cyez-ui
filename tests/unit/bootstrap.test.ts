import { afterEach, expect, it, vi } from 'vitest'
import { bootstrapRenderer } from '../../packages/ui/src/startup/bootstrap'
afterEach(() => document.body.replaceChildren())
it('renders a safe branded error screen if the application chunk fails', async () => {
  const root = document.createElement('div')
  await bootstrapRenderer({
    root,
    title: '<img onerror=bad()>',
    loadApplication: () => Promise.reject(new Error('<script>bad()</script>'))
  })
  expect(root.querySelector('[role=alert]')).not.toBeNull()
  expect(root.querySelector('script')).toBeNull()
  expect(root.textContent).toContain('<script>bad()</script>')
  expect(root.querySelector('button')?.textContent).toBe('重新加载')
})

it('mounts the application behind the overlay and waits for explicit readiness', async () => {
  const root = document.createElement('div')
  root.setAttribute('aria-busy', 'false')
  document.body.append(root)
  let ready!: () => void
  const readiness = new Promise<void>((resolve) => {
    ready = resolve
  })
  const startApplication = vi.fn(async (target: HTMLElement) => {
    target.textContent = '应用内容'
    await readiness
  })
  const boot = bootstrapRenderer({
    root,
    title: '示例',
    loadApplication: async () => ({ startApplication })
  })
  await vi.waitFor(() => expect(startApplication).toHaveBeenCalledOnce())
  expect(root.textContent).toBe('应用内容')
  expect(root.inert).toBe(true)
  expect(root.getAttribute('aria-busy')).toBe('true')
  expect(document.querySelector('[data-ui="startup"]')).not.toBeNull()
  ready()
  await boot
  expect(document.querySelector('[data-ui="startup"]')).toBeNull()
  expect(root.inert).not.toBe(true)
  expect(root.getAttribute('aria-busy')).toBe('false')
})

it('replaces a partially mounted application with an interactive error screen', async () => {
  const root = document.createElement('div')
  document.body.append(root)
  await bootstrapRenderer({
    root,
    title: '示例',
    icon: '/icon.svg',
    loadApplication: async () => ({
      startApplication: async (target) => {
        target.textContent = '尚未就绪'
        throw new Error('初始化失败')
      }
    })
  })
  expect(root.querySelector('[data-state="error"][role="alert"]')).not.toBeNull()
  expect(root.querySelector('button')).not.toBeNull()
  expect(root.textContent).not.toContain('尚未就绪')
  expect(root.inert).not.toBe(true)
  expect(root.hasAttribute('aria-busy')).toBe(false)
  expect(document.querySelectorAll('[data-ui="startup"]')).toHaveLength(1)
})
