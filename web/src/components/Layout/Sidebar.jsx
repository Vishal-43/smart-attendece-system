import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import './Sidebar.css'

const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'management',
    label: 'Management',
    icon: Users,
    submenu: [
      { label: 'Users', href: '/management/users' },
      { label: 'Divisions', href: '/management/divisions' },
      { label: 'Courses', href: '/management/courses' },
      { label: 'Branches', href: '/management/branches' },
      { label: 'Batches', href: '/management/batches' },
      { label: 'Timetables', href: '/management/timetables' },
      { label: 'Locations', href: '/management/locations' },
      { label: 'Access Points', href: '/management/access-points' },
      { label: 'Enrollments', href: '/management/enrollments' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    submenu: [
      { label: 'Attendance', href: '/reports/attendance' },
      { label: 'Analytics', href: '/reports/analytics' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState(null)
  const location = useLocation()

  const toggleMenu = (id) => {
    setExpandedMenu(expandedMenu === id ? null : id)
  }

  const isActive = (href) => location.pathname === href

  return (
    <>
      <button className="sidebar__toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h2 className="sidebar__logo">SA</h2>
          <span className="sidebar__title">Admin</span>
        </div>

        <nav className="sidebar__nav">
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="sidebar__menu-item">
              {item.submenu ? (
                <>
                  <button
                    className={`sidebar__link ${
                      expandedMenu === item.id ? 'sidebar__link--active' : ''
                    }`}
                    onClick={() => toggleMenu(item.id)}
                  >
                    <item.icon size={20} />
                    <span className="sidebar__label">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`sidebar__chevron ${
                        expandedMenu === item.id ? 'sidebar__chevron--open' : ''
                      }`}
                    />
                  </button>
                  {expandedMenu === item.id && (
                    <div className="sidebar__submenu">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          to={subitem.href}
                          className={`sidebar__sublink ${
                            isActive(subitem.href)
                              ? 'sidebar__sublink--active'
                              : ''
                          }`}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`sidebar__link ${
                    isActive(item.href) ? 'sidebar__link--active' : ''
                  }`}
                >
                  <item.icon size={20} />
                  <span className="sidebar__label">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
