import clsx from 'clsx';
import styles from './GlassCard.module.css';

export default function GlassCard({
  children,
  className,
  variant = 'default', // default | flat | elevated | interactive | stat
  size = 'md', // sm | md | lg | xl
  onClick,
  header,
  title,
  subtitle,
  footer,
  ...props
}) {
  const cardClasses = clsx(
    styles['glass-card'],
    {
      [styles['glass-card--flat']]: variant === 'flat',
      [styles['glass-card--elevated']]: variant === 'elevated',
      [styles['glass-card--interactive']]: variant === 'interactive' || onClick,
      [styles['glass-card--stat']]: variant === 'stat',
      [styles[`glass-card--${size}`]]: size !== 'md',
    },
    className
  );

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {/* Header section */}
      {(header || title) && (
        <div className={styles['glass-card__header']}>
          {header || (
            <div>
              {title && <h3 className={styles['glass-card__title']}>{title}</h3>}
              {subtitle && <p className={styles['glass-card__subtitle']}>{subtitle}</p>}
            </div>
          )}
        </div>
      )}

      {/* Body section */}
      <div className={styles['glass-card__body']}>
        {children}
      </div>

      {/* Footer section */}
      {footer && (
        <div className={styles['glass-card__footer']}>
          {footer}
        </div>
      )}
    </div>
  );
}

// Stat card helper component
export function StatCard({ value, label, change, changeType = 'neutral', icon, ...props }) {
  return (
    <GlassCard variant="stat" {...props}>
      {icon && <div style={{ marginBottom: 'var(--spacing-sm)' }}>{icon}</div>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change !== undefined && (
        <div className={clsx('stat-change', {
          'stat-change--positive': changeType === 'positive',
          'stat-change--negative': changeType === 'negative',
        })}>
          {changeType === 'positive' && '▲ '}
          {changeType === 'negative' && '▼ '}
          {change}
        </div>
      )}
    </GlassCard>
  );
}
