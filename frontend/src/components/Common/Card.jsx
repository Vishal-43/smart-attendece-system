import clsx from 'clsx'
import './Card.css'

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx('card', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={clsx('card__header', className)}>{children}</div>
}

export function CardBody({ children, className }) {
  return <div className={clsx('card__body', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return <div className={clsx('card__footer', className)}>{children}</div>
}
