// Header.jsx - Modern Professional Header
import { useState, useEffect, useRef } from 'react'
import { 
  Bell, Sun, Moon, Search, Menu,
  Calendar, Clock, CheckCircle, 
  XCircle, AlertCircle, Info, LayoutDashboard,
  Users, FileText, Settings, BarChart3
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from '../../contexts/ThemeContext'
import clsx from 'clsx'
import './Header.css'

const NAV_LINKS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Users', path: '/management/users', icon: Users },
  { label: 'Reports', path: '/reports/attendance', icon: FileText },
  { label: 'Analytics', path: '/reports/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Header({ onMenuClick }) {
  const user = useAuthStore(s => s.user)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredLinks, setFilteredLinks] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = NAV_LINKS.filter(link => 
        link.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredLinks(filtered)
      setSearchOpen(true)
    } else {
      setFilteredLinks([])
      setSearchOpen(false)
    }
  }, [searchQuery])

  const getInitials = (user) => {
    if (!user) return 'AD'
    const first = user.first_name?.[0] ?? ''
    const last = user.last_name?.[0] ?? ''
    return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
  }

  return (
    <header className="header">
      {/* Left Section - Menu & Search */}
      <div className="hdr-left">
        <button className="hdr-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        
        {/* Search Bar */}
        <div className="hdr-search" ref={searchRef}>
          <Search size={14} className="hdr-search-icon" />
          <input
            type="text"
            className="hdr-search-input"
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setSearchOpen(true)}
          />
          <div className="hdr-search-shortcut">
            <span>⌘</span>
            <span>K</span>
          </div>
          
          {searchOpen && (
            <div className="hdr-search-dropdown">
              {filteredLinks.length > 0 ? (
                <div className="hdr-search-results">
                  <span className="hdr-search-section-title">Navigation</span>
                  {filteredLinks.map(link => (
                    <button 
                      key={link.path} 
                      className="hdr-search-result"
                      onClick={() => {
                        navigate(link.path)
                        setSearchQuery('')
                        setSearchOpen(false)
                      }}
                    >
                      <link.icon size={14} />
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="hdr-search-results">
                  <div className="hdr-search-empty">No results found</div>
                </div>
              ) : null}
            </div>
          )}
        </div>
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

        {/* Theme Toggle */}
        <button
          className="hdr-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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
