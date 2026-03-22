import clsx from 'clsx'
import './Skeleton.css'

export default function Skeleton({ width, height, variant = 'text', className, style }) {
  return (
    <span
      className={clsx('skeleton', `skeleton--${variant}`, className)}
      style={{ width, height, ...style }}
    />
  )
}

export function SkeletonBlock({ lines = 3, className }) {
  return (
    <div className={clsx('skeleton-block', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          height="14px"
        />
      ))}
    </div>
  )
}
