import clsx from 'clsx';
import styles from './GlassButton.module.css';

export default function GlassButton({
  children,
  className,
  variant = 'primary', // primary | secondary | outline | ghost | danger | success
  size = 'md', // xs | sm | md | lg | xl
  fullWidth = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const buttonClasses = clsx(
    styles['glass-button'],
    styles[`glass-button--${variant}`],
    styles[`glass-button--${size}`],
    {
      [styles['glass-button--full-width']]: fullWidth,
      [styles['glass-button--icon-only']]: iconOnly,
      [styles['glass-button--loading']]: loading,
    },
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  );
}

// Helper component for button groups
export function GlassButtonGroup({ children, attached = false, className }) {
  return (
    <div className={clsx(
      styles['glass-button-group'],
      { [styles['glass-button-group--attached']]: attached },
      className
    )}>
      {children}
    </div>
  );
}
