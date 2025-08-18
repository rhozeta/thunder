'use client';

import { Task } from '@/types/task';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCalendarTask } from './DraggableCalendarTask';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';

interface DroppableTaskAreaProps {
  date: Date;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  isExpanded: boolean;
}

export function DroppableTaskArea({ date, tasks, onEditTask, isExpanded }: DroppableTaskAreaProps) {
  const [hasOverflow, setHasOverflow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-day-${format(date, 'yyyy-MM-dd')}`,
  });

  // Check if content overflows container
  useEffect(() => {
    setHasOverflow(tasks.length > 4);
  }, [tasks]);

  const maxVisibleTasks = 4;
  const displayTasks = isExpanded ? tasks : tasks.slice(0, maxVisibleTasks);
  const hiddenTasksCount = Math.max(0, tasks.length - maxVisibleTasks);

  return (
    <div className="flex flex-col bg-white border border-gray-200">
      <div 
        ref={(node) => {
          setNodeRef(node);
          containerRef.current = node;
        }}
        className={`${isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed rounded' : ''} p-2 min-h-32`}
      >
        <div ref={contentRef} className="space-y-1">
          {tasks.length > 0 ? (
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-0.5">
                {displayTasks.map(task => (
                  <div key={task.id} className="text-xs leading-none">
                    <DraggableCalendarTask
                      task={task}
                      onEdit={onEditTask}
                    />
                  </div>
                ))}
                
                {/* Show "+ x more" label when there are hidden tasks and not expanded */}
                {!isExpanded && hiddenTasksCount > 0 && (
                  <div className="text-xs text-gray-500 text-center font-medium py-1">
                    +{hiddenTasksCount} more
                  </div>
                )}
              </div>
            </SortableContext>
          ) : (
            <div className="text-center text-gray-400 py-6">
              <div className="text-xs">Drop tasks here</div>
            </div>
          )}
        </div>
      </div>
      

    </div>
  );
}
