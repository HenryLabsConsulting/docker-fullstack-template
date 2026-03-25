/**
 * Navigation sidebar.
 *
 * Simple vertical nav with links to each page and a logout button.
 * To add a new page: add a NavLink entry following the existing pattern.
 */

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function Sidebar() {
  const { logout } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-600/20 text-blue-400'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* App name */}
      <div className="px-4 py-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">MyApp</h1>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-3 space-y-1">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/items" className={linkClass}>
          <Package size={18} />
          Items
        </NavLink>
        {/* Add your own nav links here */}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
