// uiStore.js - Global UI state management
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  document.body.setAttribute('data-theme', theme)
}

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      setTheme: (t) => {
        set({ theme: t })
        applyTheme(t)
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        applyTheme(next)
      },

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // Command Palette
      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      // Notifications
      notificationPanelOpen: false,
      toggleNotifications: () => set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),
      closeNotifications: () => set({ notificationPanelOpen: false }),

      // Drawer
      drawerOpen: false,
      drawerData: null,
      openDrawer: (type, record) => set({ drawerOpen: true, drawerData: { type, record } }),
      closeDrawer: () => set({ drawerOpen: false, drawerData: null }),

      // Toast queue
      toasts: [],
      addToast: (toast) => set((s) => ({
        toasts: [...s.toasts, { id: Date.now(), ...toast }]
      })),
      removeToast: (id) => set((s) => ({
        toasts: s.toasts.filter((t) => t.id !== id)
      })),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme)
      },
    }
  )
)
