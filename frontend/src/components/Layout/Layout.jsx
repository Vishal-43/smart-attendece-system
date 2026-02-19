import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Header />
        <main className="layout__content">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
