import { supabase } from '@/lib/supabase'
import { Contact, ContactInsert, ContactUpdate } from '@/types/contact'

export class ContactService {
  static async getContacts(userId?: string, limit = 50, offset = 0) {
    let query = supabase
      .from('contacts')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('assigned_agent_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }
    
    return data || []
  }

  static async getContactById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select(`*, 
        communications(*),
        deals(*),
        tasks(*) 
      `)
      .eq('id', id)
      .eq('assigned_agent_id', userId)
      .single()

    if (error) throw error
    return data
  }

  static async createContact(contact: ContactInsert, userId: string) {
    const contactWithAgent = { ...contact, assigned_agent_id: userId }
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactWithAgent)
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      throw new Error(error.message || 'Failed to create contact')
    }
    return data
  }

  static async updateContact(id: string, updates: ContactUpdate, userId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('assigned_agent_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteContact(id: string, userId: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('assigned_agent_id', userId)

    if (error) throw error
  }

  static async searchContacts(query: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`*, 
          communications(count),
          deals(count),
          tasks(count)
        `)
        .eq('assigned_agent_id', userId)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error searching contacts:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in searchContacts:', error)
      throw error
    }
  }

  static async getContactsByStatus(status: string, userId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select(`*, 
        communications(count),
        deals(count),
        tasks(count)
      `)
      .eq('assigned_agent_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching contacts by status:', error)
      throw error
    }
    
    return data || []
  }
}
