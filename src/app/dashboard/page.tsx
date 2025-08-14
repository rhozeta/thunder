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

export default function DashboardHome() {
  const { user } = useAuth()
  const router = useRouter()
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dashboardSections, setDashboardSections] = useState<DashboardSection[]>(DEFAULT_SECTIONS)

  useEffect(() => {
    // Load saved dashboard configuration
    const saved = localStorage.getItem('dashboardSections')
    if (saved) {
      try {
        const savedSections = JSON.parse(saved)
        setDashboardSections(savedSections)
      } catch (error) {
        console.error('Error loading dashboard settings:', error)
      }
    }
  }, [])

  const handleSectionsChange = (sections: DashboardSection[]) => {
    setDashboardSections(sections)
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

  // Count enabled sections for dynamic grid layout
  const enabledMainSections = [
    isSectionEnabled('priority'),
    isSectionEnabled('pipeline'),
    isSectionEnabled('tasks')
  ].filter(Boolean).length

  const enabledBottomSections = [
    isSectionEnabled('communication'),
    isSectionEnabled('insights')
  ].filter(Boolean).length

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

        {/* Stats Overview */}
        {isSectionEnabled('stats') && (
          <div className="mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Statistics Overview</h2>
              <p className="text-sm text-gray-600">Key metrics and performance indicators</p>
            </div>
            <div className="p-6">
              <StatsOverview />
            </div>
          </div>
        )}

        {/* Main Dashboard Grid - Dynamic layout based on enabled sections */}
        {enabledMainSections > 0 && (
          <div className={`grid gap-6 mb-8 ${
            enabledMainSections === 1 
              ? 'grid-cols-1' 
              : enabledMainSections === 2 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1 lg:grid-cols-3'
          }`}>
            {/* Priority Actions */}
            {isSectionEnabled('priority') && (
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
            )}

            {/* Pipeline Insights */}
            {isSectionEnabled('pipeline') && (
              <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${enabledMainSections === 2 && !isSectionEnabled('priority') ? 'lg:col-span-2' : ''}`}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Pipeline Insights</h2>
                  <p className="text-sm text-gray-600">Deal pipeline and revenue forecasts</p>
                </div>
                <div className="p-6">
                  <PipelineInsights />
                </div>
              </div>
            )}

            {/* Task Management */}
            {isSectionEnabled('tasks') && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Task Management</h2>
                  <p className="text-sm text-gray-600">Task overview and productivity metrics</p>
                </div>
                <div className="p-6">
                  <TaskManagementHub onAddTask={handleAddTask} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Section - Dynamic layout */}
        {enabledBottomSections > 0 && (
          <div className={`grid gap-6 mb-8 ${
            enabledBottomSections === 1 
              ? 'grid-cols-1' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {/* Communication Center */}
            {isSectionEnabled('communication') && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Communication Center</h2>
                  <p className="text-sm text-gray-600">Recent communications and follow-ups</p>
                </div>
                <div className="p-6">
                  <CommunicationCenter />
                </div>
              </div>
            )}

            {/* Smart Insights */}
            {isSectionEnabled('insights') && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Smart Insights</h2>
                  <p className="text-sm text-gray-600">AI-powered recommendations and analytics</p>
                </div>
                <div className="p-6">
                  <SmartInsights />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Navigation Footer */}
        {isSectionEnabled('navigation') && (
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
        )}
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
