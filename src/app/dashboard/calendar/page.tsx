'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '../../../components/calendar/Calendar';
import { CalendarHeader } from '../../../components/calendar/CalendarHeader';
import { UnscheduledTasksSidebar } from '../../../components/calendar/UnscheduledTasksSidebar';
import { TaskSidebar } from '../../../components/tasks/TaskSidebar';
import { useTasks } from '../../../hooks/useTasks';
import { Task } from '@/types/task';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';


export default function CalendarPage() {
  const { tasks, updateTask, deleteTask, loading } = useTasks();
  const [view, setView] = useState<'day' | 'week' | 'month' | '3day'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const handleTaskSave = (updatedTask?: Task) => {
    setTaskSidebarOpen(false);
    setSelectedTask(null);
    // Task updates are handled by optimistic updates in useTasks
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
    setTaskSidebarOpen(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
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
      <div className="flex h-full bg-gray-50">
        <div className="flex-1 flex flex-col">
          <CalendarHeader 
            view={view} 
            setView={setView} 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
          <div className="flex-1 overflow-hidden p-4">
            <Calendar
              tasks={tasksWithDueDates}
              view={view}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onEditTask={handleEditTask}
            />
          </div>
        </div>
        
        {sidebarOpen && (
          <div className="flex-shrink-0 h-full bg-white border-l border-gray-200 transition-all duration-300" style={{width: sidebarCollapsed ? '48px' : '320px'}}>
            <UnscheduledTasksSidebar
              tasks={unscheduledTasks}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              onAddTask={handleAddTask}
              onCollapsedChange={setSidebarCollapsed}
              onEditTask={handleEditTask}
            />
          </div>
        )}

        <TaskSidebar
          task={selectedTask}
          isOpen={taskSidebarOpen}
          onClose={() => setTaskSidebarOpen(false)}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
        
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="bg-white shadow-2xl rounded-lg p-4 border border-blue-500 transform rotate-3 opacity-90">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-gray-900">{activeTask.title}</h4>
                {isUpdating && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {activeTask.type || 'No type'}
              </p>
              <div className="mt-2 flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  activeTask.priority === 'urgent' ? 'bg-red-500' :
                  activeTask.priority === 'high' ? 'bg-orange-500' :
                  activeTask.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <span className="text-xs text-gray-500 capitalize">{activeTask.priority}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
