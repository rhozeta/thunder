'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TaskService } from '@/services/tasks'
import { Task, TaskStatus } from '@/types/task'
import { AppointmentService } from '@/services/appointments'
import { Appointment, AppointmentStatus } from '@/types/appointment'
import { ContactService } from '@/services/contacts'
import { TaskMobileCard } from '@/components/tasks/TaskMobileCard'
import { DealService } from '@/services/deals'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DroppableColumn } from '@/components/tasks/DroppableColumn'
import { FlexibleDroppableColumn } from '@/components/tasks/FlexibleDroppableColumn'
import { DraggableAppointmentCard } from '@/components/tasks/DraggableAppointmentCard'
import { TaskSidebar } from '@/components/tasks/TaskSidebar'
import { DraggableTaskCard } from '@/components/tasks/DraggableTaskCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { 
  getTaskTypeColor, 
  STATUS_COLORS, 
  PRIORITY_COLORS,
  getStatusDisplayName,
  getPriorityDisplayName
} from '@/utils/taskColors'
import { 
  Plus, 
  Search, 
  Filter, 
  Table, 
  Columns, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  CheckSquare, 
  Calendar,
  BarChart3,
  Eye,
  Undo,
  Briefcase,
  ExternalLink,
  SortAsc,
  SortDesc,
  Settings
} from 'lucide-react'
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'

type SortField = 'due_date' | 'priority' | 'status' | 'title' | 'created_at' | 'type'
type SortDirection = 'asc' | 'desc'
type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent'
type FilterDueDate = 'all' | 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'future'
type FilterContact = 'all' | string
type FilterDeal = 'all' | string

type TabType = 'all' | 'tasks' | 'appointments'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [contacts, setContacts] = useState<Array<{id: string, first_name: string, last_name: string}>>([])
  const [deals, setDeals] = useState<Array<{id: string, title: string}>>([])
  const [loading, setLoading] = useState(true)
  const [showTaskSidebar, setShowTaskSidebar] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [tasksSwimLaneCollapsed, setTasksSwimLaneCollapsed] = useState(false)
  const [appointmentsSwimLaneCollapsed, setAppointmentsSwimLaneCollapsed] = useState(false)
  const [hiddenTaskColumns, setHiddenTaskColumns] = useState<TaskStatus[]>([])
  const [hiddenAppointmentColumns, setHiddenAppointmentColumns] = useState<AppointmentStatus[]>([])
  const [visibleTaskColumns, setVisibleTaskColumns] = useState<Record<TaskStatus, boolean>>({
    pending: true,
    in_progress: true,
    completed: true,
    cancelled: true
  })
  const [visibleAppointmentColumns, setVisibleAppointmentColumns] = useState<Record<AppointmentStatus, boolean>>({
    scheduled: true,
    confirmed: true,
    in_progress: true,
    completed: true,
    cancelled: true,
    no_show: true
  })
  const [showColumnVisibility, setShowColumnVisibility] = useState(false)
  const [taskColumnField, setTaskColumnField] = useState<string>('status')
  const [appointmentColumnField, setAppointmentColumnField] = useState<string>('status')
  const [showTaskFieldSelector, setShowTaskFieldSelector] = useState(false)
  const [showAppointmentFieldSelector, setShowAppointmentFieldSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('due_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const [filterDueDate, setFilterDueDate] = useState<FilterDueDate>('all')
  const [filterContact, setFilterContact] = useState<FilterContact>('all')
  const [filterDeal, setFilterDeal] = useState<FilterDeal>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null)
  const [dateSortDirection, setDateSortDirection] = useState<'asc' | 'desc'>('asc')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    if (user) {
      loadTasks()
      loadAppointments()
      loadContacts()
      loadDeals()
    }
  }, [user])

  const loadTasks = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await TaskService.getTasksByUser(user.id)
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    if (!user) return
    try {
      const data = await AppointmentService.getAppointments(user.id)
      setAppointments(data || [])
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    }
  }

  const loadContacts = async () => {
    if (!user) return
    try {
      const data = await ContactService.getContacts(user.id, 1000)
      setContacts(data.map(c => ({ id: c.id, first_name: c.first_name, last_name: c.last_name })))
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadDeals = async () => {
    if (!user) return
    try {
      const data = await DealService.getDeals(user.id, 1000)
      setDeals(data.map(d => ({ id: d.id, title: d.title })))
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }



  // Filter and sort tasks and appointments based on active tab
  const filteredAndSortedItems = useMemo(() => {
    // Combine tasks and appointments based on active tab
    let items: (Task | Appointment)[] = []
    
    if (activeTab === 'all') {
      items = [...tasks, ...appointments]
    } else if (activeTab === 'tasks') {
      items = tasks
    } else if (activeTab === 'appointments') {
      items = appointments
    }

    let filtered = items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.contact && `${item.contact.first_name} ${item.contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      
      // Priority filter only applies to tasks
      const matchesPriority = filterPriority === 'all' || 
        ('priority' in item ? item.priority === filterPriority : true)
      
      let matchesDueDate = true
      if (filterDueDate !== 'all') {
        // For tasks, use due_date; for appointments, use start_datetime
        const dateToCheck = 'due_date' in item ? item.due_date : 
                           'start_datetime' in item ? item.start_datetime : null
        
        if (!dateToCheck) {
          matchesDueDate = filterDueDate === 'future'
        } else {
          const checkDate = new Date(dateToCheck)
          const now = new Date()
          
          switch (filterDueDate) {
            case 'overdue':
              matchesDueDate = isPast(checkDate) && item.status !== 'completed'
              break
            case 'today':
              matchesDueDate = isToday(checkDate)
              break
            case 'tomorrow':
              matchesDueDate = isTomorrow(checkDate)
              break
            case 'this_week':
              matchesDueDate = isThisWeek(checkDate)
              break
            case 'future':
              matchesDueDate = checkDate > now
              break
            default:
              matchesDueDate = true
          }
        }
      }

      const matchesContact = filterContact === 'all' || item.contact_id === filterContact
      const matchesDeal = filterDeal === 'all' || item.deal_id === filterDeal

      return matchesSearch && matchesStatus && matchesPriority && matchesDueDate && matchesContact && matchesDeal
    })

    // Sort items (tasks and appointments)
    filtered.sort((a: Task | Appointment, b: Task | Appointment) => {
      let aValue: any
      let bValue: any
      
      switch (sortField) {
        case 'due_date':
          // For tasks use due_date, for appointments use start_datetime
          aValue = ('due_date' in a && a.due_date) ? new Date(a.due_date).getTime() : 
                   ('start_datetime' in a && a.start_datetime) ? new Date(a.start_datetime).getTime() : 0
          bValue = ('due_date' in b && b.due_date) ? new Date(b.due_date).getTime() : 
                   ('start_datetime' in b && b.start_datetime) ? new Date(b.start_datetime).getTime() : 0
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
          aValue = ('priority' in a) ? priorityOrder[a.priority as keyof typeof priorityOrder] || 0 : 0
          bValue = ('priority' in b) ? priorityOrder[b.priority as keyof typeof priorityOrder] || 0 : 0
          break
        case 'status':
          const statusOrder = { pending: 1, in_progress: 2, completed: 3, cancelled: 4, scheduled: 1 }
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'type':
          // For tasks use type, for appointments use appointment_type
          aValue = ('type' in a) ? a.type || '' : ('appointment_type' in a) ? a.appointment_type || '' : ''
          bValue = ('type' in b) ? b.type || '' : ('appointment_type' in b) ? b.appointment_type || '' : ''
          break
        default:
          aValue = (a as any)[sortField] || ''
          bValue = (b as any)[sortField] || ''
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [tasks, appointments, activeTab, searchQuery, sortField, sortDirection, filterStatus, filterPriority, filterDueDate, filterContact, filterDeal])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleItemClick = (item: Task | Appointment) => {
    if ('due_date' in item) {
      // It's a task
      setSelectedTask(item)
      setSelectedAppointment(null)
    } else {
      // It's an appointment
      setSelectedAppointment(item)
      setSelectedTask(null)
    }
    setShowTaskSidebar(true)
  }

  const renderMobileCard = (item: Task | Appointment) => {
    const isTask = 'due_date' in item
    
    if (isTask) {
      return (
        <TaskMobileCard
          key={item.id}
          task={item}
          onEdit={(task) => {
            setSelectedTask(task)
            setSelectedAppointment(null)
            setShowTaskSidebar(true)
          }}
          onDelete={handleTaskDelete}
          onComplete={handleTaskComplete}
          onUndo={handleTaskUndo}
          onStatusChange={handleTaskStatusChange}
        />
      )
    } else {
      // For appointments, we'll need to create a similar card or adapt the existing one
      // For now, let's create a simple appointment card
      return (
        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
              {item.description && (
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span>📅 {item.start_datetime ? format(new Date(item.start_datetime), 'MMM dd, yyyy HH:mm') : 'No date'}</span>
                {item.location && <span>📍 {item.location}</span>}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedAppointment(item)
                setSelectedTask(null)
                setShowTaskSidebar(true)
              }}
              className="text-blue-600 hover:text-blue-900 text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      )
    }
  }

  const renderTableRow = (item: Task | Appointment) => {
    const isTask = 'due_date' in item
    const displayDate = isTask 
      ? (item.due_date ? format(new Date(item.due_date + 'T00:00:00'), 'MMM dd, yyyy') : 'No due date')
      : (item.start_datetime ? format(new Date(item.start_datetime), 'MMM dd, yyyy HH:mm') : 'No date')
    
    const displayType = isTask 
      ? item.type 
      : item.appointment_type

    return (
      <tr key={item.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">{item.title}</div>
            {item.description && (
              <div className="text-sm text-gray-500 truncate max-w-[120px]">
                {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isTask ? (
            <StatusChip
              value={getPriorityDisplayName((item as Task).priority)}
              {...PRIORITY_COLORS[(item as Task).priority as keyof typeof PRIORITY_COLORS]}
            />
          ) : (
            <span className="text-gray-400 text-xs">N/A</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusChip
            value={getStatusDisplayName(item.status)}
            {...STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {displayType ? (
            <StatusChip
              value={displayType}
              color={getTaskTypeColor(displayType)}
              bgColor={`${getTaskTypeColor(displayType)}15`}
              textColor={getTaskTypeColor(displayType)}
            />
          ) : (
            <span className="text-gray-400 text-xs">No type</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {displayDate}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {item.contact ? (
            <Link 
              href={`/dashboard/contacts/${item.contact.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {item.contact.first_name} {item.contact.last_name}
            </Link>
          ) : (
            <span className="text-gray-400">No contact</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {item.deal ? (
            <Link 
              href={`/dashboard/deals/${item.deal.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {item.deal.title}
            </Link>
          ) : (
            <span className="text-gray-400">No deal</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => handleItemClick(item)}
            className="text-blue-600 hover:text-blue-900 mr-4"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (isTask) {
                // Handle task deletion
                console.log('Delete task:', item.id)
              } else {
                // Handle appointment deletion
                console.log('Delete appointment:', item.id)
              }
            }}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </td>
      </tr>
    )
  }

  const handleTaskComplete = async (taskId: string) => {
    if (!user) return
    try {
      await TaskService.updateTask(taskId, { status: 'completed' })
      loadTasks()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleTaskUndo = async (taskId: string) => {
    try {
      await TaskService.updateTask(taskId, { status: 'pending' })
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'pending' as TaskStatus } : task
      ))
    } catch (error) {
      console.error('Error undoing task:', error)
    }
  }

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    try {
      await TaskService.updateTask(taskId, { status: status as TaskStatus })
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: status as TaskStatus } : task
      ))
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await TaskService.deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string
    
    // Check if it's a task or appointment
    const task = tasks.find(t => t.id === activeId)
    const appointment = appointments.find(a => a.id === activeId)
    
    if (task) {
      setActiveTask(task)
      setActiveAppointment(null)
    } else if (appointment) {
      setActiveAppointment(appointment)
      setActiveTask(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveAppointment(null)

    if (!over) return

    const itemId = active.id as string
    const task = tasks.find(t => t.id === itemId)
    const appointment = appointments.find(a => a.id === itemId)
    
    if (!task && !appointment) return

    if (task) {
      // Handle task drag-and-drop
      const field = taskColumnField
      const validValues = getTaskColumnValues(field)
      let newFieldValue: any
      let newSortOrder: number | undefined
      
      // Check if we dropped on a column or on another task
      if (validValues.includes(over.id as string)) {
        // Dropped on a column
        newFieldValue = over.id
        // When dropping on a column, put it at the end
        const columnTasks = tasks.filter(t => getItemFieldValue(t, field) === newFieldValue && t.id !== itemId)
        newSortOrder = columnTasks.length > 0 ? Math.max(...columnTasks.map(t => t.sort_order || 0)) + 1 : 0
      } else {
        // Dropped on another task - find the field value and position of the target task
        const targetTask = tasks.find(t => t.id === over.id)
        if (targetTask) {
          newFieldValue = getItemFieldValue(targetTask, field)
          // Insert before the target task
          const columnTasks = tasks.filter(t => getItemFieldValue(t, field) === newFieldValue && t.id !== itemId)
          const targetIndex = columnTasks.findIndex(t => t.id === targetTask.id)
          
          if (targetIndex === 0) {
            // Insert at the beginning
            newSortOrder = Math.max(0, (targetTask.sort_order || 0) - 1)
          } else {
            // Insert between tasks
            const prevTask = columnTasks[targetIndex - 1]
            const prevOrder = prevTask?.sort_order || 0
            const targetOrder = targetTask.sort_order || 0
            newSortOrder = (prevOrder + targetOrder) / 2
          }
        } else {
          // Fallback - keep the same field value (just reordering within column)
          newFieldValue = getItemFieldValue(task, field)
          return // No change needed
        }
      }

      // Check if anything actually changed
      const fieldChanged = getItemFieldValue(task, field) !== newFieldValue
      const orderChanged = newSortOrder !== undefined && Math.abs((task.sort_order || 0) - newSortOrder) > 0.001
      
      if (!fieldChanged && !orderChanged) return

      // Optimistically update the UI
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === itemId 
            ? { 
                ...t, 
                [field]: newFieldValue,
                sort_order: newSortOrder !== undefined ? newSortOrder : t.sort_order,
                updated_at: new Date().toISOString() 
              }
            : t
        )
      )

      try {
        const updateData: any = { [field]: newFieldValue }
        if (newSortOrder !== undefined) {
          updateData.sort_order = newSortOrder
        }
        
        await TaskService.updateTask(itemId, updateData)
      } catch (error) {
        console.error('Error updating task:', error)
        
        // Revert the optimistic update
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === itemId 
              ? { ...t, [field]: getItemFieldValue(task, field) }
              : t
          )
        )
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to update task. Please try again.'
        alert(`Error updating task: ${errorMessage}`)
      }
    } else if (appointment) {
      // Handle appointment drag-and-drop
      const field = appointmentColumnField
      const validValues = getAppointmentColumnValues(field)
      let newFieldValue: any
      
      // Check if we dropped on an appointment column
      if (validValues.includes(over.id as string)) {
        newFieldValue = over.id
      } else {
        // Dropped on another appointment - find the field value of the target appointment
        const targetAppointment = appointments.find(a => a.id === over.id)
        if (targetAppointment) {
          newFieldValue = getItemFieldValue(targetAppointment, field)
        } else {
          // Fallback - keep the same field value
          newFieldValue = getItemFieldValue(appointment, field)
          return // No change needed
        }
      }

      // Check if field value actually changed
      if (getItemFieldValue(appointment, field) === newFieldValue) return

      // Optimistically update the UI
      setAppointments(prevAppointments => 
        prevAppointments.map(a => 
          a.id === itemId 
            ? { 
                ...a, 
                [field]: newFieldValue,
                updated_at: new Date().toISOString() 
              }
            : a
        )
      )

      try {
        console.log('Updating appointment:', { itemId, field, newFieldValue, appointment })
        await AppointmentService.updateAppointment(itemId, { [field]: newFieldValue })
        console.log('Appointment updated successfully')
        // Reload appointments to ensure UI is in sync
        loadAppointments()
      } catch (error) {
        console.error('Error updating appointment:', error)
        
        // Revert the optimistic update
        setAppointments(prevAppointments => 
          prevAppointments.map(a => 
            a.id === itemId 
              ? { ...a, [field]: getItemFieldValue(appointment, field) }
              : a
          )
        )
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to update appointment. Please try again.'
        alert(`Error updating appointment: ${errorMessage}`)
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Helper function to get dynamic column values for tasks
  const getTaskColumnValues = (field: string) => {
    switch (field) {
      case 'status':
        return ['pending', 'in_progress', 'completed', 'cancelled']
      case 'priority':
        return ['urgent', 'high', 'medium', 'low']
      case 'type':
        return [...new Set(tasks.map(t => t.type).filter(Boolean))]
      case 'contact_id':
        return [...new Set(tasks.map(t => t.contact_id).filter(Boolean))]
      case 'deal_id':
        return [...new Set(tasks.map(t => t.deal_id).filter(Boolean))]
      default:
        return []
    }
  }

  // Helper function to get dynamic column values for appointments
  const getAppointmentColumnValues = (field: string) => {
    switch (field) {
      case 'status':
        return ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
      case 'priority':
        return ['urgent', 'high', 'medium', 'low']
      case 'appointment_type':
        return [...new Set(appointments.map(a => a.appointment_type).filter(Boolean))]
      case 'contact_id':
        return [...new Set(appointments.map(a => a.contact_id).filter(Boolean))]
      case 'deal_id':
        return [...new Set(appointments.map(a => a.deal_id).filter(Boolean))]
      default:
        return []
    }
  }

  // Helper function to get display name for field values
  const getFieldDisplayName = (field: string, value: string) => {
    switch (field) {
      case 'contact_id':
        const contact = contacts.find(c => c.id === value)
        return contact ? `${contact.first_name} ${contact.last_name}` : value
      case 'deal_id':
        const deal = deals.find(d => d.id === value)
        return deal ? deal.title : value
      default:
        return value?.replace('_', ' ') || 'None'
    }
  }

  // Helper function to get item field value
  const getItemFieldValue = (item: Task | Appointment, field: string) => {
    switch (field) {
      case 'status':
        return item.status
      case 'priority':
        return 'priority' in item ? item.priority : null
      case 'type':
        return 'type' in item ? item.type : item.appointment_type
      case 'appointment_type':
        return 'appointment_type' in item ? item.appointment_type : null
      case 'contact_id':
        return item.contact_id
      case 'deal_id':
        return item.deal_id
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'In Progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Tasks' }
        ]}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your tasks and track progress
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/dashboard/tasks/analytics"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Link>
          <button
            onClick={() => {
              setSelectedTask(null)
              setSelectedAppointment(null)
              setShowTaskSidebar(true)
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'appointments' ? 'New Appointment' : activeTab === 'tasks' ? 'New Task' : 'New Task/Appointment'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({tasks.length + appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appointments ({appointments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Toggle */}
              <div className="flex rounded-md shadow-sm flex-1 sm:flex-none">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border ${viewMode === 'table' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } rounded-l-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Table className="w-4 h-4 mr-2 mx-auto sm:mr-2 sm:mx-0" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-t border-r border-b ${viewMode === 'kanban' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Columns className="w-4 h-4 mr-2 mx-auto sm:mr-2 sm:mx-0" />
                  <span className="hidden sm:inline">Kanban</span>
                </button>
              </div>
              
              {/* Kanban Controls */}
              {viewMode === 'kanban' && (
                <>
                  {/* Date Sort Toggle */}
                  <button
                    onClick={() => setDateSortDirection(dateSortDirection === 'asc' ? 'desc' : 'asc')}
                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title={`Sort by date ${dateSortDirection === 'asc' ? 'ascending' : 'descending'}`}
                  >
                    {dateSortDirection === 'asc' ? (
                      <SortAsc className="w-4 h-4 mr-2" />
                    ) : (
                      <SortDesc className="w-4 h-4 mr-2" />
                    )}
                    Date
                  </button>
                  
                  {/* Column Visibility Toggle */}
                  <button
                    onClick={() => setShowColumnVisibility(!showColumnVisibility)}
                    className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Columns
                    <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showColumnVisibility ? 'rotate-180' : ''}`} />
                  </button>
                </>
              )}
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <select
                  value={filterDueDate}
                  onChange={(e) => setFilterDueDate(e.target.value as FilterDueDate)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Due Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="tomorrow">Due Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="future">Future</option>
                </select>
                
                <select
                  value={filterContact}
                  onChange={(e) => setFilterContact(e.target.value as FilterContact)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Contacts</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterDeal}
                  onChange={(e) => setFilterDeal(e.target.value as FilterDeal)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Deals</option>
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {/* Column Visibility Controls */}
          {showColumnVisibility && viewMode === 'kanban' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Column Visibility</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Task Columns */}
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Task Columns</h5>
                  <div className="space-y-2">
                    {(['pending', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => (
                      <label key={`task-${status}`} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={visibleTaskColumns[status]}
                          onChange={(e) => setVisibleTaskColumns((prev: Record<TaskStatus, boolean>) => ({
                            ...prev,
                            [status]: e.target.checked
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Appointment Columns */}
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Appointment Columns</h5>
                  <div className="space-y-2">
                    {(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as AppointmentStatus[]).map((status) => (
                      <label key={`appointment-${status}`} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={visibleAppointmentColumns[status]}
                          onChange={(e) => setVisibleAppointmentColumns((prev: Record<AppointmentStatus, boolean>) => ({
                            ...prev,
                            [status]: e.target.checked
                          }))}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredAndSortedItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">No tasks found matching your criteria.</div>
              </div>
            )}
            {filteredAndSortedItems.map((item) => renderMobileCard(item))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Priority</span>
                      {sortField === 'priority' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Type</span>
                      {sortField === 'type' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('due_date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Due Date</span>
                      {sortField === 'due_date' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedItems.map((item) => renderTableRow(item))}
              </tbody>
            </table>
            {filteredAndSortedItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">No tasks found matching your criteria.</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Kanban View with Swimlanes */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {/* Tasks Swimlane */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTasksSwimLaneCollapsed(!tasksSwimLaneCollapsed)}
                      className="flex items-center space-x-2 text-left"
                    >
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowTaskFieldSelector(!showTaskFieldSelector)
                          setShowAppointmentFieldSelector(false)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Configure columns"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      {showTaskFieldSelector && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Group by:</h4>
                            <div className="space-y-1">
                              {[
                                { value: 'status', label: 'Status' },
                                { value: 'priority', label: 'Priority' },
                                { value: 'type', label: 'Type' },
                                { value: 'contact_id', label: 'Contact' },
                                { value: 'deal_id', label: 'Deal' }
                              ].map((field) => (
                                <label key={field.value} className="flex items-center">
                                  <input
                                    type="radio"
                                    name="taskField"
                                    value={field.value}
                                    checked={taskColumnField === field.value}
                                    onChange={(e) => {
                                      e.stopPropagation()
                                      setTaskColumnField(e.target.value)
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{field.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setTasksSwimLaneCollapsed(!tasksSwimLaneCollapsed)}
                    className="p-1"
                  >
                    {tasksSwimLaneCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {!tasksSwimLaneCollapsed && (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: `repeat(${getTaskColumnValues(taskColumnField).length}, minmax(0, 1fr))` }}>
                    {getTaskColumnValues(taskColumnField).map((value) => {
                      const columnTasks = tasks
                        .filter(task => (getItemFieldValue(task, taskColumnField) || 'none') === (value || 'none'))
                        .sort((a, b) => {
                          // Primary sort by date
                          const aDate = a.due_date ? new Date(a.due_date).getTime() : (dateSortDirection === 'asc' ? Infinity : -Infinity)
                          const bDate = b.due_date ? new Date(b.due_date).getTime() : (dateSortDirection === 'asc' ? Infinity : -Infinity)
                          const dateComparison = dateSortDirection === 'asc' ? aDate - bDate : bDate - aDate
                          
                          // Secondary sort by sort_order if dates are equal
                          if (dateComparison === 0) {
                            return (a.sort_order || 0) - (b.sort_order || 0)
                          }
                          return dateComparison
                        })
                      
                      const getColumnColor = (field: string, value: string | null) => {
                        if (field === 'status') {
                          switch (value) {
                            case 'pending': return 'bg-yellow-50 border-yellow-200'
                            case 'in_progress': return 'bg-blue-50 border-blue-200'
                            case 'completed': return 'bg-green-50 border-green-200'
                            case 'cancelled': return 'bg-red-50 border-red-200'
                            default: return 'bg-gray-50 border-gray-200'
                          }
                        } else if (field === 'priority') {
                          switch (value) {
                            case 'urgent': return 'bg-red-50 border-red-200'
                            case 'high': return 'bg-orange-50 border-orange-200'
                            case 'medium': return 'bg-yellow-50 border-yellow-200'
                            case 'low': return 'bg-green-50 border-green-200'
                            default: return 'bg-gray-50 border-gray-200'
                          }
                        }
                        return 'bg-gray-50 border-gray-200'
                      }
                      
                      return (
                        <FlexibleDroppableColumn
                          key={`tasks-${taskColumnField}-${value || 'none'}`}
                          id={value || 'none'}
                          title={getFieldDisplayName(taskColumnField, value || 'none')}
                          count={columnTasks.length}
                          className={getColumnColor(taskColumnField, value)}
                        >
                          <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            {columnTasks.map((task) => (
                              <DraggableTaskCard
                                key={task.id}
                                task={task}
                                onEdit={() => {
                                  setSelectedTask(task)
                                  setSelectedAppointment(null)
                                  setShowTaskSidebar(true)
                                }}
                                onDelete={() => handleTaskDelete(task.id)}
                                onComplete={() => handleTaskComplete(task.id)}
                                onUndo={() => handleTaskUndo(task.id)}
                              />
                            ))}
                            
                            {columnTasks.length === 0 && (
                              <div className="text-center py-8 text-gray-400 text-sm">
                                No {getFieldDisplayName(taskColumnField, value || 'none').toLowerCase()} tasks
                              </div>
                            )}
                          </SortableContext>
                        </FlexibleDroppableColumn>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

          {/* Appointments Swimlane */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAppointmentsSwimLaneCollapsed(!appointmentsSwimLaneCollapsed)}
                    className="flex items-center space-x-2 text-left"
                  >
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {appointments.length}
                    </span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAppointmentFieldSelector(!showAppointmentFieldSelector)
                        setShowTaskFieldSelector(false)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      title="Configure columns"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    {showAppointmentFieldSelector && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Group by:</h4>
                          <div className="space-y-1">
                            {[
                              { value: 'status', label: 'Status' },
                              { value: 'priority', label: 'Priority' },
                              { value: 'appointment_type', label: 'Type' },
                              { value: 'contact_id', label: 'Contact' },
                              { value: 'deal_id', label: 'Deal' }
                            ].map((field) => (
                              <label key={field.value} className="flex items-center">
                                <input
                                  type="radio"
                                  name="appointmentField"
                                  value={field.value}
                                  checked={appointmentColumnField === field.value}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    setAppointmentColumnField(e.target.value)
                                  }}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">{field.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setAppointmentsSwimLaneCollapsed(!appointmentsSwimLaneCollapsed)}
                  className="p-1"
                >
                  {appointmentsSwimLaneCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            {!appointmentsSwimLaneCollapsed && (
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: `repeat(${getAppointmentColumnValues(appointmentColumnField).length}, minmax(0, 1fr))` }}>
                  {getAppointmentColumnValues(appointmentColumnField).map((value) => {
                    const columnAppointments = appointments
                      .filter(appointment => (getItemFieldValue(appointment, appointmentColumnField) || 'none') === (value || 'none'))
                      .sort((a, b) => {
                        // Primary sort by start_datetime
                        const aDate = a.start_datetime ? new Date(a.start_datetime).getTime() : (dateSortDirection === 'asc' ? Infinity : -Infinity)
                        const bDate = b.start_datetime ? new Date(b.start_datetime).getTime() : (dateSortDirection === 'asc' ? Infinity : -Infinity)
                        return dateSortDirection === 'asc' ? aDate - bDate : bDate - aDate
                      })
                    
                    const getColumnColor = (field: string, value: string | null) => {
                      if (field === 'status') {
                        switch (value) {
                          case 'scheduled': return 'bg-blue-50 border-blue-200'
                          case 'confirmed': return 'bg-blue-50 border-blue-200'
                          case 'in_progress': return 'bg-yellow-50 border-yellow-200'
                          case 'completed': return 'bg-green-50 border-green-200'
                          case 'cancelled': return 'bg-red-50 border-red-200'
                          case 'no_show': return 'bg-red-50 border-red-200'
                          default: return 'bg-gray-50 border-gray-200'
                        }
                      } else if (field === 'priority') {
                        switch (value) {
                          case 'urgent': return 'bg-red-50 border-red-200'
                          case 'high': return 'bg-orange-50 border-orange-200'
                          case 'medium': return 'bg-yellow-50 border-yellow-200'
                          case 'low': return 'bg-green-50 border-green-200'
                          default: return 'bg-gray-50 border-gray-200'
                        }
                      }
                      return 'bg-gray-50 border-gray-200'
                    }
                    
                    return (
                      <FlexibleDroppableColumn
                        key={`appointments-${appointmentColumnField}-${value || 'none'}`}
                        id={value || 'none'}
                        title={getFieldDisplayName(appointmentColumnField, value || 'none')}
                        count={columnAppointments.length}
                        className={getColumnColor(appointmentColumnField, value || null)}
                      >
                        <SortableContext items={columnAppointments.map(a => a.id)} strategy={verticalListSortingStrategy}>
                          {columnAppointments.map((appointment) => (
                            <DraggableAppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setSelectedTask(null)
                                setShowTaskSidebar(true)
                              }}
                            />
                          ))}
                          
                          {columnAppointments.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                              No {getFieldDisplayName(appointmentColumnField, value || 'none').toLowerCase()} appointments
                            </div>
                          )}
                        </SortableContext>
                      </FlexibleDroppableColumn>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* DragOverlay for both tasks and appointments */}
          <DragOverlay>
            {activeTask ? (
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 rotate-3 opacity-90">
                <h4 className="font-medium text-gray-900 text-sm">{activeTask.title}</h4>
                {activeTask.description && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{activeTask.description}</p>
                )}
                
                {/* Task Type */}
                {activeTask.type && (
                  <div className="mt-2">
                    <StatusChip
                      value={activeTask.type}
                      color={getTaskTypeColor(activeTask.type)}
                      bgColor={`${getTaskTypeColor(activeTask.type)}15`}
                      textColor={getTaskTypeColor(activeTask.type)}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            ) : activeAppointment ? (
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 rotate-3 opacity-90">
                <h4 className="font-medium text-gray-900 text-sm">{activeAppointment.title}</h4>
                {activeAppointment.description && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{activeAppointment.description}</p>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {activeAppointment.start_datetime && (
                      <span>📅 {format(new Date(activeAppointment.start_datetime), 'MMM dd, HH:mm')}</span>
                    )}
                    {activeAppointment.location && (
                      <span>📍 {activeAppointment.location}</span>
                    )}
                  </div>
                  
                  {activeAppointment.appointment_type && (
                    <StatusChip
                      value={activeAppointment.appointment_type}
                      color="#6B7280"
                      bgColor="#F3F4F615"
                      textColor="#6B7280"
                      size="sm"
                    />
                  )}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
      )}

      {/* Task Sidebar */}
      <TaskSidebar
        task={selectedTask}
        appointment={selectedAppointment}
        isOpen={showTaskSidebar}
        onClose={() => {
          setShowTaskSidebar(false)
          setSelectedTask(null)
          setSelectedAppointment(null)
        }}
        onSave={(updatedItem?: Task | Appointment) => {
          if (updatedItem) {
            if ('due_date' in updatedItem) {
              // It's a task
              const existingTaskIndex = tasks.findIndex(t => t.id === updatedItem.id)
              
              if (existingTaskIndex >= 0) {
                // Update existing task - optimistic update
                setTasks(prevTasks => 
                  prevTasks.map(t => 
                    t.id === updatedItem.id 
                      ? { ...t, ...updatedItem }
                      : t
                  )
                )
              } else {
                // New task - add to the beginning of the list
                setTasks(prevTasks => [updatedItem, ...prevTasks])
              }
              
              // Update the selected task to the new/updated task to keep sidebar open
              setSelectedTask(updatedItem)
              setSelectedAppointment(null)
            } else {
              // It's an appointment
              const existingAppointmentIndex = appointments.findIndex(a => a.id === updatedItem.id)
              
              if (existingAppointmentIndex >= 0) {
                // Update existing appointment - optimistic update
                setAppointments(prevAppointments => 
                  prevAppointments.map(a => 
                    a.id === updatedItem.id 
                      ? { ...a, ...updatedItem }
                      : a
                  )
                )
              } else {
                // New appointment - add to the beginning of the list
                setAppointments(prevAppointments => [updatedItem, ...prevAppointments])
              }
              
              // Update the selected appointment to the new/updated appointment to keep sidebar open
              setSelectedAppointment(updatedItem)
              setSelectedTask(null)
            }
          } else {
            // Fallback to full reload if no updated item provided
            loadTasks()
            loadAppointments()
          }
        }}
      />
    </div>
  )
}
