'use client';

import { Task } from '@/types/task';
import { useDraggable } from '@dnd-kit/core';
import { formatDistanceToNow } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface UnscheduledTasksSidebarProps {
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
  onAddTask?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  onEditTask?: (task: Task) => void;
}

export function UnscheduledTasksSidebar({ tasks, isOpen, onToggle, onAddTask, onCollapsedChange, onEditTask }: UnscheduledTasksSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapsedChange?.(collapsed);
  };
  const { setNodeRef } = useDraggable({
    id: 'unscheduled-sidebar',
  });

  if (!isOpen) return null;

  return (
    <div
      ref={setNodeRef}
      className={`fixed right-0 top-0 h-full bg-white shadow-sm border-l border-gray-200 z-40 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className={`border-b border-gray-200 ${isCollapsed ? 'p-2' : 'p-6'}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Unscheduled Tasks</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {tasks.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onAddTask}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Add new task"
              >
                <Plus className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={() => handleCollapse(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Collapse sidebar"
              >
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 w-full">
            <button
              onClick={() => handleCollapse(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group w-full flex justify-center"
              title="Expand sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="bg-blue-100 text-blue-800 text-xs font-bold px-1 py-1 rounded-full min-w-[20px] text-center">
              {tasks.length}
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      {!isCollapsed && (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No unscheduled tasks</p>
                <button
                  onClick={onAddTask}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <DraggableTask key={task.id} task={task} onEdit={onEditTask} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DraggableTask({ task, onEdit }: { task: Task; onEdit?: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
      onClick={(e) => {
        // Allow clicking anywhere on the task to edit, except the drag handle
        const target = e.target as HTMLElement;
        if (!target.closest('.drag-handle')) {
          e.stopPropagation();
          onEdit?.(task);
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">{task.title}</h4>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div
            {...listeners}
            className="drag-handle text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
            title="Drag to move task"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            task.priority === 'urgent' ? 'bg-red-500' :
            task.priority === 'high' ? 'bg-orange-500' :
            task.priority === 'medium' ? 'bg-yellow-500' :
            'bg-green-500'
          }`} />
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mb-2 capitalize">{task.type || 'General'}</p>
      
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
        {task.contact && (
          <span className="text-xs text-gray-500 truncate max-w-[100px]">
            {task.contact.first_name} {task.contact.last_name}
          </span>
        )}
      </div>
      
      {task.deal && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-blue-600 font-medium">{task.deal.title}</span>
          {task.contact && (
            <div>Contact: {task.contact.first_name} {task.contact.last_name}</div>
          )}
          {task.deal && (
            <div>Deal: {task.deal.title}</div>
          )}
        </div>
      )}
    </div>
  );
}
