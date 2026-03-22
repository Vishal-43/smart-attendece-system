import clsx from 'clsx'
import './components.css'

export default function Card({ children, className, hoverable = false, ...props }) {
  return (
    <div className={clsx('card', hoverable && 'card--hoverable', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className, actions }) {
  return (
    <div className={clsx('card__header', className)}>
      <div>{children}</div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}

export function CardBody({ children, className }) {
  return <div className={clsx('card__body', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return <div className={clsx('card__footer', className)}>{children}</div>
}
