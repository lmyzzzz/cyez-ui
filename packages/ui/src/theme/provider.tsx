import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import type { AppearanceController, AppearanceSnapshot } from './controller'
const AppearanceContext = createContext<AppearanceController | null>(null)
export function AppearanceProvider({
  controller,
  children
}: {
  controller: AppearanceController
  children: ReactNode
}) {
  return <AppearanceContext.Provider value={controller}>{children}</AppearanceContext.Provider>
}
export function useAppearance(): AppearanceSnapshot &
  Pick<AppearanceController, 'setTheme' | 'setMotion' | 'reset'> {
  const controller = useContext(AppearanceContext)
  if (!controller) throw new Error('useAppearance requires AppearanceProvider')
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  )
  return {
    ...snapshot,
    setTheme: controller.setTheme,
    setMotion: controller.setMotion,
    reset: controller.reset
  }
}
