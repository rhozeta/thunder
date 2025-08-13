export const COMMUNICATION_TYPES = ['email', 'sms', 'call'] as const
export const COMMUNICATION_DIRECTIONS = ['inbound', 'outbound'] as const

export type CommunicationType = typeof COMMUNICATION_TYPES[number]
export type CommunicationDirection = typeof COMMUNICATION_DIRECTIONS[number]

export interface Communication {
  id: string
  created_at: string
  contact_id: string
  type: CommunicationType
  direction: CommunicationDirection
  subject: string | null
  content: string
  metadata: any | null
  user_id: string
  user?: {
    id: string
    full_name: string
    email: string
  }
  contact?: {
    id: string
    first_name: string
    last_name: string
  }
}

export interface CommunicationInsert {
  contact_id: string
  type: CommunicationType
  direction: CommunicationDirection
  subject?: string | null
  content: string
  metadata?: any | null
  user_id: string
}

export interface CommunicationUpdate {
  contact_id?: string
  type?: CommunicationType
  direction?: CommunicationDirection
  subject?: string | null
  content?: string
  metadata?: any | null
  user_id?: string
}
