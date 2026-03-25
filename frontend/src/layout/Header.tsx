/**
 * Top header bar displaying the current user.
 */

import { User } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-end px-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <User size={16} />
        <span>{user?.display_name || user?.email}</span>
        {user?.role === 'admin' && (
          <span className="px-1.5 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">
            admin
          </span>
        )}
      </div>
    </header>
  )
}
