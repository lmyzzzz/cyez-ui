import { useId, type InputHTMLAttributes, type JSX, type ReactNode } from 'react'
import styles from './Field.module.css'

interface FieldProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  children: ReactNode
}

export function Field({ label, htmlFor, hint, children }: FieldProps): JSX.Element {
  return (
    <div data-ui="field" className={styles.field}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}

interface CheckFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function CheckField({ label, id, ...props }: CheckFieldProps): JSX.Element {
  const generated = useId()
  const controlId = id ?? generated
  return (
    <div data-ui="check-field" className={styles.check}>
      <input id={controlId} type="checkbox" {...props} />
      <label htmlFor={controlId}>{label}</label>
    </div>
  )
}
