'use client'

import { Task } from '@/types/task'
import { TaskMobileCard } from './TaskMobileCard'

interface TasksListProps {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
}

export function TasksList({ tasks, onEdit, onDelete, onStatusChange }: TasksListProps) {

  return (
    <div>
      {/* Mobile Card View */}
      <div className="lg:hidden">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks to display
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskMobileCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop List View */}
      <div className="hidden lg:block">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks to display
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">Status: {task.status}</span>
                      <span className="capitalize">Priority: {task.priority}</span>
                      {task.due_date && (
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                      {task.contact && (
                        <span>
                          Contact: {task.contact.first_name} {task.contact.last_name}
                        </span>
                      )}
                      {task.deal && (
                        <span>Deal: {task.deal.title}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {onStatusChange && task.status && (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange?.(task.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(task)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
