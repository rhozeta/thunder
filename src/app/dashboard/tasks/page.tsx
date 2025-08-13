'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TaskService } from '@/services/tasks'
import { Task, TaskStatus } from '@/types/task'
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
  Calendar, 
  Clock, 
  CheckSquare, 
  AlertCircle, 
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  ChevronDown,
  SortAsc,
  SortDesc,
  Table,
  Columns,
  Edit,
  Trash2,
  MoreHorizontal,
  Undo,
  User,
  Briefcase,
  ExternalLink,
  RotateCcw
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

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [contacts, setContacts] = useState<Array<{id: string, first_name: string, last_name: string}>>([])
  const [deals, setDeals] = useState<Array<{id: string, title: string}>>([])
  const [loading, setLoading] = useState(true)
  const [showTaskSidebar, setShowTaskSidebar] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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



  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.contact && `${task.contact.first_name} ${task.contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      
      let matchesDueDate = true
      if (filterDueDate !== 'all') {
        if (!task.due_date) {
          matchesDueDate = filterDueDate === 'future'
        } else {
          const dueDate = new Date(task.due_date)
          const now = new Date()
          
          switch (filterDueDate) {
            case 'overdue':
              matchesDueDate = isPast(dueDate) && task.status !== 'completed'
              break
            case 'today':
              matchesDueDate = isToday(dueDate)
              break
            case 'tomorrow':
              matchesDueDate = isTomorrow(dueDate)
              break
            case 'this_week':
              matchesDueDate = isThisWeek(dueDate)
              break
            case 'future':
              matchesDueDate = dueDate > now
              break
            default:
              matchesDueDate = true
          }
        }
      }

      const matchesContact = filterContact === 'all' || task.contact_id === filterContact
      const matchesDeal = filterDeal === 'all' || task.deal_id === filterDeal

      return matchesSearch && matchesStatus && matchesPriority && matchesDueDate && matchesContact && matchesDeal
    })

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortField) {
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        case 'status':
          const statusOrder = { pending: 1, in_progress: 2, completed: 3, cancelled: 4 }
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'type':
          aValue = a.type || ''
          bValue = b.type || ''
          break
        default:
          aValue = a[sortField] || ''
          bValue = b[sortField] || ''
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [tasks, searchQuery, sortField, sortDirection, filterStatus, filterPriority, filterDueDate, filterContact, filterDeal])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const task = tasks.find(t => t.id === taskId)
    
    if (!task) return

    // Determine the target status and position
    let newStatus: TaskStatus
    let newSortOrder: number | undefined
    
    // Check if we dropped on a column (status) or on another task
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']
    if (validStatuses.includes(over.id as TaskStatus)) {
      // Dropped on a column
      newStatus = over.id as TaskStatus
      // When dropping on a column, put it at the end
      const columnTasks = tasks.filter(t => t.status === newStatus && t.id !== taskId)
      newSortOrder = columnTasks.length > 0 ? Math.max(...columnTasks.map(t => t.sort_order || 0)) + 1 : 0
    } else {
      // Dropped on another task - find the status and position of the target task
      const targetTask = tasks.find(t => t.id === over.id)
      if (targetTask) {
        newStatus = targetTask.status
        // Insert before the target task
        const columnTasks = tasks.filter(t => t.status === newStatus && t.id !== taskId)
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
        // Fallback - keep the same status (just reordering within column)
        newStatus = task.status
        return // No change needed
      }
    }

    // Check if anything actually changed
    const statusChanged = task.status !== newStatus
    const orderChanged = newSortOrder !== undefined && Math.abs((task.sort_order || 0) - newSortOrder) > 0.001
    
    if (!statusChanged && !orderChanged) return

    // Optimistically update the UI
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status: newStatus, 
              sort_order: newSortOrder !== undefined ? newSortOrder : t.sort_order,
              updated_at: new Date().toISOString() 
            }
          : t
      )
    )

    try {
      const updateData: any = { status: newStatus }
      if (newSortOrder !== undefined) {
        updateData.sort_order = newSortOrder
      }
      
      console.log('Attempting to update task:', { taskId, updateData, task })
      await TaskService.updateTask(taskId, updateData)
      console.log('Task updated successfully')
    } catch (error) {
      console.error('Error updating task status:', error)
      console.error('Error details:', {
        taskId,
        newStatus,
        originalTask: task,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      })
      
      // Revert the optimistic update
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: task.status }
            : t
        )
      )
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status. Please try again.'
      alert(`Error updating task: ${errorMessage}`)
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
              setShowTaskSidebar(true)
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
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
        </div>
      </div>

      {/* Tasks Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredAndSortedTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">No tasks found matching your criteria.</div>
              </div>
            )}
            {filteredAndSortedTasks.map((task) => (
              <TaskMobileCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setSelectedTask(task)
                  setShowTaskSidebar(true)
                }}
                onDelete={handleTaskDelete}
                onComplete={handleTaskComplete}
                onUndo={handleTaskUndo}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
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
                {filteredAndSortedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-[120px]">
                            {task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusChip
                        value={getPriorityDisplayName(task.priority)}
                        {...PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusChip
                        value={getStatusDisplayName(task.status)}
                        {...STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.type ? (
                        <StatusChip
                          value={task.type}
                          color={getTaskTypeColor(task.type)}
                          bgColor={`${getTaskTypeColor(task.type)}15`}
                          textColor={getTaskTypeColor(task.type)}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No type</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.due_date ? format(new Date(task.due_date + 'T00:00:00'), 'MMM dd, yyyy') : 'No due date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.contact ? (
                        <Link 
                          href={`/dashboard/contacts/${task.contact.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {task.contact.first_name} {task.contact.last_name}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">No contact</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.deal ? (
                        <Link 
                          href={`/dashboard/deals/${task.deal.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {task.deal.title}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">No deal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {task.status !== 'completed' ? (
                          <button
                            onClick={() => handleTaskComplete(task.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTaskUndo(task.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTask(task)
                            setShowTaskSidebar(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAndSortedTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">No tasks found matching your criteria.</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Kanban View */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(['pending', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => {
              const statusTasks = filteredAndSortedTasks
                .filter(task => task.status === status)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              return (
                <DroppableColumn
                  key={status}
                  status={status}
                  tasks={statusTasks}
                  onEditTask={(task) => {
                    setSelectedTask(task)
                    setShowTaskSidebar(true)
                  }}
                  onDeleteTask={handleTaskDelete}
                  onCompleteTask={handleTaskComplete}
                  onUndoTask={handleTaskUndo}
                />
              )
            })}
          </div>
          
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
                
                <div className="flex items-center justify-between mt-2">
                  <StatusChip
                    value={getPriorityDisplayName(activeTask.priority)}
                    {...PRIORITY_COLORS[activeTask.priority as keyof typeof PRIORITY_COLORS]}
                    size="sm"
                  />
                  {activeTask.due_date && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(activeTask.due_date), 'MMM dd')}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Sidebar */}
      <TaskSidebar
        task={selectedTask}
        isOpen={showTaskSidebar}
        onClose={() => {
          setShowTaskSidebar(false)
          setSelectedTask(null)
        }}
        onSave={(updatedTask?: Task) => {
          if (updatedTask) {
            // Check if this is a new task (not in the current list) or an update
            const existingTaskIndex = tasks.findIndex(t => t.id === updatedTask.id)
            
            if (existingTaskIndex >= 0) {
              // Update existing task - optimistic update
              setTasks(prevTasks => 
                prevTasks.map(t => 
                  t.id === updatedTask.id 
                    ? { ...t, ...updatedTask }
                    : t
                )
              )
            } else {
              // New task - add to the beginning of the list
              setTasks(prevTasks => [updatedTask, ...prevTasks])
            }
            
            // Update the selected task to the new/updated task to keep sidebar open
            setSelectedTask(updatedTask)
          } else {
            // Fallback to full reload if no updated task provided
            loadTasks()
          }
        }}
      />
    </div>
  )
}
