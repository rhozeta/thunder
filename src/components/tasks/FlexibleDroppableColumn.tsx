'use client'

import { useDroppable } from '@dnd-kit/core'
import { ReactNode } from 'react'

interface FlexibleDroppableColumnProps {
  id: string
  title: string
  count: number
  className?: string
  children: ReactNode
}

export function FlexibleDroppableColumn({
  id,
  title,
  count,
  className = 'bg-gray-50 border-gray-200',
  children
}: FlexibleDroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 border-2 transition-colors duration-200 ${className} ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 capitalize">
          {title}
        </h4>
        <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded">
          {count}
        </span>
      </div>
      
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}
