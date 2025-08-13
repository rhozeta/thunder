import { supabase } from '@/lib/supabase'
import { DEFAULT_TASK_TYPES } from '@/types/task'

export interface CustomTaskType {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
}

export const TaskTypesService = {
  async getCustomTaskTypes(userId: string): Promise<CustomTaskType[]> {
    const { data, error } = await supabase
      .from('custom_task_types')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching custom task types:', error)
      return []
    }

    return data || []
  },

  async createCustomTaskType(name: string, userId: string): Promise<CustomTaskType> {
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new Error('Task type name cannot be empty')
    }

    const { data, error } = await supabase
      .from('custom_task_types')
      .insert({
        name: trimmedName,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating custom task type:', error)
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Task type already exists')
      }
      throw new Error(`Failed to create task type: ${error.message}`)
    }

    return data
  },

  async getAllTaskTypes(userId: string): Promise<string[]> {
    try {
      const customTypes = await this.getCustomTaskTypes(userId)
      const customTypeNames = customTypes.map(type => type.name)
      
      // Combine default types with custom types, removing duplicates
      const allTypes = [...DEFAULT_TASK_TYPES, ...customTypeNames]
      return Array.from(new Set(allTypes))
    } catch (error) {
      console.error('Error getting all task types:', error)
      return [...DEFAULT_TASK_TYPES]
    }
  }
}
