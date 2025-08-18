export const APPOINTMENT_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export const APPOINTMENT_STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const

export const DEFAULT_APPOINTMENT_TYPES = [
  'Property Showing',
  'Listing Appointment', 
  'Buyer Consultation',
  'Seller Consultation',
  'Home Inspection',
  'Appraisal Meeting',
  'Closing Meeting',
  'Open House',
  'Market Analysis Meeting',
  'Contract Review',
  'Photography Session',
  'Client Follow-up',
  'Networking Event',
  'Training/Education',
  'Administrative Meeting'
] as const

export type AppointmentPriority = typeof APPOINTMENT_PRIORITIES[number]
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number]

export interface Appointment {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime?: string
  location?: string
  appointment_type?: string
  status: AppointmentStatus
  contact_id?: string
  deal_id?: string
  assigned_user_id: string
  notes?: string
  reminder_minutes?: number
  is_recurring?: boolean
  recurring_pattern?: string | null
  recurring_end_date?: string | null
  google_calendar_event_id?: string | null
  created_at: string
  updated_at: string
  // Joined data
  contact?: {
    id: string
    first_name: string
    last_name: string
  } | null
  deal?: {
    id: string
    title: string
  } | null
}

export interface AppointmentInsert {
  title: string
  description?: string | null
  start_datetime: string
  end_datetime?: string | null
  location?: string | null
  appointment_type?: string | null
  status: AppointmentStatus
  contact_id?: string | null
  deal_id?: string | null
  assigned_user_id: string
  notes?: string | null
  reminder_minutes?: number
  is_recurring?: boolean
  recurring_pattern?: string | null
  recurring_end_date?: string | null
  google_calendar_event_id?: string | null
}

export interface AppointmentUpdate {
  title?: string
  description?: string | undefined
  start_datetime?: string
  end_datetime?: string | undefined
  location?: string | undefined
  appointment_type?: string | undefined
  status?: AppointmentStatus
  contact_id?: string | undefined
  deal_id?: string | undefined
  assigned_user_id?: string
  notes?: string | undefined
  reminder_minutes?: number
  is_recurring?: boolean
  recurring_pattern?: string | null
  recurring_end_date?: string | null
  google_calendar_event_id?: string | null
}

export interface AppointmentType {
  id: string
  name: string
  color: string
  is_default: boolean
  user_id: string | null
  created_at: string
  updated_at: string
}
