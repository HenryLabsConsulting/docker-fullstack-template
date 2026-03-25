/**
 * Route guard — redirects unauthenticated users to login.
 *
 * Usage in App.tsx:
 *   <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
