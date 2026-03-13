import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { notificationsAPI } from '../../api/endpoints'
import { LogOut, Settings, User, Bell } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import './Header.css'

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsAPI.list({ page: 1, limit: 5 }),
        notificationsAPI.unreadCount(),
      ])
      setNotifications(listRes?.data?.data?.items || [])
      setUnreadCount(countRes?.data?.data?.unread_count || 0)
    } catch (error) {
      console.error('Failed to load notifications', error)
    }
  }

  const handleLogout = async () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left">
          <h1 className="header__title">Smart Attendance</h1>
        </div>

        <div className="header__right">
          <ThemeToggle compact />

          <button
            className="header__icon-btn"
            onClick={async () => {
              const next = !isNotifOpen
              setIsNotifOpen(next)
              if (next) {
                await loadNotifications()
              }
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="header__notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div className="header__notif-dropdown">
              <div className="header__notif-title">Notifications</div>
              {notifications.length === 0 ? (
                <div className="header__notif-empty">No notifications</div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="header__notif-item"
                    onClick={async () => {
                      if (!item.is_read) {
                        await notificationsAPI.markRead(item.id)
                        await loadNotifications()
                      }
                    }}
                  >
                    <span className="header__notif-item-title">{item.title}</span>
                    <span className="header__notif-item-message">{item.message}</span>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="header__user-menu">
            <button
              className="header__user-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="header__user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="header__user-name">{user?.username}</span>
            </button>

            {isDropdownOpen && (
              <div className="header__dropdown">
                <button
                  className="header__dropdown-item"
                  onClick={() => navigate('/profile')}
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  className="header__dropdown-item"
                  onClick={() => navigate('/settings')}
                >
                  <Settings size={16} />
                  Settings
                </button>
                <div className="header__dropdown-separator" />
                <button
                  className="header__dropdown-item header__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
