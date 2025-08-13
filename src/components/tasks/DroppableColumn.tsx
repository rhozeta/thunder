'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types/task'
import { DraggableTaskCard } from './DraggableTaskCard'

interface DroppableColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
  onUndoTask: (taskId: string) => void
}

export function DroppableColumn({
  status,
  tasks,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onUndoTask
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const getStatusDisplayName = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress'
      case 'pending':
        return 'Pending'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return String(status).charAt(0).toUpperCase() + String(status).slice(1)
    }
  }

  const getColumnBackgroundColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'in_progress':
        return 'bg-blue-50 border-blue-200'
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'cancelled':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getDropHoverColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-300'
      case 'in_progress':
        return 'bg-blue-100 border-blue-300'
      case 'completed':
        return 'bg-green-100 border-green-300'
      case 'cancelled':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 border transition-colors ${
        isOver 
          ? `${getDropHoverColor(status)} ring-2 ring-opacity-50` 
          : getColumnBackgroundColor(status)
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">
          {getStatusDisplayName(status)}
        </h3>
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onComplete={onCompleteTask}
              onUndo={onUndoTask}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No {status.toLowerCase()} tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
