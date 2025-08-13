export type ActivityType = 'call' | 'email' | 'sms' | 'meeting' | 'note'
export type ActivityDirection = 'inbound' | 'outbound' | 'none'

export interface Activity {
  id: string
  created_at: string
  updated_at: string | null
  contact_id: string | null
  user_id: string
  type: ActivityType
  direction: ActivityDirection
  title: string
  notes: string | null
  occurred_at: string // ISO timestamp when the activity actually happened
}

export interface ActivityInsert {
  id?: string
  created_at?: string
  updated_at?: string | null
  contact_id?: string | null
  user_id: string
  type: ActivityType
  direction: ActivityDirection
  title: string
  notes?: string | null
  occurred_at: string
}

export interface ActivityUpdate {
  id?: string
  created_at?: string
  updated_at?: string | null
  contact_id?: string | null
  user_id?: string
  type?: ActivityType
  direction?: ActivityDirection
  title?: string
  notes?: string | null
  occurred_at?: string
}
