export type ThemeMode = 'light' | 'dark' | 'system'
export type MotionMode = 'system' | 'reduce' | 'full'
export interface AppearancePreferences {
  theme: ThemeMode
  motion: MotionMode
}
export interface AppearanceSnapshot extends AppearancePreferences {
  resolvedTheme: 'light' | 'dark'
  reducedMotion: boolean
}
export interface AppearanceStorage {
  load(): unknown
  save(preferences: AppearancePreferences): void
}
export interface AppearanceOptions {
  storage?: AppearanceStorage | null
  storageKey?: string
  defaults?: Partial<AppearancePreferences>
  onError?(error: unknown): void
}
export interface AppearanceController {
  getSnapshot(): AppearanceSnapshot
  subscribe(listener: () => void): () => void
  setTheme(theme: ThemeMode): void
  setMotion(motion: MotionMode): void
  reset(): void
  dispose(): void
}
function valid(value: unknown): value is AppearancePreferences {
  if (!value || typeof value !== 'object') return false
  const p = value as Partial<AppearancePreferences>
  return (
    ['light', 'dark', 'system'].includes(p.theme ?? '') &&
    ['system', 'reduce', 'full'].includes(p.motion ?? '')
  )
}
/** Create once per document, before mounting React. Dispose when the host tears down. */
export function createAppearanceController(options: AppearanceOptions = {}): AppearanceController {
  const defaults: AppearancePreferences = { theme: 'system', motion: 'system', ...options.defaults }
  if (!valid(defaults)) throw new TypeError('Invalid appearance defaults')
  const storage =
    options.storage === undefined
      ? {
          load: () =>
            JSON.parse(
              localStorage.getItem(options.storageKey ?? 'series:appearance') ?? 'null'
            ) as unknown,
          save: (preferences: AppearancePreferences) =>
            localStorage.setItem(
              options.storageKey ?? 'series:appearance',
              JSON.stringify(preferences)
            )
        }
      : options.storage
  let preferences = { ...defaults }
  try {
    const stored = storage?.load()
    if (valid(stored)) preferences = { ...stored }
  } catch (error) {
    options.onError?.(error)
  }
  const dark = window.matchMedia('(prefers-color-scheme: dark)')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const listeners = new Set<() => void>()
  let disposed = false
  const resolve = (): AppearanceSnapshot => ({
    ...preferences,
    resolvedTheme:
      preferences.theme === 'system' ? (dark.matches ? 'dark' : 'light') : preferences.theme,
    reducedMotion:
      preferences.motion === 'reduce' || (preferences.motion === 'system' && motion.matches)
  })
  let snapshot = resolve()
  const apply = (): void => {
    if (disposed) return
    const next = resolve()
    document.documentElement.dataset.theme = next.resolvedTheme
    document.documentElement.dataset.motion = next.reducedMotion ? 'reduce' : 'full'
    document.documentElement.toggleAttribute('data-reduce-motion', next.reducedMotion)
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return
    snapshot = next
    listeners.forEach((listener) => listener())
  }
  // Initial attributes must exist even when the resolved snapshot has not changed.
  apply()
  const persist = (next: AppearancePreferences): void => {
    if (disposed) throw new Error('Appearance controller has been disposed')
    if (!valid(next)) throw new TypeError('Invalid appearance preferences')
    preferences = next
    apply()
    try {
      storage?.save({ ...preferences })
    } catch (error) {
      options.onError?.(error)
    }
  }
  dark.addEventListener('change', apply)
  motion.addEventListener('change', apply)
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setTheme: (theme) => persist({ ...preferences, theme }),
    setMotion: (motion) => persist({ ...preferences, motion }),
    reset: () => persist({ ...defaults }),
    dispose() {
      disposed = true
      dark.removeEventListener('change', apply)
      motion.removeEventListener('change', apply)
      listeners.clear()
    }
  }
}
