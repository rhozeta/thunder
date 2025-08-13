import { supabase } from '@/lib/supabase'
import { Communication, CommunicationInsert, CommunicationUpdate } from '@/types/communication'

export const CommunicationService = {
  async getCommunicationsByContact(contactId: string): Promise<Communication[]> {
    const { data, error } = await supabase
      .from('communications')
      .select(`*, user:users(id, full_name, email)`)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching communications:', error)
      throw error
    }

    return data || []
  },

  async getCommunicationsByUser(userId: string): Promise<Communication[]> {
    const { data, error } = await supabase
      .from('communications')
      .select(`*, contact:contacts(id, first_name, last_name)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user communications:', error)
      throw error
    }

    return data || []
  },

  async createCommunication(communication: CommunicationInsert): Promise<Communication> {
    const { data, error } = await supabase
      .from('communications')
      .insert(communication)
      .select(`*, user:users(id, full_name, email)`)
      .single()

    if (error) {
      console.error('Error creating communication:', error)
      throw error
    }

    return data
  },

  async updateCommunication(id: string, communication: CommunicationUpdate): Promise<Communication> {
    const { data, error } = await supabase
      .from('communications')
      .update(communication)
      .eq('id', id)
      .select(`*, user:users(id, full_name, email)`)
      .single()

    if (error) {
      console.error('Error updating communication:', error)
      throw error
    }

    return data
  },

  async deleteCommunication(id: string): Promise<void> {
    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting communication:', error)
      throw error
    }
  }
}
