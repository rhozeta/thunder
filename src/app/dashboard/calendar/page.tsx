'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '../../../components/calendar/Calendar';
import { CalendarHeader } from '../../../components/calendar/CalendarHeader';
import { UnscheduledTasksSidebar } from '../../../components/calendar/UnscheduledTasksSidebar';
import { TaskSidebar } from '../../../components/tasks/TaskSidebar';
import { Task } from '@/types/task';
import { Appointment } from '@/types/appointment';
import { useTasks } from '../../../hooks/useTasks';
import { useAppointments } from '../../../hooks/useAppointments';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';


export default function CalendarPage() {
  const { tasks, updateTask, deleteTask, loading } = useTasks();
  const { appointments, updateAppointment, loading: appointmentsLoading } = useAppointments();

  // Debug appointments
  useEffect(() => {
    console.log('Appointments data:', appointments);
    console.log('Appointments loading:', appointmentsLoading);
    if (appointments.length > 0) {
      console.log('Appointment dates:');
      appointments.forEach(apt => {
        console.log(`- ${apt.title}: ${apt.start_datetime} (${new Date(apt.start_datetime)})`);
      });
    }
  }, [appointments, appointmentsLoading]);

  // Use only database appointments
  const displayAppointments = appointments;
  const [view, setView] = useState<'day' | 'week' | 'month' | '3day'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Removed sidebarOpen state - always show content with responsive design
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);

  const tasksWithDueDates = tasks.filter((task: Task) => task.due_date);
  const unscheduledTasks = tasks.filter((task: Task) => !task.due_date || task.due_date === '');

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id && over.id.toString().startsWith('calendar-day-')) {
      const dateStr = over.id.toString().replace('calendar-day-', '');
      const taskId = active.id as string;
      
      setIsUpdating(true);
      try {
        // Use the date string directly without any conversion
        await updateTask(taskId, {
          due_date: dateStr
        });
      } catch (error) {
        // Error handling is already done in useTasks hook
        console.error('Failed to update task:', error);
      } finally {
        setIsUpdating(false);
      }
    }
    
    setActiveId(null);
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskSidebarOpen(true);
  };

  const handleTaskSave = (updatedItem?: Task | Appointment) => {
    if (updatedItem) {
      if ('due_date' in updatedItem) {
        // It's a Task - use the updateTask function from useTasks
        updateTask(updatedItem.id, updatedItem as Task);
      } else {
        // It's an Appointment - extract only updatable fields
        const appointment = updatedItem as Appointment;
        const updates = {
          title: appointment.title,
          description: appointment.description,
          start_datetime: appointment.start_datetime,
          end_datetime: appointment.end_datetime,
          location: appointment.location,
          appointment_type: appointment.appointment_type,
          status: appointment.status,
          contact_id: appointment.contact_id,
          deal_id: appointment.deal_id,
          reminder_minutes: appointment.reminder_minutes,
          notes: appointment.notes,
          is_recurring: appointment.is_recurring,
          recurring_pattern: appointment.recurring_pattern
        };
        updateAppointment(appointment.id, updates);
      }
    }
    setTaskSidebarOpen(false);
    setSelectedTask(null);
    setSelectedAppointment(null);
  };

  const handleTaskDelete = async (id: string, type?: 'task' | 'appointment') => {
    if (type === 'task' || !type) {
      await deleteTask(id);
    }
    // For appointments, deletion is handled by TaskSidebar
    setTaskSidebarOpen(false);
    setSelectedTask(null);
    setSelectedAppointment(null);
  };

  const handleEditTask = (item: Task | Appointment | undefined) => {
    if (item && 'due_date' in item) {
      const task = item as Task;
      setSelectedTask(task);
      setSelectedAppointment(null); // Clear appointment selection when editing task
      setTaskSidebarOpen(true);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTask(null); // Clear task selection when editing appointment
    setTaskSidebarOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="flex h-full w-full bg-gray-50 overflow-hidden">
        <div className="flex-1 relative w-full min-w-0 overflow-hidden">
          <CalendarHeader 
            view={view} 
            setView={setView} 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate}
          />
          <div className="w-full overflow-hidden">
            <Calendar
              view={view}
              selectedDate={selectedDate}
              tasks={tasksWithDueDates}
              appointments={displayAppointments}
              onDateSelect={setSelectedDate}
              onEditTask={handleEditTask}
              onEditAppointment={handleEditAppointment}
              onUpdateAppointment={updateAppointment}
              isTasksExpanded={isTasksExpanded}
              onToggleTasksExpansion={() => setIsTasksExpanded(!isTasksExpanded)}
            />
          </div>
          
          {/* Floating Add Button - Mobile */}
          <button
            onClick={handleAddTask}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
            aria-label="Add new task"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 border-l border-gray-200 bg-gray-50">
          <div className="h-full">
            <UnscheduledTasksSidebar
              tasks={unscheduledTasks}
              isOpen={true}
              onToggle={() => {}}
              onAddTask={handleAddTask}
              onCollapsedChange={setSidebarCollapsed}
              onEditTask={handleEditTask}
            />
          </div>
        </div>

        <TaskSidebar
          task={selectedTask}
          appointment={selectedAppointment}
          isOpen={taskSidebarOpen}
          onClose={() => {
            setTaskSidebarOpen(false);
            setSelectedTask(null);
            setSelectedAppointment(null);
          }}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
        
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs leading-none shadow-lg border-blue-400 flex items-center justify-between gap-2" style={{ height: '24px', minHeight: '24px', maxHeight: '24px', padding: '2px 8px', fontSize: '12px', lineHeight: '16px', boxSizing: 'border-box' }}>
              <div className="flex items-center gap-1.5 min-w-0 flex-1" style={{ height: '16px', lineHeight: '16px' }}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activeTask.priority === 'urgent' ? 'bg-red-500' :
                  activeTask.priority === 'high' ? 'bg-orange-500' :
                  activeTask.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <span className="text-gray-900 truncate font-medium" style={{ height: '16px', lineHeight: '16px' }}>
                  {activeTask.title}
                </span>
              </div>
              
              <div 
                className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${
                  activeTask.status === 'completed' ? 'bg-green-100 text-green-700' :
                  activeTask.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  activeTask.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}
                style={{ height: '16px', lineHeight: '16px' }}
              >
                {activeTask.status ? activeTask.status.replace('_', ' ') : 'No status'}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
