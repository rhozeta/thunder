export interface Deal {
  id: string
  title: string
  description?: string
  status: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  deal_type: 'buying' | 'selling' | 'renting' | 'investment'
  property_address?: string
  price?: number
  commission?: number
  probability?: number
  expected_close_date?: string
  assigned_agent_id: string
  contact_id?: string
  created_at: string
  updated_at: string
  contacts?: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
}

export interface DealInsert {
  title: string
  description?: string
  status?: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  deal_type?: 'buying' | 'selling' | 'renting' | 'investment'
  property_address?: string
  price?: number
  commission?: number
  probability?: number
  expected_close_date?: string
  assigned_agent_id: string
  contact_id?: string
}

export interface DealUpdate {
  title?: string
  description?: string
  status?: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  deal_type?: 'buying' | 'selling' | 'renting' | 'investment'
  property_address?: string
  price?: number
  commission?: number
  probability?: number
  expected_close_date?: string
  contact_id?: string
}

export const DEAL_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' }
]

export const DEAL_TYPE_OPTIONS = [
  { value: 'buying', label: 'Buying' },
  { value: 'selling', label: 'Selling' },
  { value: 'renting', label: 'Renting' },
  { value: 'investment', label: 'Investment' }
]
