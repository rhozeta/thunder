import { supabase } from '@/lib/supabase'
import { AppointmentType } from '@/types/appointment'

export class AppointmentTypesService {
  static async getAppointmentTypes(userId: string): Promise<AppointmentType[]> {
    const { data, error } = await supabase
      .from('appointment_types')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${userId}`)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching appointment types:', error)
      throw error
    }

    return data || []
  }

  static async createAppointmentType(
    name: string, 
    userId: string, 
    color: string = '#3B82F6'
  ): Promise<AppointmentType> {
    const { data, error } = await supabase
      .from('appointment_types')
      .insert({
        name,
        color,
        user_id: userId,
        is_default: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating appointment type:', error)
      throw error
    }

    return data
  }

  static async updateAppointmentType(
    id: string, 
    updates: { name?: string; color?: string }
  ): Promise<AppointmentType> {
    const { data, error } = await supabase
      .from('appointment_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating appointment type:', error)
      throw error
    }

    return data
  }

  static async deleteAppointmentType(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointment_types')
      .delete()
      .eq('id', id)
      .eq('is_default', false) // Only allow deletion of custom types

    if (error) {
      console.error('Error deleting appointment type:', error)
      throw error
    }
  }

  static async getAppointmentTypeByName(
    name: string, 
    userId: string
  ): Promise<AppointmentType | null> {
    const { data, error } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('name', name)
      .or(`is_default.eq.true,user_id.eq.${userId}`)
      .single()

    if (error) {
      console.error('Error fetching appointment type by name:', error)
      return null
    }

    return data
  }
}
