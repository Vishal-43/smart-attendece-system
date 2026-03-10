import './GlassBadge.module.css'

const VARIANT_CLASSES = {
  active: 'glass-badge--active',
  inactive: 'glass-badge--inactive',
  pending: 'glass-badge--pending',
  default: 'glass-badge--default',
}

export default function GlassBadge({ children, variant = 'default' }) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default

  return (
    <span className={`glass-badge ${variantClass}`}>
      {children}
    </span>
  )
}
