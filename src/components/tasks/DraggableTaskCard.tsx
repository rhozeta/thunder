'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types/task'
import { 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Briefcase, 
  ExternalLink 
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { StatusChip } from '@/components/ui/StatusChip'
import { 
  getTaskTypeColor, 
  STATUS_COLORS, 
  PRIORITY_COLORS,
  getStatusDisplayName,
  getPriorityDisplayName
} from '@/utils/taskColors'

interface DraggableTaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
  onUndo: (taskId: string) => void
  getPriorityColor?: (priority: string) => string // Made optional since we're using new chips
}

export function DraggableTaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onComplete, 
  onUndo 
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="text-gray-400 hover:text-blue-600"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}
      
      {/* Contact and Deal Info */}
      <div className="space-y-1 mb-2">
        {task.contact && (
          <Link 
            href={`/dashboard/contacts/${task.contact.id}`}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <User className="w-3 h-3 mr-1" />
            {task.contact.first_name} {task.contact.last_name}
            <ExternalLink className="w-2 h-2 ml-1" />
          </Link>
        )}
        {task.deal && (
          <div className="flex items-center text-xs text-gray-600">
            <Briefcase className="w-3 h-3 mr-1" />
            {task.deal.title}
          </div>
        )}
      </div>
      
      {/* Task Type */}
      {task.type && (
        <div className="mb-2">
          <StatusChip
            value={task.type}
            color={getTaskTypeColor(task.type)}
            bgColor={`${getTaskTypeColor(task.type)}15`}
            textColor={getTaskTypeColor(task.type)}
            size="sm"
          />
        </div>
      )}
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <StatusChip
            value={getPriorityDisplayName(task.priority)}
            {...PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}
            size="sm"
          />
        </div>
        {task.due_date && (
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(task.due_date), 'MMM dd')}
          </div>
        )}
      </div>
      
      {task.status === 'completed' ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onUndo(task.id)
          }}
          className="w-full mt-2 px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
        >
          Move to Pending
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onComplete(task.id)
          }}
          className="w-full mt-2 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        >
          Mark Complete
        </button>
      )}
    </div>
  )
}
