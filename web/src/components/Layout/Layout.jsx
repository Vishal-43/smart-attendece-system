// Layout.jsx - Enterprise Professional Layout
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const handleMobileMenu = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className={`layout ${collapsed ? 'layout--collapsed' : ''}`}>
      <Sidebar 
        collapsed={collapsed} 
        onToggle={handleToggleSidebar}
        className={sidebarOpen ? 'sidebar--open' : ''}
      />
      <div className="layout__main">
        <Header onMenuClick={handleMobileMenu} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}