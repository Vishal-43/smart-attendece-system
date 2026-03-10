import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './GlassSidebar.module.css'

export default function GlassSidebar({ items = [] }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`glass-sidebar ${collapsed ? 'glass-sidebar--collapsed' : ''}`}>
      <button
        className="glass-sidebar__toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        type="button"
      >
        {collapsed ? '→' : '←'}
      </button>

      <nav className="glass-sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `glass-sidebar__link ${isActive ? 'glass-sidebar__link--active' : ''}`
            }
          >
            <span className="glass-sidebar__icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
