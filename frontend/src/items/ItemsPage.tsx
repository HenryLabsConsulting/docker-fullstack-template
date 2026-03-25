/**
 * Items page — full CRUD example.
 *
 * Demonstrates the pattern for building a data management page:
 *   - Fetch data from API on mount
 *   - List with loading/empty states
 *   - Create and edit via modal form
 *   - Delete with confirmation
 *   - Owner-scoped (each user sees only their items)
 */

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Archive, Loader2 } from 'lucide-react'
import api from '../api'
import ItemForm from './ItemForm'

interface Item {
  id: number
  name: string
  description: string
  status: string
  owner_id: number
  created_at: string
  updated_at: string
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get('/api/items')
      setItems(data.data)
    } catch {
      console.error('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/items/${id}`)
      setItems(items.filter(i => i.id !== id))
      setDeleteConfirm(null)
    } catch {
      console.error('Failed to delete item')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const handleFormSave = () => {
    handleFormClose()
    fetchItems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Items</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No items yet. Create your first one.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Create Item
          </button>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-start justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-medium truncate">{item.name}</h3>
                {item.status === 'archived' && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                    <Archive size={12} />
                    archived
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-gray-400 text-sm truncate">{item.description}</p>
              )}
              <p className="text-gray-600 text-xs mt-1">
                Created {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => { setEditingItem(item); setShowForm(true) }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <Pencil size={16} />
              </button>

              {deleteConfirm === item.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit form modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  )
}
