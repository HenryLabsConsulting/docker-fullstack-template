/**
 * Authentication context provider.
 *
 * Token lifecycle:
 *   - On login: tokens stored in localStorage, user state updated
 *   - On page load: checks localStorage for existing token
 *   - On logout: clears localStorage and redirects to login
 *   - On 401: api.ts interceptor clears tokens automatically
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth()
 */

import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import api from '../api'

interface User {
  id: number
  email: string
  display_name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const { data } = await api.post('/api/auth/register', {
      email,
      password,
      display_name: displayName || '',
    })
    // Auto-login after registration
    localStorage.setItem('access_token', data.access_token || '')
    localStorage.setItem('user', JSON.stringify(data.user))
    if (data.access_token) {
      setUser(data.user)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && !!localStorage.getItem('access_token'),
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
