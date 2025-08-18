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
      className={`bg-white rounded-md p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-gray-900 text-xs leading-tight flex-1 pr-1">{task.title}</h4>
        <div className="flex items-center space-x-0.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="text-gray-400 hover:text-blue-600 p-0.5"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="text-gray-400 hover:text-red-600 p-0.5"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Description - more compact */}
      {task.description && (
        <p className="text-gray-600 text-xs mb-1 line-clamp-1">{task.description}</p>
      )}
      
      {/* Contact and Deal - inline */}
      <div className="flex items-center gap-2 mb-1 text-xs">
        {task.contact && (
          <Link 
            href={`/dashboard/contacts/${task.contact.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <User className="w-3 h-3 mr-0.5" />
            <span className="truncate max-w-20">{task.contact.first_name} {task.contact.last_name}</span>
            <ExternalLink className="w-2 h-2 ml-0.5" />
          </Link>
        )}
        {task.deal && (
          <div className="flex items-center text-gray-600 flex-shrink-0">
            <Briefcase className="w-3 h-3 mr-0.5" />
            <span className="truncate max-w-20">{task.deal.title}</span>
          </div>
        )}
      </div>
      
      {/* Bottom row - priority, type, date, and action */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <StatusChip
            value={getPriorityDisplayName(task.priority)}
            {...PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}
            size="xs"
          />
          {task.type && (
            <StatusChip
              value={task.type}
              color={getTaskTypeColor(task.type)}
              bgColor={`${getTaskTypeColor(task.type)}15`}
              textColor={getTaskTypeColor(task.type)}
              size="xs"
            />
          )}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {task.due_date && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-0.5" />
              <span className="text-xs">{format(new Date(task.due_date), 'MMM dd')}</span>
            </div>
          )}
          
          {task.status === 'completed' ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUndo(task.id)
              }}
              className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
            >
              Undo
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onComplete(task.id)
              }}
              className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
