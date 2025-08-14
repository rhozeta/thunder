'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { Calendar, User, Briefcase } from 'lucide-react';

interface DraggableCalendarTaskProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function DraggableCalendarTask({ task, onEdit }: DraggableCalendarTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full"
      onClick={(e) => {
        // Allow edit button clicks and task content clicks
        const target = e.target as HTMLElement;
        if (!target.closest('.edit-button')) {
          e.stopPropagation();
          onEdit?.(task);
        }
      }}
    >
      <div className="task-content min-w-0">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium text-gray-900 text-sm leading-tight break-words flex-1">{task.title}</div>
            <div
              {...listeners}
              className="drag-handle text-gray-400 hover:text-gray-600 cursor-move p-1 flex-shrink-0"
              title="Drag to move task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          </div>
          
          {task.contact && (
            <div className="flex items-center text-xs text-gray-600 min-w-0">
              <User className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {task.contact.first_name} {task.contact.last_name}
              </span>
            </div>
          )}
          
          {task.deal && (
            <div className="flex items-center text-xs text-gray-500 min-w-0">
              <Briefcase className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{task.deal.title}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
              <span className="text-xs text-gray-500 capitalize truncate">{task.priority}</span>
            </div>
            
            <div className={`text-xs px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </div>
          </div>
          
          {task.type && (
            <div className="text-xs text-gray-500 truncate">{task.type}</div>
          )}
        </div>
      </div>
    </div>
  );
}
