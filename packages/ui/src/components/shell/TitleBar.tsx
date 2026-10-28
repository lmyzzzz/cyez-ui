import { useEffect, useState, type ReactNode } from 'react'
import { Minus, Square, X } from 'lucide-react'
import type { WindowControls } from '../../types'
import styles from './TitleBar.module.css'
export interface TitleBarProps {
  title: string
  subtitle?: string
  icon?: string
  actions?: ReactNode
  sidebarCollapsed?: boolean
  sidebarVisible?: boolean
  windowControls?: WindowControls | null
  closeDisabledReason?: string
  className?: string
  onWindowControlError?(reason: unknown): void
}
function RestoreIcon() {
  return (
    <span className={styles.restoreIcon} aria-hidden="true">
      <Square />
      <Square />
    </span>
  )
}
export function TitleBar({
  title,
  subtitle,
  icon,
  actions,
  sidebarCollapsed = false,
  sidebarVisible = true,
  windowControls,
  closeDisabledReason,
  className,
  onWindowControlError
}: TitleBarProps) {
  const [maximized, setMaximized] = useState(false)
  useEffect(() => {
    if (!windowControls) {
      setMaximized(false)
      return
    }
    let active = true
    // A state event wins over an older in-flight initial query.
    let changed = false
    const unsubscribe = windowControls.onMaximizedChange((value) => {
      changed = true
      if (active) setMaximized(value)
    })
    void windowControls.getMaximized().then(
      (value) => {
        if (active && !changed) setMaximized(value)
      },
      (reason) => {
        if (active) onWindowControlError?.(reason)
      }
    )
    return () => {
      active = false
      unsubscribe()
    }
  }, [windowControls, onWindowControlError])
  const run = (action: () => Promise<void>): void => {
    void Promise.resolve()
      .then(action)
      .catch((reason) => onWindowControlError?.(reason))
  }
  return (
    <header data-ui="titlebar" className={[styles.titlebar, className].filter(Boolean).join(' ')}>
      <div
        data-part="brand"
        className={styles.brand}
        data-collapsed={(sidebarVisible && sidebarCollapsed) || undefined}
        data-sidebar-hidden={!sidebarVisible || undefined}
      >
        {icon ? <img src={icon} alt="" /> : null}
        <span>{title}</span>
        {subtitle ? <small>{subtitle}</small> : null}
      </div>
      <div data-part="drag-region" className={styles.dragRegion} />
      {actions ? (
        <div data-part="actions" className={styles.titleActions}>
          {actions}
        </div>
      ) : null}
      {windowControls ? (
        <div data-part="window-controls" className={styles.controls} data-maximized={maximized}>
          <button
            aria-label="最小化"
            title="最小化"
            type="button"
            className={styles.controlButton}
            onClick={() => run(() => windowControls.minimize())}
          >
            <Minus aria-hidden="true" />
          </button>
          <button
            aria-label={maximized ? '还原' : '最大化'}
            title={maximized ? '还原' : '最大化'}
            type="button"
            className={styles.controlButton}
            onClick={() => run(() => windowControls.toggleMaximize())}
          >
            {maximized ? <RestoreIcon /> : <Square aria-hidden="true" />}
          </button>
          <button
            aria-label="关闭"
            title={closeDisabledReason || '关闭'}
            disabled={Boolean(closeDisabledReason)}
            type="button"
            className={styles.controlButton + ' ' + styles.closeButton}
            onClick={() => run(() => windowControls.close())}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </header>
  )
}
