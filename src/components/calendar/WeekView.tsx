'use client';

import { Task } from '@/types/task';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addHours, isSameDay } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCalendarTask } from './DraggableCalendarTask';

interface WeekViewProps {
  tasks: Task[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEditTask: (task: Task) => void;
}

export function WeekView({ tasks, selectedDate, onDateSelect, onEditTask }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date + 'T00:00:00');
      return isSameDay(taskDate, date);
    });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-4 p-4 min-w-max" style={{ minWidth: '1400px' }}>
        {days.map(day => {
          const dayTasks = getTasksForDate(day);
          const { setNodeRef, isOver } = useDroppable({
            id: `calendar-day-${format(day, 'yyyy-MM-dd')}`,
          });

          return (
            <div key={day.toISOString()} className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-3 py-2 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-bold ${
                  isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div
                ref={setNodeRef}
                className={`p-3 min-h-96 ${
                  isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
                }`}
              >
                {dayTasks.length > 0 ? (
                  <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {dayTasks.map(task => (
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
                    <div className="text-sm">No tasks</div>
                    <div className="text-xs mt-1">Drag tasks here</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
