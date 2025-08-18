'use client'

import { useEffect, useState } from 'react'
import { TaskService } from '@/services/tasks'
import { useAuth } from '@/contexts/AuthContext'
import { Task } from '@/types/task'
import { CheckSquare, Clock, AlertTriangle, BarChart3, Plus } from 'lucide-react'
import Link from 'next/link'

interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  overdue: number
  unscheduled: number
  typeBreakdown: { [key: string]: number }
}

interface TaskManagementHubProps {
  size?: 'small' | 'medium' | 'large'
  onAddTask?: () => void
}

export default function TaskManagementHub({ size = 'medium', onAddTask }: TaskManagementHubProps) {
  const { user } = useAuth()
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadTaskData()
    }
  }, [user?.id])

  const loadTaskData = async () => {
    try {
      setLoading(true)
      const tasks = await TaskService.getTasksByUser(user!.id)
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const stats: TaskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        overdue: tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'completed').length,
        unscheduled: tasks.filter(t => !t.due_date && t.status !== 'completed').length,
        typeBreakdown: {}
      }

      // Calculate type breakdown
      tasks.forEach(task => {
        const type = task.type || 'General'
        stats.typeBreakdown[type] = (stats.typeBreakdown[type] || 0) + 1
      })

      setTaskStats(stats)
      setRecentTasks(tasks.slice(0, 5))
    } catch (error) {
      console.error('Error loading task data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await TaskService.updateTask(taskId, { status: 'completed' })
      // Optimistic update
      setRecentTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' as const } : task
      ))
      if (taskStats) {
        setTaskStats(prev => prev ? {
          ...prev,
          completed: prev.completed + 1,
          pending: prev.pending - 1
        } : null)
      }
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const getTaskStatusColor = (task: Task) => {
    if (task.status === 'completed') return 'text-green-600'
    if (task.due_date && task.due_date < new Date().toISOString().split('T')[0]) return 'text-red-600'
    if (task.status === 'in_progress') return 'text-blue-600'
    return 'text-gray-600'
  }

  const getTaskStatusIcon = (task: Task) => {
    if (task.status === 'completed') return <CheckSquare className="w-4 h-4 text-green-600" />
    if (task.due_date && task.due_date < new Date().toISOString().split('T')[0]) return <AlertTriangle className="w-4 h-4 text-red-600" />
    return <Clock className="w-4 h-4 text-gray-600" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const completionRate = taskStats ? (taskStats.completed / taskStats.total * 100) : 0

  return (
    <div className="space-y-4">
      {/* Task Statistics - Priority 1: Always show but compact for small */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Task Overview</h3>
          <Link 
            href="/dashboard/tasks"
            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
          >
            View All →
          </Link>
        </div>

        {/* Quick Stats - Responsive layout */}
        <div className={`grid gap-3 mb-4 ${
          size === 'small' ? 'grid-cols-2' : 
          size === 'medium' ? 'grid-cols-2 lg:grid-cols-4' : 
          'grid-cols-4'
        }`}>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className={`font-bold text-blue-600 ${size === 'small' ? 'text-lg' : 'text-2xl'}`}>{taskStats?.total || 0}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className={`font-bold text-green-600 ${size === 'small' ? 'text-lg' : 'text-2xl'}`}>{taskStats?.completed || 0}</p>
            <p className="text-xs text-gray-600">Done</p>
          </div>
          {size !== 'small' && (
            <>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{taskStats?.pending || 0}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{taskStats?.overdue || 0}</p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </>
          )}
        </div>

        {/* Completion Rate - Show for medium+ */}
        {size !== 'small' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Rate</span>
              <span className="text-sm text-gray-600">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Unscheduled Tasks Alert - Always show if exists */}
        {(taskStats?.unscheduled || 0) > 0 && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-3 h-3 text-yellow-600 mr-2" />
              <span className="text-xs font-medium text-yellow-800">
                {taskStats?.unscheduled} unscheduled
              </span>
              <Link
                href="/dashboard/tasks?filter=unscheduled"
                className="ml-auto text-yellow-600 hover:text-yellow-700 text-xs font-medium"
              >
                Schedule →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Task Types Breakdown - Priority 2: Show for medium+ */}
      {size !== 'small' && taskStats && Object.keys(taskStats.typeBreakdown).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-4 h-4 text-purple-600 mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Task Categories</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(taskStats.typeBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, size === 'medium' ? 3 : 5)
              .map(([type, count]) => {
                const percentage = (count / taskStats.total) * 100
                return (
                  <div key={type} className="flex items-center">
                    <div className="w-20 text-xs text-gray-600 text-right mr-2 truncate">
                      {type}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all duration-300 flex items-center justify-between px-2"
                        style={{ width: `${Math.max(percentage, 10)}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {count}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 text-xs text-gray-600 text-right ml-2">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Recent Tasks - Priority 3: Show for large or if no other content */}
      {(size === 'large' || (size === 'medium' && (!taskStats || Object.keys(taskStats.typeBreakdown).length === 0))) && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Recent Tasks</h3>
            <button
              onClick={onAddTask}
              className="flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Task
            </button>
          </div>

          {recentTasks.length > 0 ? (
            <div className="space-y-2">
              {recentTasks.slice(0, size === 'medium' ? 2 : 4).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getTaskStatusIcon(task)}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm ${getTaskStatusColor(task)}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{task.type || 'General'}</span>
                        {task.due_date && (
                          <>
                            <span>•</span>
                            <span>Due: {formatDate(task.due_date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Mark as complete"
                      >
                        <CheckSquare className="w-3 h-3" />
                      </button>
                    )}
                    <Link
                      href={`/dashboard/tasks?task=${task.id}`}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Edit task"
                    >
                      <Clock className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckSquare className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-gray-500 mb-2 text-sm">No tasks yet</p>
              <button
                onClick={onAddTask}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Create your first task →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
