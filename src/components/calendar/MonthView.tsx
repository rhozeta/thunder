'use client';

import { Task } from '@/types/task';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addDays, subDays } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCalendarTask } from './DraggableCalendarTask';

interface MonthViewProps {
  tasks: Task[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEditTask: (task: Task) => void;
}

export function MonthView({ tasks, selectedDate, onDateSelect, onEditTask }: MonthViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date + 'T00:00:00');
      return isSameDay(taskDate, date);
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="px-2 py-2 text-sm font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0">
        {days.map((day, index) => {
          const tasksForDay = getTasksForDate(day);
          const { setNodeRef, isOver } = useDroppable({
            id: `calendar-day-${format(day, 'yyyy-MM-dd')}`,
          });

          return (
            <div
              key={index}
              ref={setNodeRef}
              className={`border-r border-b border-gray-200 p-1 cursor-pointer transition-all duration-200 ${
                !isSameMonth(day, selectedDate) ? 'bg-gray-50' : 'bg-white'
              } ${
                isSameDay(day, new Date()) ? 'bg-blue-50 ring-2 ring-blue-200' : ''
              } ${
                isOver ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset scale-105' : 'hover:bg-gray-50'
              }`}
              onClick={() => onDateSelect(day)}
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                <SortableContext items={tasksForDay.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0.5">
                    {tasksForDay.slice(0, 2).map((task) => (
                      <DraggableCalendarTask key={task.id} task={task} onEdit={onEditTask} />
                    ))}
                    {tasksForDay.length > 2 && (
                      <div className="text-xs text-gray-500 text-center font-medium">
                        +{tasksForDay.length - 2} more
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
