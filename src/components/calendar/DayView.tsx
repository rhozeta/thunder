'use client';

import { Task } from '@/types/task';
import { format, isSameDay } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCalendarTask } from './DraggableCalendarTask';

interface DayViewProps {
  tasks: Task[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEditTask: (task: Task) => void;
}

export function DayView({ tasks, selectedDate, onDateSelect, onEditTask }: DayViewProps) {
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date + 'T00:00:00');
      return isSameDay(taskDate, date);
    });
  };

  const tasksForDay = getTasksForDate(selectedDate);

  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-day-${format(selectedDate, 'yyyy-MM-dd')}`,
  });

  return (
    <div className="h-full overflow-auto">
      <div className="overflow-x-auto">
        <div className="min-w-max" style={{ minWidth: '400px' }}>
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="text-lg font-bold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d')}
          </div>
          {isSameDay(selectedDate, new Date()) && (
            <div className="text-sm text-blue-600 font-medium">Today</div>
          )}
        </div>
        
        <div
          ref={setNodeRef}
          className={`min-h-96 p-4 ${
            isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
          }`}
        >
          {tasksForDay.length > 0 ? (
            <SortableContext items={tasksForDay.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {tasksForDay.map(task => (
                  <DraggableCalendarTask
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                  />
                ))}
              </div>
            </SortableContext>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-sm">No tasks scheduled</div>
              <div className="text-xs mt-1">Drag tasks here to schedule them</div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
