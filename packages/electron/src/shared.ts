export const WINDOW_CHANNELS = {
  minimize: 'series:window:minimize',
  toggleMaximize: 'series:window:toggle-maximize',
  close: 'series:window:close',
  getMaximized: 'series:window:get-maximized',
  maximizedChanged: 'series:window:maximized-changed'
} as const
export interface WindowControlsBridge {
  minimize(): Promise<void>
  toggleMaximize(): Promise<void>
  close(): Promise<void>
  getMaximized(): Promise<boolean>
  onMaximizedChange(listener: (maximized: boolean) => void): () => void
}
