import { useMemo, useState, type ReactNode } from 'react'
import { matchRoutes, Outlet, useLocation } from 'react-router-dom'
import type { AppRouteRegistration, RouteLayout } from '../../app/route-registry'
import { Sidebar } from './Sidebar'
import { TitleBar, type TitleBarProps } from './TitleBar'
import styles from './AppShell.module.css'
export interface AppShellProps extends Pick<
  TitleBarProps,
  | 'title'
  | 'subtitle'
  | 'icon'
  | 'actions'
  | 'windowControls'
  | 'closeDisabledReason'
  | 'onWindowControlError'
> {
  routes: readonly AppRouteRegistration[]
  layout?: RouteLayout
  children?: ReactNode
  className?: string
  slotClassNames?: Partial<Record<'titlebar' | 'sidebar' | 'content', string>>
  sidebarCollapsed?: boolean
  defaultSidebarCollapsed?: boolean
  onSidebarCollapsedChange?(collapsed: boolean): void
}
export function AppShell({
  routes,
  layout: layoutOverride,
  children,
  className,
  slotClassNames,
  sidebarCollapsed,
  defaultSidebarCollapsed = false,
  onSidebarCollapsedChange,
  ...titlebar
}: AppShellProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultSidebarCollapsed)
  const collapsed = sidebarCollapsed ?? internalCollapsed
  const { pathname } = useLocation()
  const routeLayout = useMemo(
    () =>
      matchRoutes(
        routes.map((route) => ({ path: route.path, handle: route })),
        pathname
      )?.at(-1)?.route.handle.layout ?? 'standard',
    [pathname, routes]
  )
  const layout = layoutOverride ?? routeLayout
  const sidebarVisible = layout === 'standard'
  const setCollapsed = (value: boolean): void => {
    setInternalCollapsed(value)
    onSidebarCollapsedChange?.(value)
  }
  return (
    <div
      data-ui="app-shell"
      className={[styles.shell, className].filter(Boolean).join(' ')}
      data-layout={layout}
      data-sidebar-collapsed={(sidebarVisible && collapsed) || undefined}
    >
      {layout !== 'immersive' ? (
        <TitleBar
          {...titlebar}
          className={slotClassNames?.titlebar}
          sidebarCollapsed={collapsed}
          sidebarVisible={sidebarVisible}
        />
      ) : null}
      <div data-part="workspace" className={styles.workspace}>
        {sidebarVisible ? (
          <Sidebar
            collapsed={collapsed}
            routes={routes}
            onCollapsedChange={setCollapsed}
            className={slotClassNames?.sidebar}
          />
        ) : null}
        <main
          data-part="content"
          className={[styles.content, slotClassNames?.content].filter(Boolean).join(' ')}
          data-layout={layout}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}
