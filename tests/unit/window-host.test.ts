import { EventEmitter } from 'node:events'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const fixture = vi.hoisted(() => ({
  handlers: new Map<string, (event: any) => unknown>(),
  senderWindow: new Map<unknown, unknown>()
}))
vi.mock('electron', () => ({
  BrowserWindow: { fromWebContents: (contents: unknown) => fixture.senderWindow.get(contents) },
  ipcMain: {
    handle: (channel: string, handler: (event: any) => unknown) => {
      if (fixture.handlers.has(channel)) throw new Error('already registered')
      fixture.handlers.set(channel, handler)
    },
    removeHandler: (channel: string) => fixture.handlers.delete(channel)
  }
}))
import { createWindowControlHost } from '../../packages/electron/src/main'
import { WINDOW_CHANNELS } from '../../packages/electron/src/shared'
beforeEach(() => {
  fixture.handlers.clear()
  fixture.senderWindow.clear()
})
function fakeWindow() {
  const win = Object.assign(new EventEmitter(), {
    maximized: false,
    isDestroyed: () => false,
    webContents: { mainFrame: {}, send: vi.fn(), isDestroyed: () => false },
    minimize: vi.fn(),
    close: vi.fn(),
    isMaximized() {
      return win.maximized
    },
    maximize() {
      win.maximized = true
      win.emit('maximize')
    },
    unmaximize() {
      win.maximized = false
      win.emit('unmaximize')
    }
  })
  fixture.senderWindow.set(win.webContents, win)
  return win
}
describe('window host boundaries', () => {
  it('rejects unbound windows and subframes while routing controls to the correct window', () => {
    const host = createWindowControlHost()
    const first = fakeWindow(),
      second = fakeWindow()
    host.bind(first as any)
    const invoke = (window: typeof first, senderFrame = window.webContents.mainFrame) =>
      fixture.handlers.get(WINDOW_CHANNELS.toggleMaximize)!({
        sender: window.webContents,
        senderFrame
      })
    expect(() => invoke(second)).toThrow('not authorized')
    expect(() => invoke(first, {})).toThrow('not authorized')
    invoke(first)
    expect(first.maximized).toBe(true)
    expect(second.maximized).toBe(false)
    expect(first.webContents.send).toHaveBeenCalledWith(WINDOW_CHANNELS.maximizedChanged, true)
    host.dispose()
    expect(fixture.handlers.size).toBe(0)
    expect(first.listenerCount('maximize')).toBe(0)
  })
  it('does not remove the first hosts handlers when duplicate registration fails', () => {
    const host = createWindowControlHost()
    expect(() => createWindowControlHost()).toThrow('already registered')
    expect(fixture.handlers.size).toBe(4)
    host.dispose()
  })
})
