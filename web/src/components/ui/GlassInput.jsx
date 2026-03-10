import clsx from 'clsx';
import styles from './GlassInput.module.css';

export default function GlassInput({
  label,
  required = false,
  error,
  helpText,
  icon,
  iconPosition = 'left',
  size = 'md',
  className,
  wrapperClassName,
  type = 'text',
  ...props
}) {
  const hasIcon = !!icon;
  const hasLabel = !!label;

  return (
    <div
      className={clsx(
        styles['glass-input-wrapper'],
        {
          [styles['glass-input-wrapper--with-icon-left']]: hasIcon && iconPosition === 'left',
          [styles['glass-input-wrapper--with-icon-right']]: hasIcon && iconPosition === 'right',
          [styles['glass-input-wrapper--with-label']]: hasLabel,
        },
        wrapperClassName
      )}
    >
      {label && (
        <label
          className={clsx(styles['glass-input-label'], {
            [styles['glass-input-label--required']]: required,
          })}
        >
          {label}
        </label>
      )}

      {hasIcon && (
        <span
          className={clsx(
            styles['glass-input__icon'],
            styles[`glass-input__icon--${iconPosition}`]
          )}
        >
          {icon}
        </span>
      )}

      <input
        type={type}
        className={clsx(
          styles['glass-input'],
          {
            [styles['glass-input--error']]: error,
            [styles[`glass-input--${size}`]]: size !== 'md',
          },
          className
        )}
        {...props}
      />

      {error && <span className={styles['glass-input__error-text']}>{error}</span>}
      {!error && helpText && <span className={styles['glass-input__help-text']}>{helpText}</span>}
    </div>
  );
}

// Textarea component
export function GlassTextarea({
  label,
  required = false,
  error,
  helpText,
  className,
  wrapperClassName,
  rows = 4,
  ...props
}) {
  return (
    <div className={clsx(styles['glass-input-wrapper'], wrapperClassName)}>
      {label && (
        <label
          className={clsx(styles['glass-input-label'], {
            [styles['glass-input-label--required']]: required,
          })}
        >
          {label}
        </label>
      )}

      <textarea
        rows={rows}
        className={clsx(
          styles['glass-input'],
          styles['glass-textarea'],
          {
            [styles['glass-input--error']]: error,
          },
          className
        )}
        {...props}
      />

      {error && <span className={styles['glass-input__error-text']}>{error}</span>}
      {!error && helpText && <span className={styles['glass-input__help-text']}>{helpText}</span>}
    </div>
  );
}

// Select component
export function GlassSelect({
  label,
  required = false,
  error,
  helpText,
  options = [],
  placeholder = 'Select an option',
  className,
  wrapperClassName,
  size = 'md',
  ...props
}) {
  return (
    <div className={clsx(styles['glass-input-wrapper'], wrapperClassName)}>
      {label && (
        <label
          className={clsx(styles['glass-input-label'], {
            [styles['glass-input-label--required']]: required,
          })}
        >
          {label}
        </label>
      )}

      <select
        className={clsx(
          styles['glass-input'],
          styles['glass-select'],
          {
            [styles['glass-input--error']]: error,
            [styles[`glass-input--${size}`]]: size !== 'md',
          },
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <span className={styles['glass-input__error-text']}>{error}</span>}
      {!error && helpText && <span className={styles['glass-input__help-text']}>{helpText}</span>}
    </div>
  );
}

// Checkbox component
export function GlassCheckbox({ label, className, wrapperClassName, ...props }) {
  return (
    <label className={clsx(styles['glass-checkbox-wrapper'], wrapperClassName)}>
      <input type="checkbox" className={clsx(styles['glass-checkbox'], className)} {...props} />
      {label && <span className={styles['glass-checkbox-wrapper__label']}>{label}</span>}
    </label>
  );
}

// Radio component
export function GlassRadio({ label, className, wrapperClassName, ...props }) {
  return (
    <label className={clsx(styles['glass-radio-wrapper'], wrapperClassName)}>
      <input type="radio" className={clsx(styles['glass-radio'], className)} {...props} />
      {label && <span className={styles['glass-radio-wrapper__label']}>{label}</span>}
    </label>
  );
}
