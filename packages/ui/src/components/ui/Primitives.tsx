import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode
} from 'react'
import styles from './Primitives.module.css'
const classes = (...names: Array<string | undefined>) => names.filter(Boolean).join(' ')
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input {...props} ref={ref} data-ui="input" className={classes(styles.control, className)} />
    )
  }
)
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        {...props}
        ref={ref}
        data-ui="select"
        className={classes(styles.control, className)}
      />
    )
  }
)
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      {...props}
      ref={ref}
      data-ui="textarea"
      className={classes(styles.control, className)}
    />
  )
})
export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} data-ui="card" className={classes(styles.card, className)} />
}
export function Toolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} data-ui="toolbar" className={classes(styles.toolbar, className)} />
}
export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
}) {
  return (
    <span
      {...props}
      data-ui="badge"
      data-tone={tone}
      className={classes(styles.badge, className)}
    />
  )
}
export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} data-ui="table-container" className={classes(styles.table, className)} />
}
export function Switch({
  label,
  id,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> & { label: ReactNode }) {
  const generated = useId()
  return (
    <label data-ui="switch" className={classes(styles.switch, className)} htmlFor={id ?? generated}>
      <input {...props} id={id ?? generated} type="checkbox" role="switch" />
      <span data-part="track" aria-hidden="true" className={styles.track} />
      <span>{label}</span>
    </label>
  )
}
