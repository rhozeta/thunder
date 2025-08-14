'use client'

import { useEffect, useState } from 'react'
import { DashboardService } from '@/services/dashboard'
import { TaskService } from '@/services/tasks'
import { useAuth } from '@/contexts/AuthContext'
import { Task } from '@/types/task'
import { Deal } from '@/types/deal'
import { AlertTriangle, Clock, CheckCircle, Plus, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface PriorityActionsProps {
  onAddTask?: () => void
  onAddContact?: () => void
  onAddDeal?: () => void
}

export default function PriorityActions({ onAddTask, onAddContact, onAddDeal }: PriorityActionsProps) {
  const { user } = useAuth()
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [hotDeals, setHotDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadPriorityData()
    }
  }, [user?.id])

  const loadPriorityData = async () => {
    try {
      setLoading(true)
      const [overdueData, hotDealsData, statsData] = await Promise.all([
        DashboardService.getOverdueTasks(user!.id),
        DashboardService.getHotDeals(user!.id),
        DashboardService.getDashboardStats(user!.id)
      ])
      
      setOverdueTasks(overdueData)
      setHotDeals(hotDealsData)
      setTodayTasks(statsData.todayEvents.tasks)
    } catch (error) {
      console.error('Error loading priority data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await TaskService.updateTask(taskId, { status: 'completed' })
      // Optimistic update
      setOverdueTasks(prev => prev.filter(task => task.id !== taskId))
      setTodayTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Add Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onAddContact}
            className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </button>
          <button
            onClick={onAddDeal}
            className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </button>
          <button
            onClick={onAddTask}
            className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Overdue Tasks</h3>
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              {overdueTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {overdueTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-red-600">Due: {formatDate(task.due_date!)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                    title="Mark as complete"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/dashboard/tasks?task=${task.id}`}
                    className="p-1 text-blue-600 hover:text-blue-700"
                    title="Edit task"
                  >
                    <Clock className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            {overdueTasks.length > 3 && (
              <Link
                href="/dashboard/tasks?filter=overdue"
                className="block text-center text-sm text-red-600 hover:text-red-700 font-medium"
              >
                View all {overdueTasks.length} overdue tasks →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {todayTasks.length}
          </span>
        </div>
        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.type || 'General'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                    title="Mark as complete"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/dashboard/tasks?task=${task.id}`}
                    className="p-1 text-blue-600 hover:text-blue-700"
                    title="Edit task"
                  >
                    <Clock className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            {todayTasks.length > 3 && (
              <Link
                href="/dashboard/calendar"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View full calendar →
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No tasks scheduled for today</p>
            <button
              onClick={onAddTask}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add a task →
            </button>
          </div>
        )}
      </div>

      {/* Hot Deals */}
      {hotDeals.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Hot Deals</h3>
            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              {hotDeals.length}
            </span>
          </div>
          <div className="space-y-3">
            {hotDeals.slice(0, 3).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{deal.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{formatCurrency(deal.price || 0)}</span>
                    {deal.expected_close_date && (
                      <span>Closes: {formatDate(deal.expected_close_date)}</span>
                    )}
                    {deal.probability && (
                      <span className="text-orange-600 font-medium">{deal.probability}% likely</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/deals/${deal.id}`}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  View →
                </Link>
              </div>
            ))}
            {hotDeals.length > 3 && (
              <Link
                href="/dashboard/deals?filter=hot"
                className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View all hot deals →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
