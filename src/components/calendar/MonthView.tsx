'use client';

import { Task } from '@/types/task';
import { Appointment } from '@/types/appointment';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addDays, subDays } from 'date-fns';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCalendarTask } from './DraggableCalendarTask';
import { getAppointmentTypeColor } from '@/utils/appointmentColors';

interface MonthViewProps {
  tasks: Task[];
  appointments: Appointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEditTask: (task: Task) => void;
  onEditAppointment: (appointment: Appointment) => void;
  isTasksExpanded: boolean;
}

export function MonthView({ tasks, appointments, selectedDate, onDateSelect, onEditTask, onEditAppointment, isTasksExpanded }: MonthViewProps) {
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

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments || !Array.isArray(appointments)) return [];
    return appointments.filter(appointment => {
      if (!appointment.start_datetime) return false;
      const appointmentDate = new Date(appointment.start_datetime);
      return isSameDay(appointmentDate, date);
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
          const appointmentsForDay = getAppointmentsForDate(day);
          const { setNodeRef, isOver } = useDroppable({
            id: `calendar-day-${format(day, 'yyyy-MM-dd')}`,
          });

          const totalItems = tasksForDay.length + appointmentsForDay.length;
          const displayItems = isTasksExpanded ? totalItems : Math.min(totalItems, 3);

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
              <div className="space-y-0.5 overflow-hidden">
                <SortableContext items={tasksForDay.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0.5">
                    {/* Show tasks first */}
                    {tasksForDay.slice(0, displayItems).map((task) => (
                      <DraggableCalendarTask key={task.id} task={task} onEdit={onEditTask} />
                    ))}
                    
                    {/* Show appointments if there's space */}
                    {appointmentsForDay.slice(0, Math.max(0, displayItems - tasksForDay.length)).map((appointment) => {
                      const colors = getAppointmentTypeColor(appointment.appointment_type);
                      return (
                        <div
                          key={appointment.id}
                          className={`text-xs ${colors.bg} border ${colors.border} rounded px-1 py-0.5 cursor-pointer ${colors.hover} truncate`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditAppointment(appointment);
                          }}
                        >
                          <div className={`font-medium ${colors.text} truncate`}>
                            {appointment.start_datetime && format(new Date(appointment.start_datetime), 'HH:mm')} {appointment.title}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show "more" indicator if needed */}
                    {totalItems > 3 && !isTasksExpanded && (
                      <div className="text-xs text-gray-500 text-center font-medium">
                        +{totalItems - 3} more
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
