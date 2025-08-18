'use client';

import { Task } from '@/types/task';
import { Appointment } from '@/types/appointment';
import { DroppableTaskArea } from './DroppableTaskArea';
import { DroppableDayColumn } from './DroppableDayColumn';
import { DraggableAppointment } from './DraggableAppointment';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addHours, startOfDay, isSameDay, addMinutes, differenceInMinutes } from 'date-fns';
import { useState } from 'react';
import { DraggableCalendarTask } from './DraggableCalendarTask';
import { DraggableAppointmentCard } from '../tasks/DraggableAppointmentCard';

interface WeekViewProps {
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

export function WeekView({ tasks, appointments, selectedDate, onDateSelect, onEditTask, onEditAppointment, onUpdateAppointment, isTasksExpanded, onToggleTasksExpansion }: WeekViewProps) {
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
    <div className="h-full flex flex-col">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex" style={{ minWidth: '1500px' }}>
            {/* Timeline Column Header */}
            <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
              {/* Day Header Height */}
              <div className="h-16 border-b border-gray-200 flex items-center justify-center">
                <div className="text-xs font-medium text-gray-900">
                  {format(selectedDate, 'MMM yyyy')}
                </div>
              </div>
              
              {/* Tasks Section Spacer */}
              <div className="bg-gray-50 border-b border-gray-200" style={{ minHeight: '60px' }}>
              </div>
            </div>

            {/* Days Headers */}
            <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
              {days.map(day => (
                <div key={day.toISOString()} className="bg-gray-50">
                  {/* Day Header */}
                  <div className="h-16 border-b border-gray-200 px-2 py-2 text-center flex flex-col justify-center">
                    <div className="text-xs font-medium text-gray-900">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-sm font-bold ${
                      isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  {/* Tasks Section */}
                  <div className="bg-white border-b border-gray-200">
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
          <div className="flex" style={{ minWidth: '1500px' }}>
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
            <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
              {days.map(day => {
                const dayAppointments = getAppointmentsForDate(day);

                return (
                  <div
                    key={day.toISOString()}
                    className="bg-white relative"
                  >
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
        
        {/* Global Tasks Expansion Strip */}
        <div className="border-t border-gray-200 bg-gray-50">
          <button
            onClick={onToggleTasksExpansion}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-gray-100 transition-colors"
          >
            {isTasksExpanded ? 'Show Less Tasks' : 'Show All Tasks'}
          </button>
        </div>
      </div>
  );
}
