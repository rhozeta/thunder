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
      style={{
        ...style,
        // Force exact compact size during drag
        height: '24px',
        minHeight: '24px',
        maxHeight: '24px',
        padding: '2px 8px',
        fontSize: '12px',
        lineHeight: '16px',
        boxSizing: 'border-box',
        contain: 'layout style paint',
      }}
      {...attributes}
      className={`bg-white border border-gray-200 rounded px-2 py-1 text-xs leading-none hover:bg-gray-50 transition-colors min-w-0 w-full flex items-center justify-between gap-2 group ${isDragging ? 'shadow-lg border-blue-400' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onEdit?.(task);
      }}
      title={task.title}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1" style={{ height: '16px', lineHeight: '16px' }}>
        <div 
          {...listeners} 
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0 group-hover:opacity-100 opacity-70 transition-opacity"
          title="Drag to move task"
          style={{ height: '12px', lineHeight: '12px' }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
        <span className="text-gray-900 truncate font-medium cursor-pointer" style={{ height: '16px', lineHeight: '16px' }}>
          {task.title}
        </span>
      </div>
      
      <div 
        className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${getStatusColor(task.status)}`}
        style={{ height: '16px', lineHeight: '16px' }}
      >
        {task.status.replace('_', ' ')}
      </div>
    </div>
  );
}
