import clsx from 'clsx'
import './components.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className,
  ...props
}) {
  return (
    <button
      className={clsx('btn', `btn--${variant}`, `btn--${size}`, loading && 'btn--loading', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
      {!loading && icon}
      {children}
    </button>
  )
}
