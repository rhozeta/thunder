'use client';

import { Task } from '@/types/task';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ThreeDayView } from './ThreeDayView';

interface CalendarProps {
  tasks: Task[];
  view: 'month' | 'week' | '3day' | 'day';
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEditTask: (task: Task) => void;
}

export function Calendar({ tasks, view, selectedDate, onDateSelect, onEditTask }: CalendarProps) {
  const renderView = () => {
    switch (view) {
      case 'month':
        return (
          <MonthView
            tasks={tasks}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
          />
        );
      case 'week':
        return (
          <WeekView
            tasks={tasks}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
          />
        );
      case '3day':
        return (
          <ThreeDayView
            tasks={tasks}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
          />
        );
      case 'day':
        return (
          <DayView
            tasks={tasks}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {renderView()}
    </div>
  );
}
