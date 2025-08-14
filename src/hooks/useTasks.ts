import { useState, useEffect } from 'react';
import { Task, TaskUpdate } from '@/types/task';
import { TaskService } from '@/services/tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TaskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: TaskUpdate) => {
    // Optimistic update - update UI immediately
    const previousTasks = tasks;
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updated_at: new Date().toISOString() }
        : task
    ));

    try {
      await TaskService.updateTask(taskId, updates);
    } catch (err) {
      // Revert optimistic update on error
      setTasks(previousTasks);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      ...taskData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    };

    // Optimistic update - add task to UI immediately
    setTasks(prev => [...prev, optimisticTask]);

    try {
      const newTask = await TaskService.createTask(taskData);
      // Replace temporary task with real task from server
      setTasks(prev => prev.map(task => 
        task.id === tempId ? newTask : task
      ));
    } catch (err) {
      // Remove optimistic task on error
      setTasks(prev => prev.filter(task => task.id !== tempId));
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    updateTask,
    createTask,
    deleteTask,
    refetch: fetchTasks
  };
}
