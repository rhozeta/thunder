'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Task } from '@/types/task'
import StatsOverview from '@/components/dashboard/StatsOverview'
import PriorityActions from '@/components/dashboard/PriorityActions'
import PipelineInsights from '@/components/dashboard/PipelineInsights'
import TaskManagementHub from '@/components/dashboard/TaskManagementHub'
import CommunicationCenter from '@/components/dashboard/CommunicationCenter'
import SmartInsights from '@/components/dashboard/SmartInsights'
import DashboardSettings, { DashboardSection } from '@/components/dashboard/DashboardSettings'
import TaskSidebar from '@/components/tasks/TaskSidebar'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

const DEFAULT_SECTIONS: DashboardSection[] = [
  {
    id: 'stats',
    name: 'Statistics Overview',
    description: 'Key metrics and performance indicators',
    enabled: true
  },
  {
    id: 'priority',
    name: 'Priority Actions',
    description: 'Urgent tasks and quick actions',
    enabled: true
  },
  {
    id: 'pipeline',
    name: 'Pipeline Insights',
    description: 'Deal pipeline and revenue forecasts',
    enabled: true
  },
  {
    id: 'tasks',
    name: 'Task Management',
    description: 'Task overview and productivity metrics',
    enabled: true
  },
  {
    id: 'communication',
    name: 'Communication Center',
    description: 'Recent communications and follow-ups',
    enabled: true
  },
  {
    id: 'insights',
    name: 'Smart Insights',
    description: 'AI-powered recommendations and analytics',
    enabled: true
  },
  {
    id: 'navigation',
    name: 'Quick Navigation',
    description: 'Fast access to main CRM sections',
    enabled: true
  }
]

// Draggable Section Component
interface DraggableSectionProps {
  id: string
  children: React.ReactNode
  className?: string
}

function DraggableSection({ id, children, className = '' }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className} ${isDragging ? 'z-50 opacity-75' : ''}`}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white shadow-sm border border-gray-200 hover:bg-gray-50 z-10"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      {children}
    </div>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardSections, setDashboardSections] = useState<DashboardSection[]>(DEFAULT_SECTIONS)
  const [sectionOrder, setSectionOrder] = useState<string[]>(['stats', 'priority', 'pipeline', 'tasks', 'communication', 'insights', 'navigation'])
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Load saved dashboard configuration
    const saved = localStorage.getItem('dashboardSections')
    const savedOrder = localStorage.getItem('dashboardSectionOrder')
    
    if (saved) {
      try {
        const savedSections = JSON.parse(saved)
        setDashboardSections(savedSections)
      } catch (error) {
        console.error('Error loading dashboard settings:', error)
      }
    }
    
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder)
        setSectionOrder(parsedOrder)
      } catch (error) {
        console.error('Error loading section order:', error)
      }
    }
  }, [])

  const handleSectionsChange = (sections: DashboardSection[]) => {
    setDashboardSections(sections)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Save to localStorage
        localStorage.setItem('dashboardSectionOrder', JSON.stringify(newOrder))
        
        return newOrder
      })
    }
  }

  const isSectionEnabled = (sectionId: string) => {
    return dashboardSections.find(s => s.id === sectionId)?.enabled ?? true
  }

  const handleAddTask = () => {
    setSelectedTask(null)
    setTaskSidebarOpen(true)
  }

  const handleAddContact = () => {
    router.push('/dashboard/contacts?action=add')
  }

  const handleAddDeal = () => {
    router.push('/dashboard/deals?action=add')
  }

  const handleTaskSave = (updatedTask?: Task) => {
    setTaskSidebarOpen(false)
    setSelectedTask(null)
    // The individual components will refresh their data automatically
  }

  const handleTaskDelete = (taskId: string) => {
    setTaskSidebarOpen(false)
    setSelectedTask(null)
    // The individual components will refresh their data automatically
  }

  // Helper function to render individual sections
  const renderSection = (sectionId: string) => {
    if (!isSectionEnabled(sectionId)) return null

    const sectionContent = () => {
      switch (sectionId) {
        case 'stats':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Statistics Overview</h2>
                <p className="text-sm text-gray-600">Key metrics and performance indicators</p>
              </div>
              <div className="p-6">
                <StatsOverview />
              </div>
            </div>
          )
        case 'priority':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Priority Actions</h2>
                <p className="text-sm text-gray-600">Urgent tasks and quick actions</p>
              </div>
              <div className="p-6">
                <PriorityActions 
                  onAddTask={handleAddTask}
                  onAddContact={handleAddContact}
                  onAddDeal={handleAddDeal}
                />
              </div>
            </div>
          )
        case 'pipeline':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pipeline Insights</h2>
                <p className="text-sm text-gray-600">Deal pipeline and revenue forecasts</p>
              </div>
              <div className="p-6">
                <PipelineInsights />
              </div>
            </div>
          )
        case 'tasks':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Task Management</h2>
                <p className="text-sm text-gray-600">Task overview and productivity metrics</p>
              </div>
              <div className="p-6">
                <TaskManagementHub onAddTask={handleAddTask} />
              </div>
            </div>
          )
        case 'communication':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Communication Center</h2>
                <p className="text-sm text-gray-600">Recent communications and follow-ups</p>
              </div>
              <div className="p-6">
                <CommunicationCenter />
              </div>
            </div>
          )
        case 'insights':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Smart Insights</h2>
                <p className="text-sm text-gray-600">AI-powered recommendations and analytics</p>
              </div>
              <div className="p-6">
                <SmartInsights />
              </div>
            </div>
          )
        case 'navigation':
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/dashboard/calendar')}
                  className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-blue-600 font-medium">Calendar</div>
                  <div className="text-sm text-gray-600">Schedule & Events</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/contacts')}
                  className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-green-600 font-medium">Contacts</div>
                  <div className="text-sm text-gray-600">Client Management</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/deals')}
                  className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-purple-600 font-medium">Deals</div>
                  <div className="text-sm text-gray-600">Pipeline & Sales</div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/tasks')}
                  className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-orange-600 font-medium">Tasks</div>
                  <div className="text-sm text-gray-600">To-Do & Projects</div>
                </button>
              </div>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <DraggableSection key={sectionId} id={sectionId} className="mb-8">
        {sectionContent()}
      </DraggableSection>
    )
  }

  // Get enabled sections in the correct order
  const enabledSections = sectionOrder.filter(sectionId => isSectionEnabled(sectionId))

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Full width container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Agent'}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your real estate business today.
          </p>
        </div>

        {/* Draggable Dashboard Sections */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={enabledSections} strategy={verticalListSortingStrategy}>
            {enabledSections.map(sectionId => renderSection(sectionId))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Dashboard Settings */}
      <DashboardSettings 
        sections={dashboardSections}
        onSectionsChange={handleSectionsChange}
      />

      {/* Task Sidebar */}
      <TaskSidebar
        task={selectedTask}
        isOpen={taskSidebarOpen}
        onClose={() => setTaskSidebarOpen(false)}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </div>
  )
}
