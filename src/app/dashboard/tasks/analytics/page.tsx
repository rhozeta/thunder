'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TaskService } from '@/services/tasks'
import { Task } from '@/types/task'
import { 
  Target, 
  CheckSquare, 
  AlertCircle, 
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Users,
  Briefcase
} from 'lucide-react'
import { isPast, isToday, format } from 'date-fns'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { StatusChip } from '@/components/ui/StatusChip'
import { getTaskTypeColor, STATUS_COLORS, PRIORITY_COLORS } from '@/utils/taskColors'
import { getStatusDisplayName, getPriorityDisplayName } from '@/utils/taskHelpers'

export default function TaskAnalyticsPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [user])

  const loadTasks = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const fetchedTasks = await TaskService.getTasksByUser(user.id)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const cancelled = tasks.filter(t => t.status === 'cancelled').length
    const overdue = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && t.status !== 'completed').length
    const dueToday = tasks.filter(t => t.due_date && isToday(new Date(t.due_date)) && t.status !== 'completed').length
    
    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    }

    const byType = tasks.reduce((acc, task) => {
      const type = task.type || 'No Type'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const withContacts = tasks.filter(t => t.contact_id).length
    const withDeals = tasks.filter(t => t.deal_id).length
    
    return {
      total,
      completed,
      pending,
      inProgress,
      cancelled,
      overdue,
      dueToday,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority,
      byType,
      withContacts,
      withDeals
    }
  }, [tasks])

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks', href: '/dashboard/tasks' },
    { label: 'Analytics', href: '/dashboard/tasks/analytics' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Insights and metrics for your task management
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BarChart3 className="w-5 h-5" />
          <span>Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
        </div>
      </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    <dd className="text-lg font-medium text-gray-900">{taskStats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckSquare className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{taskStats.completed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                    <dd className="text-lg font-medium text-gray-900">{taskStats.overdue}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{taskStats.completionRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Due Today</dt>
                    <dd className="text-lg font-medium text-gray-900">{taskStats.dueToday}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">With Contacts</dt>
                    <dd className="text-lg font-medium text-gray-900">{taskStats.withContacts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-teal-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">With Deals</dt>
                    <dd className="text-lg font-medium text-gray-900">{taskStats.withDeals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Status Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getStatusDisplayName('pending')}
                    {...STATUS_COLORS.pending}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.pending / taskStats.total) * 100 : 0}%`,
                          backgroundColor: STATUS_COLORS.pending.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.pending}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getStatusDisplayName('in_progress')}
                    {...STATUS_COLORS.in_progress}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.inProgress / taskStats.total) * 100 : 0}%`,
                          backgroundColor: STATUS_COLORS.in_progress.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.inProgress}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getStatusDisplayName('completed')}
                    {...STATUS_COLORS.completed}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%`,
                          backgroundColor: STATUS_COLORS.completed.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.completed}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getStatusDisplayName('cancelled')}
                    {...STATUS_COLORS.cancelled}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.cancelled / taskStats.total) * 100 : 0}%`,
                          backgroundColor: STATUS_COLORS.cancelled.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.cancelled}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Priority Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getPriorityDisplayName('urgent')}
                    {...PRIORITY_COLORS.urgent}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.byPriority.urgent / taskStats.total) * 100 : 0}%`,
                          backgroundColor: PRIORITY_COLORS.urgent.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.byPriority.urgent}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getPriorityDisplayName('high')}
                    {...PRIORITY_COLORS.high}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.byPriority.high / taskStats.total) * 100 : 0}%`,
                          backgroundColor: PRIORITY_COLORS.high.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.byPriority.high}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getPriorityDisplayName('medium')}
                    {...PRIORITY_COLORS.medium}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.byPriority.medium / taskStats.total) * 100 : 0}%`,
                          backgroundColor: PRIORITY_COLORS.medium.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.byPriority.medium}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusChip
                    value={getPriorityDisplayName('low')}
                    {...PRIORITY_COLORS.low}
                    size="sm"
                  />
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.byPriority.low / taskStats.total) * 100 : 0}%`,
                          backgroundColor: PRIORITY_COLORS.low.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.byPriority.low}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Types Distribution */}
        {Object.keys(taskStats.byType).length > 0 && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Task Types Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(taskStats.byType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => {
                    const typeColor = type === 'No Type' ? '#6B7280' : getTaskTypeColor(type)
                    return (
                      <div key={type} className="flex items-center justify-between">
                        {type === 'No Type' ? (
                          <span className="text-sm text-gray-500 italic">No Type</span>
                        ) : (
                          <StatusChip
                            value={type}
                            color={typeColor}
                            bgColor={`${typeColor}15`}
                            textColor={typeColor}
                            size="sm"
                          />
                        )}
                        <div className="flex items-center ml-4">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${taskStats.total > 0 ? (count / taskStats.total) * 100 : 0}%`,
                                backgroundColor: typeColor
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
