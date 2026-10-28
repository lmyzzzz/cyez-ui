import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { WINDOW_CHANNELS as channels } from './shared'
export interface WindowControlHost {
  bind(window: BrowserWindow): () => void
  dispose(): void
}
/** Register once per main process. Only explicitly bound windows' main frames may invoke. */
export function createWindowControlHost(): WindowControlHost {
  const windows = new Map<BrowserWindow, () => void>()
  let disposed = false
  const sender = (event: IpcMainInvokeEvent): BrowserWindow => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (
      !window ||
      window.isDestroyed() ||
      !windows.has(window) ||
      event.senderFrame !== event.sender.mainFrame
    ) {
      throw new Error('Window control sender is not authorized')
    }
    return window
  }
  const handlers: Array<[string, (event: IpcMainInvokeEvent) => unknown]> = [
    [channels.minimize, (event) => sender(event).minimize()],
    [
      channels.toggleMaximize,
      (event) => {
        const window = sender(event)
        if (window.isMaximized()) window.unmaximize()
        else window.maximize()
      }
    ],
    [
      channels.close,
      (event) => {
        sender(event).close()
      }
    ],
    [channels.getMaximized, (event) => sender(event).isMaximized()]
  ]
  const registered: string[] = []
  try {
    for (const [channel, handler] of handlers) {
      ipcMain.handle(channel, handler)
      registered.push(channel)
    }
  } catch (error) {
    registered.forEach((channel) => ipcMain.removeHandler(channel))
    throw error
  }
  return {
    bind(window) {
      if (disposed) throw new Error('Window control host has been disposed')
      if (window.isDestroyed()) throw new Error('Cannot bind a destroyed window')
      if (windows.has(window)) return windows.get(window)!
      const notify = (): void => {
        if (!window.isDestroyed() && !window.webContents.isDestroyed()) {
          window.webContents.send(channels.maximizedChanged, window.isMaximized())
        }
      }
      const cleanup = (): void => {
        window.removeListener('maximize', notify)
        window.removeListener('unmaximize', notify)
        window.removeListener('closed', cleanup)
        windows.delete(window)
      }
      windows.set(window, cleanup)
      window.on('maximize', notify)
      window.on('unmaximize', notify)
      window.once('closed', cleanup)
      return cleanup
    },
    dispose() {
      if (disposed) return
      disposed = true
      for (const cleanup of [...windows.values()]) cleanup()
      registered.forEach((channel) => ipcMain.removeHandler(channel))
    }
  }
}
