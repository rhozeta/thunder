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
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Mobile-First Day View */}
      <div className="block md:hidden h-full w-full overflow-hidden">
        {/* Mobile Day Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 w-full">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">
              {format(selectedDate, 'EEEE')}
            </div>
            <div className="text-lg text-gray-600 mt-1">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
            {isSameDay(selectedDate, new Date()) && (
              <div className="text-sm text-blue-600 font-medium mt-1">Today</div>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto w-full">
          {/* Tasks Section */}
          {tasksForDay.length > 0 && (
            <div className="bg-white border-b border-gray-200">
              <div className="px-4 py-3">
                <div className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Tasks ({tasksForDay.length})
                </div>
                <div className="space-y-3">
                  {tasksForDay.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full"
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium text-gray-900 mb-1 truncate">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-600 line-clamp-3 break-words">
                              {task.description}
                            </div>
                          )}
                        </div>
                        <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
            </div>
          )}

          {/* Appointments Timeline */}
          {appointmentsForDay.length > 0 && (
            <div className="bg-white">
              <div className="px-4 py-3">
                <div className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  Schedule ({appointmentsForDay.length})
                </div>
                <div className="space-y-3">
                  {appointmentsForDay
                    .sort((a, b) => {
                      if (!a.start_datetime || !b.start_datetime) return 0;
                      return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime();
                    })
                    .map(appointment => {
                      const startTime = appointment.start_datetime ? 
                        format(new Date(appointment.start_datetime), 'h:mm a') : '';
                      const endTime = appointment.end_datetime ? 
                        format(new Date(appointment.end_datetime), 'h:mm a') : '';
                      
                      return (
                        <div
                          key={appointment.id}
                          onClick={() => onEditAppointment(appointment)}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full"
                        >
                          <div className="flex items-start justify-between mb-2 w-full">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="font-medium text-gray-900 mb-1 truncate">
                                {appointment.title}
                              </div>
                              <div className="text-sm font-medium text-blue-600">
                                {startTime}{endTime && ` - ${endTime}`}
                              </div>
                            </div>
                            <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </div>
                          </div>
                          {appointment.location && (
                            <div className="text-sm text-gray-600 mb-1 truncate">
                              📍 {appointment.location}
                            </div>
                          )}
                          {appointment.description && (
                            <div className="text-sm text-gray-600 line-clamp-2 break-words">
                              {appointment.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {tasksForDay.length === 0 && appointmentsForDay.length === 0 && (
            <div className="flex-1 flex items-center justify-center px-4 py-12">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  No events scheduled
                </div>
                <div className="text-sm text-gray-500">
                  Your day is free!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Day View */}
      <div className="hidden md:flex md:flex-col md:h-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <div className="flex" style={{ minWidth: '400px' }}>
              {/* Timeline Column Header */}
              <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
                <div className="h-32 border-b border-gray-200">
                </div>
              </div>

              {/* Day Header */}
              <div className="flex-1 bg-gray-50">
                <div className="h-32 border-b border-gray-200 px-4 py-4 text-center flex flex-col justify-center">
                  <div className="text-sm font-medium text-gray-900">
                    {format(currentDate, 'EEEE')}
                  </div>
                  <div className={`text-lg font-bold ${
                    isSameDay(currentDate, new Date()) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(currentDate, 'MMMM d, yyyy')}
                  </div>
                </div>
                
                {/* Tasks Section */}
                <div className="bg-white border-b border-gray-200">
                  <DroppableTaskArea
                    date={currentDate}
                    tasks={tasksForDay}
                    onEditTask={onEditTask}
                    isExpanded={isTasksExpanded}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Global Tasks Expansion Strip */}
          <div className="flex border-t border-gray-300">
            <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200"></div>
            <div 
              onClick={onToggleTasksExpansion}
              className="flex-1 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="text-center text-xs text-blue-600 hover:text-blue-800 font-medium py-2 px-2">
                {isTasksExpanded ? 'Show Less Tasks' : `Show All Tasks (${tasksForDay.length})`}
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrollable Timeline Section */}
        <div className="flex-1 overflow-auto">
          <div className="overflow-x-auto">
            <div className="flex" style={{ minWidth: '400px' }}>
              {/* Timeline Column */}
              <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
                {/* Time Labels */}
                {timeSlots.map(hour => (
                  <div key={hour} className="h-12 lg:h-15 border-b border-gray-100 flex items-start justify-end pr-2 pt-1">
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
                    <div key={hour} className="h-12 lg:h-15 border-b border-gray-100 relative">
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
                        timeSlotHeight={48}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
