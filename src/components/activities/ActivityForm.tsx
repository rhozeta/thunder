'use client'

import { useState } from 'react'
import { CommunicationService } from '@/services/communications'
import { CommunicationType, CommunicationDirection, COMMUNICATION_TYPES, COMMUNICATION_DIRECTIONS } from '@/types/communication'
import { useAuth } from '@/contexts/AuthContext'

interface ActivityFormProps {
  contactId: string
  activity?: any
  onSuccess: () => void
  onCancel: () => void
}

export function ActivityForm({ contactId, activity, onSuccess, onCancel }: ActivityFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: activity?.type || 'call' as CommunicationType,
    direction: activity?.direction || 'outbound' as CommunicationDirection,
    subject: activity?.subject || '',
    content: activity?.content || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      if (activity?.id) {
        await CommunicationService.updateCommunication(activity.id, {
          ...formData,
          contact_id: contactId,
          user_id: user.id,
        })
      } else {
        await CommunicationService.createCommunication({
          ...formData,
          contact_id: contactId,
          user_id: user.id,
        })
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activity Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CommunicationType }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {COMMUNICATION_TYPES.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Direction
        </label>
        <select
          value={formData.direction}
          onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value as CommunicationDirection }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {COMMUNICATION_DIRECTIONS.map(direction => (
            <option key={direction} value={direction}>
              {direction.charAt(0).toUpperCase() + direction.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional subject"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : activity?.id ? 'Update Activity' : 'Create Activity'}
        </button>
      </div>
    </form>
  )
}
