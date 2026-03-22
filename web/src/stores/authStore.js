import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const AUTH_STORAGE_KEY = 'auth-store'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      updateToken: (accessToken) => set({ accessToken }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, initialSnapshot, error) => {
        if (error) return
        if (state?.user && state?.accessToken) {
          useAuthStore.getState().set({
            isAuthenticated: true,
            user: state.user,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
          })
        }
      },
    }
  )
)
