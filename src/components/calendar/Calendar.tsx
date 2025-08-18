'use client';

import { Task } from '@/types/task';
import { Appointment } from '@/types/appointment';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ThreeDayView } from './ThreeDayView';

interface CalendarProps {
  tasks: Task[];
  appointments: Appointment[];
  view: 'month' | 'week' | '3day' | 'day';
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEditTask: (task: Task) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
  isTasksExpanded: boolean;
  onToggleTasksExpansion: () => void;
}

export function Calendar({ tasks, appointments, view, selectedDate, onDateSelect, onEditTask, onEditAppointment, onUpdateAppointment, isTasksExpanded, onToggleTasksExpansion }: CalendarProps) {
  const renderView = () => {
    switch (view) {
      case 'month':
        return (
          <MonthView
            tasks={tasks}
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
            onEditAppointment={onEditAppointment}
            isTasksExpanded={isTasksExpanded}
          />
        );
      case 'week':
        return (
          <WeekView
            tasks={tasks}
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
            onEditAppointment={onEditAppointment}
            onUpdateAppointment={onUpdateAppointment}
            isTasksExpanded={isTasksExpanded}
            onToggleTasksExpansion={onToggleTasksExpansion}
          />
        );
      case '3day':
        return (
          <ThreeDayView
            tasks={tasks}
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
            onEditAppointment={onEditAppointment}
            onUpdateAppointment={onUpdateAppointment}
            isTasksExpanded={isTasksExpanded}
            onToggleTasksExpansion={onToggleTasksExpansion}
          />
        );
      case 'day':
        return (
          <DayView
            tasks={tasks}
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onEditTask={onEditTask}
            onEditAppointment={onEditAppointment}
            onUpdateAppointment={onUpdateAppointment}
            isTasksExpanded={isTasksExpanded}
            onToggleTasksExpansion={onToggleTasksExpansion}
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
