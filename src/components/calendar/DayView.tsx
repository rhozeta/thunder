'use client';

import { Task } from '@/types/task';
import { Appointment } from '@/types/appointment';
import { format, startOfDay, addHours, eachHourOfInterval, isSameDay } from 'date-fns';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCalendarTask } from './DraggableCalendarTask';
import { DroppableTaskArea } from './DroppableTaskArea';
import { DraggableAppointment } from './DraggableAppointment';

interface DayViewProps {
  tasks: Task[];
  appointments: Appointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEditTask: (task: Task) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
  isTasksExpanded: boolean;
  onToggleTasksExpansion: () => void;
}

export function DayView({ tasks, appointments, selectedDate, onDateSelect, onEditTask, onEditAppointment, onUpdateAppointment, isTasksExpanded, onToggleTasksExpansion }: DayViewProps) {
  const dayStart = startOfDay(selectedDate);
  const hours = eachHourOfInterval({
    start: dayStart,
    end: addHours(dayStart, 23)
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => task.due_date && isSameDay(new Date(task.due_date), date));
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments || !Array.isArray(appointments)) return [];
    return appointments.filter(appointment => {
      if (!appointment.start_datetime) return false;
      const appointmentDate = new Date(appointment.start_datetime);
      return isSameDay(appointmentDate, date);
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const getAppointmentPosition = (appointment: Appointment) => {
    if (!appointment.start_datetime) return { top: 0, height: 60 };
    
    const start = new Date(appointment.start_datetime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    
    let duration = 60; // Default 1 hour
    if (appointment.end_datetime) {
      const end = new Date(appointment.end_datetime);
      duration = Math.max(30, (end.getTime() - start.getTime()) / (1000 * 60)); // Min 30 minutes
    }
    
    return {
      top: (startMinutes / 60) * 60, // 60px per hour
      height: Math.max(30, (duration / 60) * 60) // Min 30px height
    };
  };

  const tasksForDay = getTasksForDate(selectedDate);
  const appointmentsForDay = getAppointmentsForDate(selectedDate);
  const timeSlots = getTimeSlots();

  const currentDate = selectedDate;

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex" style={{ minWidth: '500px' }}>
          {/* Timeline Column Header */}
          <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            <div className="h-32 border-b border-gray-200">
            </div>
          </div>

          {/* Day Header */}
          <div className="flex-1 bg-gray-50">
            {/* Day Header */}
            <div className="border-b border-gray-200 px-4 py-3 text-center">
              <div className="text-lg font-medium text-gray-900">
                {format(currentDate, 'EEEE')}
              </div>
              <div className={`text-2xl font-bold ${
                isSameDay(currentDate, new Date()) ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {format(currentDate, 'MMMM d, yyyy')}
              </div>
            </div>
            
            {/* Tasks Section */}
            <div className="bg-white p-1">
              <DroppableTaskArea
                date={selectedDate}
                tasks={getTasksForDate(selectedDate)}
                onEditTask={onEditTask}
                isExpanded={isTasksExpanded}
              />
            </div>
          </div>
        </div>
        
        {/* Global Tasks Expansion Strip - Spans full width */}
        <div className="flex border-t border-gray-300">
          <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200"></div>
          <div 
            onClick={onToggleTasksExpansion}
            className="flex-1 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="text-center text-xs text-blue-600 hover:text-blue-800 font-medium py-2 px-2">
              {isTasksExpanded ? 'Show Less Tasks' : `Show All Tasks (${tasks.length})`}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Timeline Section */}
      <div className="flex-1 overflow-auto" style={{ overflow: 'auto' }}>
        <div className="flex" style={{ minWidth: '500px' }}>
          {/* Timeline Column */}
          <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {/* Time Labels */}
            {timeSlots.map(hour => (
              <div key={hour} className="h-15 border-b border-gray-100 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-gray-500">
                  {format(addHours(startOfDay(new Date()), hour), 'HH:mm')}
                </span>
              </div>
            ))}
          </div>

          {/* Day Timeline */}
          <div className="flex-1 bg-white relative">
            {/* Timeline Section */}
            <div className="relative">
              {timeSlots.map(hour => (
                <div key={hour} className="h-15 border-b border-gray-100 relative">
                  {/* Hour line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gray-200"></div>
                </div>
              ))}
              
              {/* Appointments positioned by time */}
              {appointmentsForDay.map(appointment => {
                const position = getAppointmentPosition(appointment);
                return (
                  <DraggableAppointment
                    key={appointment.id}
                    appointment={appointment}
                    position={position}
                    onEdit={onEditAppointment}
                    onUpdate={onUpdateAppointment}
                    timeSlotHeight={60}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
