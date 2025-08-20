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
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Mobile-First Month View */}
      <div className="block md:hidden h-full w-full overflow-hidden">
        {/* Mobile Month Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 w-full">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">
              {format(selectedDate, 'MMMM yyyy')}
            </div>
          </div>
        </div>

        {/* Mobile Day List */}
        <div className="flex-1 overflow-y-auto w-full">
          {days.filter(day => isSameMonth(day, selectedDate)).map(day => {
            const dayTasks = getTasksForDate(day);
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = isSameDay(day, new Date());
            const hasItems = dayTasks.length > 0 || dayAppointments.length > 0;
            
            if (!hasItems) return null; // Only show days with content on mobile
            
            return (
              <div key={day.toISOString()} className="border-b border-gray-200">
                {/* Day Header */}
                <div className={`px-4 py-3 ${
                  isToday ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-lg font-semibold ${
                        isToday ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {format(day, 'EEEE, MMMM d')}
                      </div>
                      {isToday && (
                        <div className="text-sm text-blue-600 font-medium">Today</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dayTasks.length + dayAppointments.length} items
                    </div>
                  </div>
                </div>

                {/* Day Content */}
                <div className="px-4 py-3 space-y-3">
                  {/* Tasks */}
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </div>
                          )}
                        </div>
                        <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Appointments */}
                  {dayAppointments.map(appointment => {
                    const startTime = appointment.start_datetime ? 
                      format(new Date(appointment.start_datetime), 'h:mm a') : '';
                    
                    return (
                      <div
                        key={appointment.id}
                        onClick={() => onEditAppointment(appointment)}
                        className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {appointment.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {startTime}
                            </div>
                            {appointment.location && (
                              <div className="text-sm text-gray-500 mt-1">
                                {appointment.location}
                              </div>
                            )}
                          </div>
                          <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Empty State for Mobile */}
          {days.filter(day => isSameMonth(day, selectedDate)).every(day => {
            const dayTasks = getTasksForDate(day);
            const dayAppointments = getAppointmentsForDate(day);
            return dayTasks.length === 0 && dayAppointments.length === 0;
          }) && (
            <div className="flex-1 flex items-center justify-center px-4 py-12">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  No events this month
                </div>
                <div className="text-sm text-gray-500">
                  Your calendar is clear!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Month View */}
      <div className="hidden md:flex md:flex-col md:h-full">
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
    </div>
  );
}
