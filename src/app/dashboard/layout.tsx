'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { useState } from 'react'
import { Menu } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  
  return (
    <ProtectedLayout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
      {children}
    </ProtectedLayout>
  )
}

function ProtectedLayout({ 
  children, 
  sidebarCollapsed,
  setSidebarCollapsed
}: { 
  children: React.ReactNode
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-1 w-full overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } ml-0 min-h-screen w-full max-w-full overflow-hidden`}>
        {/* Mobile header with menu button */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-gray-900 truncate">Thunder CRM</h1>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu className="h-5 w-5 text-gray-900" />
          </button>
        </div>
        <div className="p-3 sm:p-4 lg:p-6 flex-1 w-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
