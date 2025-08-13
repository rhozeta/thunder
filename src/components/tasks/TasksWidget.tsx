'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Task } from '@/types/task'
import { TaskService } from '@/services/tasks'

function isDueWithinFiveDays(due: string | null): boolean {
  if (!due) return false
  const today = new Date()
  const dueDate = new Date(due)
  // normalize to start of day for both
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 5)
  return dueDate >= start && dueDate <= end
}

export default function TasksWidget() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'dueSoon'>('all')

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      setLoading(true)
      setError(null)
      try {
        const data = await TaskService.getTasksByUser(user.id)
        setTasks(data)
      } catch (e: any) {
        console.error('Error loading tasks for widget:', e)
        setError(e?.message || 'Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const dueSoonTasks = useMemo(() => tasks.filter(t => isDueWithinFiveDays(t.due_date || null)), [tasks])
  const displayed = activeTab === 'all' ? tasks : dueSoonTasks

  return (
    <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border rounded-l-md ${activeTab === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dueSoon')}
            className={`px-4 py-2 text-sm font-medium border rounded-r-md -ml-px ${activeTab === 'dueSoon' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Next 5 Days ({dueSoonTasks.length})
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-600">Loading tasks…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-gray-200">
          {displayed.length === 0 && (
            <li className="py-4 text-gray-500">No tasks to show.</li>
          )}
          {displayed.map((t) => (
            <li key={t.id} className="py-3 flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{t.title}</p>
                {t.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.description}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  <span className="capitalize">Priority: {t.priority}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">Status: {t.status}</span>
                  {t.due_date && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
