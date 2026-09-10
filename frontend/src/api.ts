/**
 * Axios API client with JWT interceptor.
 *
 * WHY interceptor pattern:
 *   - Automatically attaches the JWT token to every request
 *   - Handles 401 responses globally (refresh + retry, then redirect to login)
 *   - Single place to configure base URL, headers, error handling
 *
 * Usage in components:
 *   import api from './api'
 *   const { data } = await api.get('/api/items')
 */

import axios from 'axios'

const api = axios.create({
  // In Docker dev, Vite proxies /api to the backend container.
  // No baseURL needed — requests go to the same origin.
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function clearAuthAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

// Response interceptor: handle 401 (expired access token).
// First try to exchange the stored refresh token for a new access token and
// retry the original request once; only redirect to login if that fails too.
// The refresh call uses bare axios — going through `api` would attach the
// expired access token via the request interceptor above.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        original._retry = true
        try {
          const { data } = await axios.post(
            '/api/auth/refresh',
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          )
          localStorage.setItem('access_token', data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          // Refresh token rejected/expired — fall through to logout
        }
      }
      clearAuthAndRedirect()
    }
    return Promise.reject(error)
  }
)

export default api
