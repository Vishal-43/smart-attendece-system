import { createContext, useContext, useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  // Apply theme when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Also apply on initial mount from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ui-store')
    let storedTheme = 'light'
    if (saved) {
      try {
        const { state } = JSON.parse(saved)
        if (state?.theme) storedTheme = state.theme
      } catch {}
    }
    document.documentElement.setAttribute('data-theme', storedTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
