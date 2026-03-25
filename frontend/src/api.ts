/**
 * Axios API client with JWT interceptor.
 *
 * WHY interceptor pattern:
 *   - Automatically attaches the JWT token to every request
 *   - Handles 401 responses globally (redirect to login)
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

// Response interceptor: handle 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored auth and redirect to login
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
