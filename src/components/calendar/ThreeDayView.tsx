'use client';

import { Task } from '@/types/task';
import { Appointment } from '@/types/appointment';
import { DroppableTaskArea } from './DroppableTaskArea';
import { DraggableAppointment } from './DraggableAppointment';
import { format, addDays, addHours, isSameDay, startOfDay, addMinutes } from 'date-fns';
import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCalendarTask } from './DraggableCalendarTask';
import { DraggableAppointmentCard } from '../tasks/DraggableAppointmentCard';

interface ThreeDayViewProps {
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

export function ThreeDayView({ tasks, appointments, selectedDate, onDateSelect, onEditTask, onEditAppointment, onUpdateAppointment, isTasksExpanded, onToggleTasksExpansion }: ThreeDayViewProps) {
  const days = [
    selectedDate,
    addDays(selectedDate, 1),
    addDays(selectedDate, 2)
  ];

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

  const timeSlots = getTimeSlots();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Mobile-First Three Day View */}
      <div className="block md:hidden h-full w-full overflow-hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 w-full">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {format(days[0], 'MMM d')} - {format(days[2], 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              3-Day View
            </div>
          </div>
        </div>

        {/* Mobile Day Cards */}
        <div className="flex-1 overflow-y-auto w-full">
          {days.map(day => {
            const dayTasks = getTasksForDate(day);
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={day.toISOString()} className="border-b border-gray-200 last:border-b-0">
                {/* Day Header */}
                <div className={`px-4 py-3 ${
                  isToday ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-lg font-semibold ${
                        isToday ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {format(day, 'EEEE, MMM d')}
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
                  {/* Tasks Section */}
                  {dayTasks.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Tasks ({dayTasks.length})
                      </div>
                      <div className="space-y-2">
                        {dayTasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => onEditTask(task)}
                            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
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
                      </div>
                    </div>
                  )}

                  {/* Appointments Section */}
                  {dayAppointments.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Appointments ({dayAppointments.length})
                      </div>
                      <div className="space-y-2">
                        {dayAppointments.map(appointment => {
                          const startTime = appointment.start_datetime ? 
                            format(new Date(appointment.start_datetime), 'h:mm a') : '';
                          const endTime = appointment.end_datetime ? 
                            format(new Date(appointment.end_datetime), 'h:mm a') : '';
                          
                          return (
                            <div
                              key={appointment.id}
                              onClick={() => onEditAppointment(appointment)}
                              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {appointment.title}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {startTime}{endTime && ` - ${endTime}`}
                                  </div>
                                  {appointment.location && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      📍 {appointment.location}
                                    </div>
                                  )}
                                </div>
                                <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
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
                  )}

                  {/* Empty State */}
                  {dayTasks.length === 0 && dayAppointments.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-sm">No tasks or appointments</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Three Day View */}
      <div className="hidden md:flex md:flex-col md:h-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <div className="flex" style={{ minWidth: '600px' }}>
              {/* Timeline Column Header */}
              <div className="w-16 lg:w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
                <div className="h-16 lg:h-20 border-b border-gray-200">
                </div>
              </div>

              {/* Days Headers */}
              <div className="flex-1 grid grid-cols-3 gap-px bg-gray-200">
            {days.map(day => (
              <div key={day.toISOString()} className="bg-gray-50">
                {/* Day Header */}
                <div className="border-b border-gray-200 px-2 py-2 text-center">
                  <div className="text-xs font-medium text-gray-900">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-sm font-bold ${
                    isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'MMM d')}
                  </div>
                </div>
                
                {/* Tasks Section */}
                <div className="bg-white p-1">
                  <DroppableTaskArea
                    date={day}
                    tasks={getTasksForDate(day)}
                    onEditTask={onEditTask}
                    isExpanded={isTasksExpanded}
                  />
                </div>
              </div>
            ))}
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
        <div className="flex" style={{ minWidth: '1200px' }}>
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

          {/* Days Timeline Grid */}
          <div className="flex-1 grid grid-cols-3 gap-px bg-gray-200">
            {days.map(day => {
              const dayAppointments = getAppointmentsForDate(day);

              return (
                <div key={day.toISOString()} className="bg-white relative">
                  {/* Timeline Section */}
                  <div className="relative">
                    {timeSlots.map(hour => (
                      <div key={hour} className="h-15 border-b border-gray-100 relative">
                        {/* Hour line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gray-200"></div>
                      </div>
                    ))}
                    
                    {/* Appointments positioned by time */}
                    {dayAppointments.map(appointment => {
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
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
    </div>
  );
}
