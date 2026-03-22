// Header.jsx - Enterprise Professional Header
import { useState, useEffect, useRef } from 'react'
import { 
  Bell, Sun, Moon, Search, Menu, X, 
  ChevronRight, Calendar, Clock, CheckCircle, 
  XCircle, AlertCircle, Info
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from '../../contexts/ThemeContext'
import { notificationsAPI } from '../../api/endpoints'
import clsx from 'clsx'
import './Header.css'

const BREADCRUMBS = {
  '/': [{ label: 'Dashboard', icon: 'home' }],
  '/management': [{ label: 'Management', icon: 'folder' }],
  '/management/users': [{ label: 'Users', icon: 'users' }],
  '/management/timetables': [{ label: 'Timetables', icon: 'calendar' }],
  '/management/courses': [{ label: 'Courses', icon: 'book' }],
  '/management/branches': [{ label: 'Branches', icon: 'git-branch' }],
  '/management/divisions': [{ label: 'Divisions', icon: 'layers' }],
  '/management/batches': [{ label: 'Batches', icon: 'users' }],
  '/management/subjects': [{ label: 'Subjects', icon: 'book-open' }],
  '/management/locations': [{ label: 'Locations', icon: 'map-pin' }],
  '/management/enrollments': [{ label: 'Enrollments', icon: 'list-checks' }],
  '/reports': [{ label: 'Reports', icon: 'clipboard' }],
  '/reports/attendance': [{ label: 'Attendance', icon: 'clipboard-check' }],
  '/reports/analytics': [{ label: 'Analytics', icon: 'bar-chart' }],
  '/settings': [{ label: 'Settings', icon: 'settings' }],
  '/profile': [{ label: 'Profile', icon: 'user' }],
}

const IconMap = {
  home: '🏠',
  folder: '📁',
  users: '👥',
  calendar: '📅',
  book: '📚',
  'git-branch': '🌿',
  layers: '🎯',
  'book-open': '📖',
  'map-pin': '📍',
  'list-checks': '✅',
  clipboard: '📋',
  'clipboard-check': '✓',
  'bar-chart': '📊',
  settings: '⚙️',
  user: '👤',
}

export default function Header({ onMenuClick }) {
  const user = useAuthStore(s => s.user)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef(null)
  const searchRef = useRef(null)

  const getInitials = (user) => {
    if (!user) return 'AD'
    const first = user.first_name?.[0] ?? ''
    const last = user.last_name?.[0] ?? ''
    return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsAPI.list({ page: 1, limit: 6 }),
        notificationsAPI.unreadCount(),
      ])
      setNotifications(listRes?.data?.items || [])
      setUnreadCount(countRes?.data?.unread_count || 0)
    } catch (e) {
      console.error('Failed to load notifications:', e)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id)
      await loadNotifications()
    } catch (e) {
      console.error('Failed to mark notification as read:', e)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      for (const notif of notifications.filter(n => !n.is_read)) {
        await notificationsAPI.markRead(notif.id)
      }
      await loadNotifications()
    } catch (e) {
      console.error('Failed to mark all as read:', e)
    }
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} />
      case 'warning': return <AlertCircle size={16} />
      case 'error': return <XCircle size={16} />
      default: return <Info size={16} />
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getBreadcrumbs = () => {
    const path = location.pathname
    const crumbs = BREADCRUMBS['/'] || []
    
    for (const [key, value] of Object.entries(BREADCRUMBS)) {
      if (path.startsWith(key) && key !== '/') {
        const currentPage = path.replace(key, '').split('/').filter(Boolean)[0]
        if (currentPage) {
          const pageCrumb = BREADCRUMBS[`${key}/${currentPage}`] || BREADCRUMBS[key]
          if (pageCrumb) {
            return [...crumbs, ...pageCrumb, { label: currentPage.charAt(0).toUpperCase() + currentPage.slice(1) }]
          }
        }
        return [...crumbs, ...value]
      }
    }
    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="header">
      {/* Left Section - Breadcrumbs & Mobile Menu */}
      <div className="hdr-left">
        <button className="hdr-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        
        <nav className="hdr-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="hdr-breadcrumb-item">
              {idx > 0 && <ChevronRight size={14} className="hdr-breadcrumb-sep" />}
              <span className="hdr-breadcrumb-text">{crumb.label}</span>
            </span>
          ))}
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="hdr-center" ref={searchRef}>
        <div className={clsx('hdr-search', { 'hdr-search--open': searchOpen })}>
          <Search size={14} className="hdr-search-icon" />
          <input
            type="text"
            className="hdr-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
          />
          <div className="hdr-search-shortcut">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
        
        {searchOpen && searchQuery && (
          <div className="hdr-search-dropdown">
            <div className="hdr-search-results">
              <div className="hdr-search-section">
                <span className="hdr-search-section-title">Quick Actions</span>
                <button className="hdr-search-result" onClick={() => { navigate('/management/users'); setSearchOpen(false); }}>
                  <Search size={14} />
                  <span>Go to Users</span>
                </button>
                <button className="hdr-search-result" onClick={() => { navigate('/reports/attendance'); setSearchOpen(false); }}>
                  <Search size={14} />
                  <span>View Attendance</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="hdr-right">
        {/* Date/Time Display */}
        <div className="hdr-datetime">
          <div className="hdr-datetime-item">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="hdr-notif-wrap" ref={notifRef}>
          <button
            className={clsx('hdr-icon-btn', { 'hdr-icon-btn--has-notif': unreadCount > 0 })}
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
          >
            <Bell size={16} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="hdr-notif-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="hdr-notif-dropdown">
              <div className="hdr-notif-header">
                <span className="hdr-notif-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="hdr-notif-mark-all" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="hdr-notif-list">
                {notifications.length === 0 ? (
                  <div className="hdr-notif-empty">
                    <Bell size={24} />
                    <span>No notifications</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      className={clsx('hdr-notif-item', { 'hdr-notif-item--unread': !item.is_read })}
                      onClick={() => !item.is_read && handleMarkRead(item.id)}
                    >
                      <div className={clsx('hdr-notif-icon', `hdr-notif-icon--${item.type || 'info'}`)}>
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="hdr-notif-content">
                        <span className="hdr-notif-item-title">{item.title}</span>
                        <span className="hdr-notif-item-msg">{item.message}</span>
                        <span className="hdr-notif-item-time">{formatTime(item.created_at)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="hdr-notif-footer">
                <button className="hdr-notif-view-all" onClick={() => { setNotifOpen(false); navigate('/notifications') }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="hdr-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
        </button>

        {/* User Avatar */}
        <button
          className="hdr-avatar"
          onClick={() => navigate('/profile')}
          title={user?.email || 'Profile'}
        >
          {getInitials(user)}
        </button>
      </div>
    </header>
  )
}