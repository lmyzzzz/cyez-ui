import type { IpcRenderer, IpcRendererEvent } from 'electron'
import { WINDOW_CHANNELS as channels, type WindowControlsBridge } from './shared'
/** Bundle this function into sandboxed preload. It exposes no arbitrary IPC. */
export function createWindowControlsBridge(ipc: IpcRenderer): WindowControlsBridge {
  return {
    minimize: () => ipc.invoke(channels.minimize),
    toggleMaximize: () => ipc.invoke(channels.toggleMaximize),
    close: () => ipc.invoke(channels.close),
    getMaximized: () => ipc.invoke(channels.getMaximized),
    onMaximizedChange(listener) {
      const receive = (_event: IpcRendererEvent, maximized: unknown): void => {
        if (typeof maximized === 'boolean') listener(maximized)
      }
      ipc.on(channels.maximizedChanged, receive)
      return () => {
        ipc.removeListener(channels.maximizedChanged, receive)
      }
    }
  }
}
export type { WindowControlsBridge } from './shared'
