import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import styles from './ActionMenu.module.css'
import buttonStyles from './IconButton.module.css'
export interface ActionMenuProps {
  children: ReactNode
  label: string
  disabled?: boolean
  className?: string
}
export function ActionMenu({ children, label, disabled, className }: ActionMenuProps) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          data-ui="action-menu-trigger"
          type="button"
          aria-label={label}
          title={label}
          disabled={disabled}
          className={buttonStyles.button + ' ' + buttonStyles.medium + ' ' + buttonStyles.default}
        >
          <MoreHorizontal aria-hidden="true" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          data-ui="action-menu"
          aria-label={label}
          className={[styles.menu, className].filter(Boolean).join(' ')}
          sideOffset={5}
          collisionPadding={8}
          align="end"
        >
          {children}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}
export interface ActionMenuItemProps {
  children: ReactNode
  danger?: boolean
  disabled?: boolean
  icon: ComponentType<SVGProps<SVGSVGElement>>
  onSelect(): void
}
export function ActionMenuItem({
  children,
  danger,
  disabled,
  icon: Icon,
  onSelect
}: ActionMenuItemProps) {
  return (
    <Dropdown.Item
      data-part="item"
      className={styles.item}
      data-danger={danger || undefined}
      disabled={disabled}
      onSelect={onSelect}
    >
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </Dropdown.Item>
  )
}
