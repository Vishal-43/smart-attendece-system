import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useLogout } from '../../api/hooks'
import { LogOut, Settings, User, Bell, Menu, X } from 'lucide-react'
import './Header.css'

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const logoutMutation = useLogout()

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
          <button className="header__icon-btn">
            <Bell size={20} />
          </button>

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
