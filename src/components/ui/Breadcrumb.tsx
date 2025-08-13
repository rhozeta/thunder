'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbProps {
  items?: Array<{
    label: string
    href?: string
  }>
  showBackButton?: boolean
  className?: string
}

export default function Breadcrumb({ 
  items = [], 
  showBackButton = true, 
  className = '' 
}: BreadcrumbProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-600 mb-6 ${className}`}>
      {showBackButton && (
        <button
          onClick={handleBack}
          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}
      
      {items.length > 0 && (
        <>
          {showBackButton && <span className="text-gray-300">|</span>}
          <nav className="flex items-center space-x-2">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronLeft className="w-3 h-3 text-gray-400 rotate-180" />
                {item.href ? (
                  <Link 
                    href={item.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}
