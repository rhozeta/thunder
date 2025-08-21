import { supabase } from '@/lib/supabase'
import { Deal, DealInsert, DealUpdate } from '@/types/deal'

export class DealService {
  static async getDeals(userId?: string, limit = 50, offset = 0) {
    try {
      let query = supabase
        .from('deals')
        .select(`*, 
          contacts(first_name, last_name, email, phone)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (userId) {
        query = query.eq('assigned_agent_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching deals:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getDeals:', error)
      throw error
    }
  }

  static async getDealById(id: string) {
    const { data, error } = await supabase
      .from('deals')
      .select(`*, 
        contacts(first_name, last_name, email, phone)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createDeal(deal: DealInsert) {
    const { data, error } = await supabase
      .from('deals')
      .insert(deal)
      .select(`*, 
        contacts(first_name, last_name, email, phone)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async updateDeal(id: string, deal: DealUpdate) {
    const { data, error } = await supabase
      .from('deals')
      .update(deal)
      .eq('id', id)
      .select(`*, 
        contacts(first_name, last_name, email, phone)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async deleteDeal(id: string) {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async searchDeals(userId: string, query: string, status?: string) {
    try {
      let searchQuery = supabase
        .from('deals')
        .select(`*, 
          contacts(first_name, last_name, email, phone)
        `)
        .eq('assigned_agent_id', userId)
        .or(`title.ilike.%${query}%,contacts.first_name.ilike.%${query}%,contacts.last_name.ilike.%${query}%`)

      if (status && status !== 'all') {
        searchQuery = searchQuery.eq('status', status)
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching deals:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in searchDeals:', error)
      throw error
    }
  }

  static async getDealsByStatus(userId: string, status: string) {
    const { data, error } = await supabase
      .from('deals')
      .select(`*, 
        contacts!inner(first_name, last_name, email, phone)
      `)
      .eq('contacts.assigned_agent_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
