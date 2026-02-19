import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'
import './Alert.css'

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  }

  const Icon = icons[type]

  return (
    <div className={clsx('alert', `alert--${type}`, className)}>
      <div className="alert__content">
        <Icon className="alert__icon" size={20} />
        <div className="alert__text">
          {title && <strong className="alert__title">{title}</strong>}
          {message && <p className="alert__message">{message}</p>}
        </div>
      </div>
      {onClose && (
        <button className="alert__close" onClick={onClose}>
          <X size={16} />
        </button>
      )}
    </div>
  )
}
