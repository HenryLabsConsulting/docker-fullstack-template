/**
 * Application root — routing and layout.
 *
 * Route structure:
 *   /login     — public, login/register page
 *   /          — protected, dashboard
 *   /items     — protected, items CRUD
 *
 * To add a new page:
 *   1. Create a component in src/pages/ or src/yourfeature/
 *   2. Add a Route entry below inside the layout wrapper
 *   3. Add a NavLink in layout/Sidebar.tsx
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginPage from './auth/LoginPage'
import Sidebar from './layout/Sidebar'
import Header from './layout/Header'
import DashboardPage from './pages/DashboardPage'
import ItemsPage from './items/ItemsPage'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout><DashboardPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <AppLayout><ItemsPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
