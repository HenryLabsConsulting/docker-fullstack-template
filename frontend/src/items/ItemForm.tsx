/**
 * Item create/edit form — reusable modal component.
 *
 * Props:
 *   - item: null for create, existing item for edit
 *   - onClose: called when form is dismissed
 *   - onSave: called after successful save (parent should refresh list)
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import api from '../api'

interface Item {
  id: number
  name: string
  description: string
  status: string
}

interface ItemFormProps {
  item: Item | null
  onClose: () => void
  onSave: () => void
}

export default function ItemForm({ item, onClose, onSave }: ItemFormProps) {
  const [name, setName] = useState(item?.name || '')
  const [description, setDescription] = useState(item?.description || '')
  const [status, setStatus] = useState(item?.status || 'active')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEdit = !!item

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (name.length > 200) {
      setError('Name must be 200 characters or fewer')
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/api/items/${item.id}`, { name, description, status })
      } else {
        await api.post('/api/items', { name, description, status })
      }
      onSave()
    } catch {
      setError(isEdit ? 'Failed to update item' : 'Failed to create item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-medium">
            {isEdit ? 'Edit Item' : 'New Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Item name"
              maxLength={200}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 text-white text-sm rounded transition-colors"
            >
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
