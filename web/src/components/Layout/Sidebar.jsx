// Sidebar.jsx - Enterprise Professional Navigation
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import clsx from 'clsx'
import {
  LayoutDashboard, BarChart3, Users, CalendarClock,
  BookOpen, GitBranch, Layers, UsersRound, MapPin,
  ListChecks, ClipboardCheck, BarChart2, Settings,
  ChevronLeft, ChevronRight, Shield, GraduationCap,
  QrCode, Key
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ]
  },
  {
    group: 'Management',
    items: [
      { label: 'Users', path: '/management/users', icon: Users, badge: null },
      { label: 'Timetables', path: '/management/timetables', icon: CalendarClock },
      { label: 'QR/OTP', path: '/management/qr-otp', icon: QrCode },
      { label: 'Courses', path: '/management/courses', icon: BookOpen },
      { label: 'Branches', path: '/management/branches', icon: GitBranch },
      { label: 'Divisions', path: '/management/divisions', icon: Layers },
      { label: 'Batches', path: '/management/batches', icon: UsersRound },
      { label: 'Subjects', path: '/management/subjects', icon: GraduationCap },
      { label: 'Locations', path: '/management/locations', icon: MapPin },
      { label: 'Enrollments', path: '/management/enrollments', icon: ListChecks },
    ]
  },
  {
    group: 'Reports',
    items: [
      { label: 'Attendance', path: '/reports/attendance', icon: ClipboardCheck },
      { label: 'Analytics', path: '/reports/analytics', icon: BarChart2 },
    ]
  }
]

export default function Sidebar({ collapsed, onToggle, className }) {
  const user = useAuthStore(s => s.user)
  const location = useLocation()
  
  const getInitials = (user) => {
    if (!user) return 'AD'
    const first = user.first_name?.[0] ?? ''
    const last = user.last_name?.[0] ?? ''
    return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
  }

  return (
    <aside className={clsx('sidebar', { 'sidebar--collapsed': collapsed }, className)}>
      {/* Logo Section */}
      <div className="sb-logo">
        <div className="sb-logo-mark">
          {/* Logo Mark as request (Small square logo) */}
          <div style={{ width: 14, height: 14, backgroundColor: 'var(--bg-card)', borderRadius: 2 }} />
        </div>
        <div className="sb-logo-text">
          <span className="sb-logo-name">SmartAttend</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sb-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.group} className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-title">{section.group}</span>
            </div>
            <div className="sb-section-items">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    clsx('sb-item', { 'sb-item--active': isActive })
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <div className="sb-item-icon">
                    <item.icon size={15} strokeWidth={1.75} />
                  </div>
                  <span className="sb-item-label">{item.label}</span>
                  {item.badge && (
                    <span className="sb-item-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section Footer */}
      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-user-avatar">
            {getInitials(user)}
          </div>
          <div className="sb-user-info">
            <span className="sb-user-name">{user?.username || 'Administrator'}</span>
            <span className="sb-user-role">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>
        <NavLink to="/settings" className="sb-profile-btn" title="Settings">
          <Settings size={15} strokeWidth={1.75} />
        </NavLink>
      </div>
    </aside>
  )
}