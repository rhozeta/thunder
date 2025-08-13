'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import React from 'react'
import { 
  Home, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Menu, 
  X, 
  LogOut,
  User,
  BarChart3,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Deals', href: '/dashboard/deals', icon: Briefcase },
  { 
    name: 'Tasks', 
    href: '/dashboard/tasks', 
    icon: CheckSquare,
    children: [
      { name: 'Analytics', href: '/dashboard/tasks/analytics', icon: BarChart3 }
    ]
  },
]

interface NavigationItem {
  name: string
  href: string
  icon: any
  children?: NavigationItem[]
}

interface SidebarProps {
  collapsed: boolean
  onToggle: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const isCollapsed = collapsed
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['Tasks'])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) return null

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          !isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => onToggle(true)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64'
      } ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <img src="/logo_black.png" alt="Thunder CRM" className="h-8 w-auto" />
          )}
          <button
            onClick={() => onToggle(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const isExpanded = expandedItems.includes(item.name)
            const hasActiveChild = item.children?.some(child => pathname === child.href)
            const showAsActive = isActive || hasActiveChild
            
            return (
              <div key={item.name}>
                {/* Main navigation item */}
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showAsActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && item.name}
                  </Link>
                  
                  {/* Expand/collapse button for items with children */}
                  {item.children && !isCollapsed && (
                    <button
                      onClick={() => {
                        setExpandedItems(prev => 
                          isExpanded 
                            ? prev.filter(name => name !== item.name)
                            : [...prev, item.name]
                        )
                      }}
                      className="p-1 ml-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Child navigation items */}
                {item.children && !isCollapsed && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isChildActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <child.icon className="h-4 w-4 mr-3" />
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          )}
          
          {isCollapsed && (
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
