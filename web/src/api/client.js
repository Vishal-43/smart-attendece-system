import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import API_CONFIG from '../config/api.js'

const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore.getState()
    const token = authStore.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore.getState()

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(`${API_CONFIG.BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: authStore.refreshToken,
        })

        const { access_token, refresh_token } = response.data.data || response.data
        authStore.setTokens(access_token, refresh_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        authStore.logout()
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
