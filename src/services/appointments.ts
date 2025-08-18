import { supabase } from '@/lib/supabase'
import { Appointment, AppointmentInsert, AppointmentUpdate } from '@/types/appointment'

export class AppointmentService {
  static async getAppointments(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .eq('assigned_user_id', userId)
      .order('start_datetime', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }

    return data || []
  }

  static async getAppointmentsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .eq('assigned_user_id', userId)
      .gte('start_datetime', startDate)
      .lte('start_datetime', endDate)
      .order('start_datetime', { ascending: true })

    if (error) {
      console.error('Error fetching appointments by date range:', error)
      throw error
    }

    return data || []
  }

  static async getAppointmentsByStatus(
    status: string, 
    userId: string
  ): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .eq('assigned_user_id', userId)
      .eq('status', status)
      .order('start_datetime', { ascending: true })

    if (error) {
      console.error('Error fetching appointments by status:', error)
      throw error
    }

    return data || []
  }

  static async searchAppointments(
    query: string, 
    userId: string
  ): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .eq('assigned_user_id', userId)
      .or(`title.ilike.%${query}%, description.ilike.%${query}%, location.ilike.%${query}%`)
      .order('start_datetime', { ascending: true })

    if (error) {
      console.error('Error searching appointments:', error)
      throw error
    }

    return data || []
  }

  static async createAppointment(appointment: AppointmentInsert): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .single()

    if (error) {
      console.error('Error creating appointment:', error)
      throw error
    }

    return data
  }

  static async updateAppointment(
    id: string, 
    updates: AppointmentUpdate
  ): Promise<Appointment> {
    if (!id) {
      throw new Error('Appointment ID is required for update');
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Update data is required');
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .single()

    if (error) {
      console.error('Error updating appointment:', error);
      throw error
    }

    if (!data) {
      throw new Error('No appointment data returned after update');
    }

    return data
  }

  static async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }

  static async getAppointment(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching appointment:', error)
      return null
    }

    return data
  }

  static async getUpcomingAppointments(
    userId: string, 
    limit: number = 10
  ): Promise<Appointment[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        deal:deals(id, title)
      `)
      .eq('assigned_user_id', userId)
      .gte('start_datetime', now)
      .in('status', ['scheduled', 'confirmed'])
      .order('start_datetime', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching upcoming appointments:', error)
      throw error
    }

    return data || []
  }

  static async getTodaysAppointments(userId: string): Promise<Appointment[]> {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    return this.getAppointmentsByDateRange(userId, startOfDay, endOfDay)
  }
}
