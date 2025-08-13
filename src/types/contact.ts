import { Database } from './database'

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export interface PropertyPreferences {
  property_type?: string[]
  bedrooms?: number
  bathrooms?: number
  min_sqft?: number
  max_sqft?: number
  preferred_areas?: string[]
  must_have_features?: string[]
  deal_breakers?: string[]
}

export interface ContactWithDetails extends Contact {
  last_communication?: string
  deal_count?: number
  task_count?: number
}

export const CONTACT_TYPES = [
  'buyer',
  'seller', 
  'investor',
  'past_client',
  'lead'
] as const

export const CONTACT_STATUS = [
  'new',
  'qualified',
  'nurturing',
  'lost',
  'converted'
] as const

export const LEAD_SOURCES = [
  'Zillow',
  'Facebook',
  'Instagram',
  'Google',
  'Referral',
  'Open House',
  'Website',
  'Cold Call',
  'Email Campaign',
  'Walk-in'
] as const
