export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const
export const DEFAULT_TASK_TYPES = [
  'Lead Management',
  'Client Communication', 
  'Property & Listing Management',
  'Transaction Management',
  'Administrative Tasks',
  'Business Development',
  'Marketing & Promotion'
] as const

export type TaskPriority = typeof TASK_PRIORITIES[number]
export type TaskStatus = typeof TASK_STATUSES[number]

export interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  type: string | null
  contact_id: string | null
  deal_id: string | null
  assigned_user_id: string
  sort_order: number
  created_at: string
  updated_at: string
  completed_at: string | null
  google_calendar_event_id?: string | null
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

export interface TaskInsert {
  title: string
  description?: string | null
  due_date?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  type?: string | null
  contact_id?: string | null
  deal_id?: string | null
  assigned_user_id: string
  sort_order?: number
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  due_date?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  type?: string | null
  contact_id?: string | null
  deal_id?: string | null
  assigned_user_id?: string
  sort_order?: number
  google_calendar_event_id?: string | null
}
