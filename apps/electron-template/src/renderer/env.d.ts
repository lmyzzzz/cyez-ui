import type { WindowControlsBridge } from '@series/electron/shared'
declare global {
  interface Window {
    desktop?: { windowControls: WindowControlsBridge }
  }
}
export {}
