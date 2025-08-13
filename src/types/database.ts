export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          property_preferences: Json | null
          budget_min: number | null
          budget_max: number | null
          timeline: string | null
          contact_type: 'buyer' | 'seller' | 'investor' | 'past_client' | 'lead'
          lead_source: string | null
          lead_score: number
          status: 'new' | 'qualified' | 'nurturing' | 'lost' | 'converted'
          assigned_agent_id: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          property_preferences?: Json | null
          budget_min?: number | null
          budget_max?: number | null
          timeline?: string | null
          contact_type?: 'buyer' | 'seller' | 'investor' | 'past_client' | 'lead'
          lead_source?: string | null
          lead_score?: number
          status?: 'new' | 'qualified' | 'nurturing' | 'lost' | 'converted'
          assigned_agent_id?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          property_preferences?: Json | null
          budget_min?: number | null
          budget_max?: number | null
          timeline?: string | null
          contact_type?: 'buyer' | 'seller' | 'investor' | 'past_client' | 'lead'
          lead_source?: string | null
          lead_score?: number
          status?: 'new' | 'qualified' | 'nurturing' | 'lost' | 'converted'
          assigned_agent_id?: string | null
          notes?: string | null
        }
      }
      communications: {
        Row: {
          id: string
          created_at: string
          contact_id: string
          type: 'email' | 'sms' | 'call'
          direction: 'inbound' | 'outbound'
          subject: string | null
          content: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          contact_id: string
          type: 'email' | 'sms' | 'call'
          direction: 'inbound' | 'outbound'
          subject?: string | null
          content: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          contact_id?: string
          type?: 'email' | 'sms' | 'call'
          direction?: 'inbound' | 'outbound'
          subject?: string | null
          content?: string
          metadata?: Json | null
          user_id?: string
        }
      }
      deals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          contact_id: string
          title: string
          deal_type: 'buyer' | 'seller'
          value: number | null
          commission: number | null
          stage: 'prospect' | 'qualified' | 'showing' | 'offer' | 'under_contract' | 'closed_won' | 'closed_lost'
          probability: number
          expected_close_date: string | null
          actual_close_date: string | null
          assigned_agent_id: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          contact_id: string
          title: string
          deal_type: 'buyer' | 'seller'
          value?: number | null
          commission?: number | null
          stage?: 'prospect' | 'qualified' | 'showing' | 'offer' | 'under_contract' | 'closed_won' | 'closed_lost'
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          assigned_agent_id: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          contact_id?: string
          title?: string
          deal_type?: 'buyer' | 'seller'
          value?: number | null
          commission?: number | null
          stage?: 'prospect' | 'qualified' | 'showing' | 'offer' | 'under_contract' | 'closed_won' | 'closed_lost'
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          assigned_agent_id?: string
          notes?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          contact_id: string | null
          deal_id: string | null
          assigned_user_id: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          contact_id?: string | null
          deal_id?: string | null
          assigned_user_id: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          contact_id?: string | null
          deal_id?: string | null
          assigned_user_id?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
