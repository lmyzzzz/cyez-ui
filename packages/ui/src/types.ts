/** A browser-friendly capability contract; no Electron imports or globals. */
export interface WindowControls {
  minimize(): Promise<void>
  toggleMaximize(): Promise<void>
  close(): Promise<void>
  getMaximized(): Promise<boolean>
  onMaximizedChange(listener: (maximized: boolean) => void): () => void
}
export interface TaskProgressItem {
  id: string
  label: string
  status: 'waiting' | 'running' | 'completed' | 'failed'
  log?: { format: 'text' | 'markdown'; content: string }
}
