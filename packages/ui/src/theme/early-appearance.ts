import { createAppearanceController } from './controller'
// External blocking script for the HTML head: no React, inline script or palette injection.
const script = document.currentScript as HTMLScriptElement | null
createAppearanceController({ storageKey: script?.dataset.storageKey }).dispose()
