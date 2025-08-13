import { supabase } from '@/lib/supabase'
import { Activity, ActivityInsert, ActivityUpdate } from '@/types/activity'

export const ActivitiesService = {
  async getByContact(contactId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('occurred_at', { ascending: false })

    if (error) {
      console.error('Error fetching activities by contact:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }

    return data || []
  },

  async getByUser(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })

    if (error) {
      console.error('Error fetching activities by user:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }

    return data || []
  },

  async create(activity: ActivityInsert): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }

    return data
  },

  async update(id: string, update: ActivityUpdate): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating activity:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }

    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting activity:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      })
      throw error
    }
  },
}
