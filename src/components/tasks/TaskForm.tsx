'use client'

import { useState } from 'react'
import { TaskInsert, TaskUpdate, TASK_PRIORITIES, TASK_STATUSES } from '@/types/task'
import { TaskService } from '@/services/tasks'
import { useAuth } from '@/contexts/AuthContext'

interface TaskFormProps {
  contactId?: string
  task?: any
  onSave: () => void
  onCancel: () => void
}

export function TaskForm({ contactId, task, onSave, onCancel }: TaskFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<TaskInsert>({
    title: task?.title || '',
    description: task?.description || null,
    due_date: task?.due_date || null,
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    contact_id: contactId || task?.contact_id || null,
    deal_id: task?.deal_id || null,
    assigned_user_id: task?.assigned_user_id || user?.id || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const taskData = {
        ...formData,
        assigned_user_id: user.id,
      }

      // Basic validation
      if (!taskData.title || taskData.title.trim().length === 0) {
        throw new Error('Title is required')
      }
      if (!taskData.assigned_user_id) {
        throw new Error('Assigned user is required')
      }

      // Helpful debug log
      console.log('Creating/updating task with payload:', taskData)

      if (task?.id) {
        await TaskService.updateTask(task.id, taskData)
      } else {
        await TaskService.createTask(taskData)
      }
      onSave()
    } catch (error: any) {
      // Surface more context to help debugging
      try {
        console.error('Error saving task:', error)
      } catch (_) {}
      const message = (error && (error.message || (typeof error === 'string' ? error : ''))) || 'Failed to save task'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'due_date' ? (value || null) : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TASK_PRIORITIES.map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TASK_STATUSES.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4">
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
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : task?.id ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
