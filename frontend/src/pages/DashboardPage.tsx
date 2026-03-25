/**
 * Dashboard — landing page after login.
 *
 * Replace this with your own dashboard content:
 * metrics, charts, recent activity, etc.
 */

import { useAuth } from '../auth/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-2">
        Welcome{user?.display_name ? `, ${user.display_name}` : ''}
      </h2>
      <p className="text-gray-400 mb-6">
        This is your dashboard. Customize it with metrics, charts, or recent activity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Getting Started</h3>
          <p className="text-white text-sm">
            Check out the Items page for a full CRUD example, then build your own features following the same pattern.
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Add a Resource</h3>
          <p className="text-white text-sm">
            Copy <code className="bg-gray-700 px-1 rounded text-xs">models/item.py</code> and <code className="bg-gray-700 px-1 rounded text-xs">routes/items.py</code> to create your own API endpoints.
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Deploy</h3>
          <p className="text-white text-sm">
            Push to main and GitHub Actions will deploy automatically. See <code className="bg-gray-700 px-1 rounded text-xs">.github/workflows/deploy.yml</code> for config.
          </p>
        </div>
      </div>
    </div>
  )
}
