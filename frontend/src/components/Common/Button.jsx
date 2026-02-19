import clsx from 'clsx'
import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      className={clsx('btn', `btn--${variant}`, `btn--${size}`, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
