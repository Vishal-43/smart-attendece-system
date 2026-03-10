import './GlassNavbar.module.css'

export default function GlassNavbar({ title = 'Smart Attendance', rightSlot }) {
  return (
    <header className="glass-navbar">
      <div className="glass-navbar__title">{title}</div>
      <div className="glass-navbar__right">{rightSlot}</div>
    </header>
  )
}
