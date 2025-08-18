// Modern color palette for task types
const MODERN_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Purple
  '#22C55E', // Green
  '#F43F5E', // Rose
  '#0EA5E9', // Sky
  '#65A30D', // Green-600
  '#DC2626', // Red-600
  '#7C3AED', // Violet-600
  '#059669', // Emerald-600
  '#D97706', // Amber-600
]

// Generate consistent color for task type based on name
export function getTaskTypeColor(typeName: string): string {
  if (!typeName) return '#6B7280' // Gray for empty
  
  // Create a simple hash from the string
  let hash = 0
  for (let i = 0; i < typeName.length; i++) {
    const char = typeName.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get consistent index
  const index = Math.abs(hash) % MODERN_COLORS.length
  return MODERN_COLORS[index]
}

// Get lighter background color from main color
export function getLightColor(color: string): string {
  // Convert hex to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Create lighter version (mix with white)
  const mixRatio = 0.9 // 90% white, 10% original color
  const newR = Math.round(r * (1 - mixRatio) + 255 * mixRatio)
  const newG = Math.round(g * (1 - mixRatio) + 255 * mixRatio)
  const newB = Math.round(b * (1 - mixRatio) + 255 * mixRatio)
  
  return `rgb(${newR}, ${newG}, ${newB})`
}

// Status color configurations
export const STATUS_COLORS = {
  pending: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E'
  },
  in_progress: {
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    textColor: '#1E40AF'
  },
  completed: {
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46'
  },
  cancelled: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B'
  }
}

// Priority color configurations
export const PRIORITY_COLORS = {
  low: {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: '#374151'
  },
  medium: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E'
  },
  high: {
    color: '#F97316',
    bgColor: '#FED7AA',
    textColor: '#9A3412'
  },
  urgent: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B'
  }
}

// Get display name for status
export function getStatusDisplayName(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'In Progress'
    case 'pending':
      return 'Pending'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

// Get display name for priority
export function getPriorityDisplayName(priority: string | undefined | null): string {
  if (!priority) return 'No Priority'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
