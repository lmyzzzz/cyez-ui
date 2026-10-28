import { createAppearanceController } from '@series/ui/theme'
export const appearance = createAppearanceController({ storageKey: 'series-demo:appearance' })
window.addEventListener('pagehide', () => appearance.dispose(), { once: true })
