'use client'

import { useAuth } from '@/contexts/AuthContext'
import TasksWidget from '@/components/tasks/TasksWidget'

export default function DashboardHome() {
  const { user } = useAuth()

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="px-2 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Welcome to your CRM Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            You're logged in as {user?.email}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Contacts</h3>
              <p className="text-sm sm:text-base text-gray-600">Manage your client contacts</p>
              <a href="/dashboard/contacts" className="mt-3 sm:mt-4 inline-block text-blue-600 hover:text-blue-500 text-sm sm:text-base">
                View Contacts →
              </a>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Deals</h3>
              <p className="text-sm sm:text-base text-gray-600">Track your property deals</p>
              <a href="/dashboard/deals" className="mt-3 sm:mt-4 inline-block text-blue-600 hover:text-blue-500 text-sm sm:text-base">
                View Deals →
              </a>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Tasks</h3>
              <p className="text-sm sm:text-base text-gray-600">Manage your daily tasks</p>
              <a href="/dashboard/tasks" className="mt-3 sm:mt-4 inline-block text-blue-600 hover:text-blue-500 text-sm sm:text-base">
                View Tasks →
              </a>
            </div>
          </div>

          {/* Tasks Widget */}
          <div className="mt-8">
            <TasksWidget />
          </div>
        </div>
      </div>
    </div>
  )
}
