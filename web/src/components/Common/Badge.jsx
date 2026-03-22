import clsx from 'clsx'
import './components.css'

/**
 * variant options:
 *   role:    'admin' | 'teacher' | 'student'
 *   status:  'present' | 'absent' | 'late' | 'active' | 'inactive' | 'live'
 */
export default function Badge({ variant = 'default', children, dot = false, live = false }) {
  return (
    <span className={clsx('badge', `badge--${variant}`)}>
      {dot && <span className={clsx('badge-dot', live && 'badge-dot--live')} />}
      {children}
    </span>
  )
}
