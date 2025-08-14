'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { GripVertical, Move3D } from 'lucide-react'

// Extended DashboardSection interface with size support
interface ExtendedDashboardSection extends DashboardSection {
  size?: 'small' | 'medium' | 'large' // small=1 col, medium=2 cols, large=3 cols
}

const DEFAULT_SECTIONS: ExtendedDashboardSection[] = [
  {
    id: 'stats',
    name: 'Statistics Overview',
    description: 'Key metrics and performance indicators',
    enabled: true,
    size: 'large'
  },
  {
    id: 'priority',
    name: 'Priority Actions',
    description: 'Urgent tasks and quick actions',
    enabled: true,
    size: 'medium'
  },
  {
    id: 'pipeline',
    name: 'Pipeline Insights',
    description: 'Deal pipeline and revenue forecasts',
    enabled: true,
    size: 'large'
  },
  {
    id: 'tasks',
    name: 'Task Management',
    description: 'Task overview and productivity metrics',
    enabled: true,
    size: 'medium'
  },
  {
    id: 'communication',
    name: 'Communication Center',
    description: 'Recent communications and follow-ups',
    enabled: true,
    size: 'medium'
  },
  {
    id: 'insights',
    name: 'Smart Insights',
    description: 'AI-powered recommendations and analytics',
    enabled: true,
    size: 'large'
  },
  {
    id: 'navigation',
    name: 'Quick Navigation',
    description: 'Fast access to main CRM sections',
    enabled: true,
    size: 'large'
  }
]

// Draggable Section Component with Resize Support
interface DraggableSectionProps {
  id: string
  children: React.ReactNode
  size: 'small' | 'medium' | 'large'
  onSizeChange: (id: string, newSize: 'small' | 'medium' | 'large') => void
  className?: string
}

function DraggableSection({ id, children, size, onSizeChange, className = '' }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const [isResizing, setIsResizing] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Get grid column classes based on size with responsive design
  const getSizeClass = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-1 md:col-span-1 lg:col-span-2'
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3'
      default: return 'col-span-1'
    }
  }

  // Enhanced resize handler - allows multi-level size changes based on drag distance
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Resize start triggered', { currentSize: size }) // Debug log
    setIsResizing(true)
    
    let startX = e.clientX
    let initialSize = size
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const smallThreshold = 80   // Small drag distance
      const largeThreshold = 160  // Large drag distance
      
      let newSize: 'small' | 'medium' | 'large' = initialSize
      
      if (deltaX > largeThreshold) {
        // Large drag right - go to largest size
        newSize = 'large'
      } else if (deltaX > smallThreshold) {
        // Medium drag right - increase size
        if (initialSize === 'small') newSize = 'medium'
        else if (initialSize === 'medium') newSize = 'large'
        else newSize = 'large' // Already large, stay large
      } else if (deltaX < -largeThreshold) {
        // Large drag left - go to smallest size
        newSize = 'small'
      } else if (deltaX < -smallThreshold) {
        // Medium drag left - decrease size
        if (initialSize === 'large') newSize = 'medium'
        else if (initialSize === 'medium') newSize = 'small'
        else newSize = 'small' // Already small, stay small
      }
      
      if (newSize !== size) {
        console.log('Size changing from', size, 'to', newSize, 'deltaX:', deltaX) // Debug log
        onSizeChange(id, newSize)
      }
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${getSizeClass(size)} ${className} ${
        isDragging ? 'z-50 opacity-75' : ''
      } ${
        isResizing ? 'ring-2 ring-blue-400 ring-opacity-50 z-40' : ''
      } transition-all duration-200`}
      {...attributes}
    >
      {/* Drag Handle - Top Right */}
      <div
        {...listeners}
        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white shadow-sm border border-gray-200 hover:bg-gray-50 z-10"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Resize Handle - Bottom Right */}
      <div
        onMouseDown={handleResizeStart}
        className={`absolute bottom-2 right-2 p-1 rounded transition-all duration-200 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 z-10 ${
          isResizing 
            ? 'cursor-col-resize opacity-100 bg-blue-50 border-blue-300' 
            : 'cursor-col-resize opacity-0 group-hover:opacity-100'
        }`}
        title={`Drag to resize (currently ${size})`}
      >
        <Move3D className={`w-4 h-4 ${isResizing ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>

      {/* Size indicator */}
      <div className={`absolute bottom-2 left-2 transition-opacity duration-200 ${
        isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className={`text-xs px-2 py-1 rounded shadow-sm border ${
          isResizing 
            ? 'bg-blue-50 text-blue-700 border-blue-200' 
            : 'bg-white text-gray-400 border-gray-200'
        }`}>
          {size}
        </span>
      </div>

      {/* Resize preview overlay */}
      {isResizing && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-20 border-2 border-blue-300 border-dashed rounded-lg pointer-events-none z-5">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Resizing to {size}
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardSections, setDashboardSections] = useState<ExtendedDashboardSection[]>(DEFAULT_SECTIONS)
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
    setDashboardSections(sections as ExtendedDashboardSection[])
  }

  const handleSizeChange = (sectionId: string, newSize: 'small' | 'medium' | 'large') => {
    const updatedSections = dashboardSections.map(section =>
      section.id === sectionId ? { ...section, size: newSize } : section
    )
    setDashboardSections(updatedSections)
    // Save to localStorage
    localStorage.setItem('dashboardSections', JSON.stringify(updatedSections))
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

    const section = dashboardSections.find(s => s.id === sectionId)
    const sectionSize = section?.size || 'medium'

    const sectionContent = () => {
      switch (sectionId) {
        case 'stats':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Statistics Overview</h2>
                <p className="text-sm text-gray-600">Key metrics and performance indicators</p>
              </div>
              <div className="p-6 flex-1">
                <StatsOverview />
              </div>
            </div>
          )
        case 'priority':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Priority Actions</h2>
                <p className="text-sm text-gray-600">Urgent tasks and quick actions</p>
              </div>
              <div className="p-6 flex-1">
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Pipeline Insights</h2>
                <p className="text-sm text-gray-600">Deal pipeline and revenue forecasts</p>
              </div>
              <div className="p-6 flex-1">
                <PipelineInsights />
              </div>
            </div>
          )
        case 'tasks':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Task Management</h2>
                <p className="text-sm text-gray-600">Task overview and productivity metrics</p>
              </div>
              <div className="p-6 flex-1">
                <TaskManagementHub onAddTask={handleAddTask} />
              </div>
            </div>
          )
        case 'communication':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Communication Center</h2>
                <p className="text-sm text-gray-600">Recent communications and follow-ups</p>
              </div>
              <div className="p-6 flex-1">
                <CommunicationCenter />
              </div>
            </div>
          )
        case 'insights':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Smart Insights</h2>
                <p className="text-sm text-gray-600">AI-powered recommendations and analytics</p>
              </div>
              <div className="p-6 flex-1">
                <SmartInsights />
              </div>
            </div>
          )
        case 'navigation':
          return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Quick Navigation</h2>
                <p className="text-sm text-gray-600">Fast access to main CRM sections</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <button
                    onClick={() => router.push('/dashboard/calendar')}
                    className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col justify-center"
                  >
                    <div className="text-blue-600 font-medium">Calendar</div>
                    <div className="text-sm text-gray-600">Schedule & Events</div>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/contacts')}
                    className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col justify-center"
                  >
                    <div className="text-green-600 font-medium">Contacts</div>
                    <div className="text-sm text-gray-600">Client Management</div>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/deals')}
                    className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col justify-center"
                  >
                    <div className="text-purple-600 font-medium">Deals</div>
                    <div className="text-sm text-gray-600">Pipeline & Sales</div>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/tasks')}
                    className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col justify-center"
                  >
                    <div className="text-orange-600 font-medium">Tasks</div>
                    <div className="text-sm text-gray-600">To-Do & Projects</div>
                  </button>
                </div>
              </div>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <DraggableSection 
        key={sectionId} 
        id={sectionId} 
        size={sectionSize}
        onSizeChange={handleSizeChange}
        className=""
      >
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

        {/* Draggable Dashboard Sections - Responsive 3 Column Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={enabledSections} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
              {enabledSections.map(sectionId => renderSection(sectionId))}
            </div>
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
