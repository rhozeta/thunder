'use client'

import { useEffect, useState } from 'react'
import { DashboardService } from '@/services/dashboard'
import { TaskService } from '@/services/tasks'
import { AppointmentService } from '@/services/appointments'
import { useAuth } from '@/contexts/AuthContext'
import { Task } from '@/types/task'
import { Appointment } from '@/types/appointment'
import { Deal } from '@/types/deal'
import { AlertTriangle, Clock, CheckCircle, Plus, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { format, isToday, parseISO } from 'date-fns'

interface PriorityActionsProps {
  size?: 'small' | 'medium' | 'large'
  onAddTask?: () => void
  onAddContact?: () => void
  onAddDeal?: () => void
  onAddAppointment?: () => void
}

export default function PriorityActions({ size = 'medium', onAddTask, onAddContact, onAddDeal, onAddAppointment }: PriorityActionsProps) {
  const { user } = useAuth()
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
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
      const [overdueData, hotDealsData, statsData, appointmentsData] = await Promise.all([
        DashboardService.getOverdueTasks(user!.id),
        DashboardService.getHotDeals(user!.id),
        DashboardService.getDashboardStats(user!.id),
        AppointmentService.getAppointments(user!.id)
      ])
      
      setOverdueTasks(overdueData)
      setHotDeals(hotDealsData)
      setTodayTasks(statsData.todayEvents.tasks)
      
      // Filter appointments for today (using local timezone)
      const now = new Date()
      const todayString = now.toLocaleDateString('en-CA') // YYYY-MM-DD format in local timezone
      
      const todayAppointments = appointmentsData.filter((appointment: Appointment) => {
        if (!appointment.start_datetime) return false
        const appointmentDateString = appointment.start_datetime.split('T')[0]
        return appointmentDateString === todayString
      })
      setTodayAppointments(todayAppointments)
      
      // Debug logging
      console.log('PriorityActions Debug:', {
        currentDate: todayString,
        todayTasks: statsData.todayEvents.tasks,
        todayTasksCount: statsData.todayEvents.tasks?.length || 0,
        allAppointments: appointmentsData?.length || 0,
        todayAppointments: todayAppointments?.length || 0,
        appointmentDates: appointmentsData?.map(a => a.start_datetime?.split('T')[0]).filter(Boolean),
        userId: user?.id
      })
    } catch (error) {
      console.error('Error loading priority data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await TaskService.markTaskComplete(taskId)
      // Refresh data
      loadPriorityData()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  // Combine and sort today's tasks and appointments by time
  const getTodaysSchedule = () => {
    const scheduleItems: Array<{
      id: string
      title: string
      type: 'task' | 'appointment'
      time?: string
      priority?: string
      status?: string
      contact?: any
      deal?: any
      sortTime: number
    }> = []

    // Add tasks
    todayTasks.forEach(task => {
      scheduleItems.push({
        id: task.id,
        title: task.title,
        type: 'task',
        priority: task.priority,
        status: task.status,
        contact: task.contact,
        deal: task.deal,
        sortTime: 0 // Tasks without specific time go first
      })
    })

    // Add appointments
    todayAppointments.forEach(appointment => {
      const startTime = appointment.start_datetime ? parseISO(appointment.start_datetime) : new Date()
      scheduleItems.push({
        id: appointment.id,
        title: appointment.title,
        type: 'appointment',
        time: format(startTime, 'h:mm a'),
        contact: appointment.contact,
        deal: appointment.deal,
        sortTime: startTime.getTime()
      })
    })

    // Sort by time (tasks without time first, then appointments by start time)
    return scheduleItems.sort((a, b) => {
      if (a.sortTime === 0 && b.sortTime === 0) return 0
      if (a.sortTime === 0) return -1
      if (b.sortTime === 0) return 1
      return a.sortTime - b.sortTime
    })
  }

  const todaysSchedule = getTodaysSchedule()

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
    <div className="space-y-4">
      {/* Quick Add Actions - Always show but adapt layout */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className={`grid gap-2 ${size === 'small' ? 'grid-cols-1' : size === 'medium' ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <button
            onClick={onAddContact}
            className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Contact
          </button>
          <button
            onClick={onAddDeal}
            className="flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Deal
          </button>
          <button
            onClick={onAddTask}
            className="flex items-center justify-center p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </button>
          <button
            onClick={onAddAppointment}
            className="flex items-center justify-center p-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-sm"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Add Appointment
          </button>
        </div>
      </div>

      {/* Overdue Tasks - Priority 1: Always show if exists */}
      {overdueTasks.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Overdue Tasks</h3>
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              {overdueTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {overdueTasks.slice(0, size === 'small' ? 2 : 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{task.title}</p>
                  <p className="text-xs text-red-600">Due: {formatDate(task.due_date!)}</p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                    title="Mark as complete"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
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
            {overdueTasks.length > (size === 'small' ? 2 : 3) && (
              <Link
                href="/dashboard/tasks?filter=overdue"
                className="block text-center text-xs text-red-600 hover:text-red-700 font-medium"
              >
                View all {overdueTasks.length} overdue tasks →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Today's Schedule - Priority 2: Show for medium+ or if no overdue tasks */}
      {(size !== 'small' || overdueTasks.length === 0) && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center mb-3">
            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Today's Schedule</h3>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {todaysSchedule.length}
            </span>
          </div>
          {todaysSchedule.length > 0 ? (
            <div className="space-y-2">
              {todaysSchedule.slice(0, size === 'small' ? 1 : size === 'medium' ? 2 : 3).map((item) => (
                <div key={`${item.type}-${item.id}`} className={`flex items-center justify-between p-2 rounded-lg ${
                  item.type === 'appointment' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                      {item.time && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {item.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {item.type === 'appointment' ? 'Appointment' : (item.priority ? `${item.priority} priority` : 'Task')}
                      {item.contact && ` • ${item.contact.first_name} ${item.contact.last_name}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {item.type === 'task' && (
                      <button
                        onClick={() => handleCompleteTask(item.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Mark as complete"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                    <Link
                      href={item.type === 'appointment' ? `/dashboard/calendar?appointment=${item.id}` : `/dashboard/tasks?task=${item.id}`}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title={item.type === 'appointment' ? 'View appointment' : 'Edit task'}
                    >
                      <Clock className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
              {todaysSchedule.length > (size === 'small' ? 1 : size === 'medium' ? 2 : 3) && (
                <Link
                  href="/dashboard/calendar"
                  className="block text-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View full calendar →
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-3">
              <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-gray-500 text-sm">No tasks or appointments scheduled for today</p>
              <button
                onClick={onAddTask}
                className="mt-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Add a task →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hot Deals - Priority 3: Only show for large size or if critical deals exist */}
      {hotDeals.length > 0 && (size === 'large' || (size === 'medium' && hotDeals.some(deal => deal.probability && deal.probability > 80))) && (
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center mb-3">
            <DollarSign className="w-4 h-4 text-orange-600 mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Hot Deals</h3>
            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              {hotDeals.length}
            </span>
          </div>
          <div className="space-y-2">
            {hotDeals.slice(0, size === 'medium' ? 1 : 2).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{deal.title}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span>{formatCurrency(deal.price || 0)}</span>
                    {deal.probability && (
                      <span className="text-orange-600 font-medium">{deal.probability}%</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/deals/${deal.id}`}
                  className="text-orange-600 hover:text-orange-700 font-medium text-xs flex-shrink-0"
                >
                  View →
                </Link>
              </div>
            ))}
            {hotDeals.length > (size === 'medium' ? 1 : 2) && (
              <Link
                href="/dashboard/deals?filter=hot"
                className="block text-center text-xs text-orange-600 hover:text-orange-700 font-medium"
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
