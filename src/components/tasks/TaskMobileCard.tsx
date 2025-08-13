'use client'

import { Task } from '@/types/task'
import { Calendar, User, Briefcase, Clock, CheckSquare, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { getTaskTypeColor, STATUS_COLORS, PRIORITY_COLORS, getStatusDisplayName, getPriorityDisplayName } from '@/utils/taskColors'

interface TaskMobileCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  onComplete?: (taskId: string) => void
  onUndo?: (taskId: string) => void
  onStatusChange?: (id: string, status: string) => void
}

export function TaskMobileCard({ task, onEdit, onDelete, onComplete, onUndo }: TaskMobileCardProps) {
  const isCompleted = task.status === 'completed'
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.type && (
            <span 
              className="text-xs font-medium px-2 py-1 rounded-full mt-1 inline-block"
              style={{
                backgroundColor: `${getTaskTypeColor(task.type)}20`,
                color: getTaskTypeColor(task.type)
              }}
            >
              {task.type}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span 
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]?.bgColor || '#F3F4F6',
              color: STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]?.textColor || '#374151'
            }}
          >
            {getStatusDisplayName(task.status)}
          </span>
          
          {task.priority && (
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]?.bgColor || '#F3F4F6',
                color: PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]?.textColor || '#374151'
              }}
            >
              {getPriorityDisplayName(task.priority)}
            </span>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="space-y-2 mb-3">
        {task.due_date && (
          <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              Due {format(new Date(task.due_date), 'MMM d, yyyy')}
              {isOverdue && <span className="ml-1 font-medium">(Overdue)</span>}
            </span>
          </div>
        )}
        
        {task.contact && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">
              {task.contact.first_name} {task.contact.last_name}
            </span>
          </div>
        )}
        
        {task.deal && (
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{task.deal.title}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          {onComplete && !isCompleted && (
            <button
              onClick={() => onComplete(task.id)}
              className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Complete
            </button>
          )}
          {onUndo && isCompleted && (
            <button
              onClick={() => onUndo(task.id)}
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              Undo
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
