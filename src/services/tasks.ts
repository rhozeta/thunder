import { supabase } from '@/lib/supabase'
import { Task, TaskInsert, TaskUpdate } from '@/types/task'

export const TaskService = {
  async getTasksByContact(contactId: string): Promise<Task[]> {
    // First try with joins, fall back to basic query if tables don't exist
    let { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(
          id,
          first_name,
          last_name
        )
      `)
      .eq('contact_id', contactId)
      .order('due_date', { ascending: true })

    // If the join fails, try basic query
    if (error) {
      console.warn('Join query failed, trying basic query:', error.message)
      const basicResult = await supabase
        .from('tasks')
        .select('*')
        .eq('contact_id', contactId)
        .order('due_date', { ascending: true })
      
      if (basicResult.error) {
        console.error('Error fetching tasks:', {
          message: basicResult.error.message,
          details: (basicResult.error as any).details,
          hint: (basicResult.error as any).hint,
          code: (basicResult.error as any).code,
        })
        throw basicResult.error
      }
      
      return basicResult.data || []
    }

    return data || []
  },

  async getTasksByUser(userId: string): Promise<Task[]> {
    // First try with joins, fall back to basic query if tables don't exist
    let { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        contact:contacts(
          id,
          first_name,
          last_name
        )
      `)
      .eq('assigned_user_id', userId)
      .order('due_date', { ascending: true })

    // If the join fails (e.g., foreign key constraints), try basic query
    if (error) {
      console.warn('Join query failed, trying basic query:', error.message)
      const basicResult = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_user_id', userId)
        .order('due_date', { ascending: true })
      
      if (basicResult.error) {
        console.error('Error fetching user tasks:', {
          message: basicResult.error.message,
          details: (basicResult.error as any).details,
          hint: (basicResult.error as any).hint,
          code: (basicResult.error as any).code,
        })
        throw basicResult.error
      }
      
      return basicResult.data || []
    }

    return data || []
  },

  async createTask(task: TaskInsert): Promise<Task> {
    // TEMP: verify auth context and payload before insert to troubleshoot RLS
    try {
      const { data: userRes } = await supabase.auth.getUser()
      console.log('TaskService.createTask auth user:', userRes?.user?.id)
      console.log('TaskService.createTask payload:', task)
    } catch (e) {
      console.warn('TaskService.createTask unable to read auth user:', e)
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }

    return data
  },

  async updateTask(id: string, task: TaskUpdate): Promise<Task> {
    console.log('TaskService.updateTask called with:', { id, task })
    
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single()

    console.log('TaskService.updateTask response:', { data, error })

    if (error) {
      console.error('Error updating task:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
        fullError: error
      })
      throw new Error(`Failed to update task: ${error.message || 'Unknown error'}`)
    }

    if (!data) {
      throw new Error('No data returned from task update')
    }

    return data
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting task:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }
  },

  async markTaskComplete(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error marking task complete:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }

    return data
  }
}
