import clsx from 'clsx'
import './Badge.css'

export default function Badge({ children, variant = 'default', size = 'sm', dot = false, className }) {
  return (
    <span className={clsx('badge', `badge--${variant}`, `badge--${size}`, className)}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  )
}
