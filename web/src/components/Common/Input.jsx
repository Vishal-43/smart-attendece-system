import clsx from 'clsx'
import './Input.css'

export default function Input({
  label,
  error,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div className={clsx('form-group', className)}>
      {label && <label className="form-group__label">{label}</label>}
      <input
        className={clsx('input', { 'input--error': error })}
        disabled={disabled}
        {...props}
      />
      {error && <span className="form-group__error">{error}</span>}
    </div>
  )
}

export function Select({
  label,
  error,
  options = [],
  children,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div className={clsx('form-group', className)}>
      {label && <label className="form-group__label">{label}</label>}
      <select
        className={clsx('select', { 'select--error': error })}
        disabled={disabled}
        {...props}
      >
        {children || (
          <>
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && <span className="form-group__error">{error}</span>}
    </div>
  )
}

export function Textarea({
  label,
  error,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div className={clsx('form-group', className)}>
      {label && <label className="form-group__label">{label}</label>}
      <textarea
        className={clsx('textarea', { 'textarea--error': error })}
        disabled={disabled}
        {...props}
      />
      {error && <span className="form-group__error">{error}</span>}
    </div>
  )
}
