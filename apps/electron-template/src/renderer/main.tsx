import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { StrictMode } from 'react'
import { AppearanceProvider } from '@series/ui'
import { appearance } from './appearance'
import { App } from './App'
export function startApplication(root: HTMLElement): void {
  flushSync(() =>
    createRoot(root).render(
      <StrictMode>
        <AppearanceProvider controller={appearance}>
          <App />
        </AppearanceProvider>
      </StrictMode>
    )
  )
}
