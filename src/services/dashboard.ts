import { supabase } from '@/lib/supabase'
import { Deal } from '@/types/deal'
import { Contact } from '@/types/contact'
import { Task } from '@/types/task'

export interface DashboardStats {
  activeDeals: {
    count: number
    totalValue: number
    trend: number // percentage change from last period
  }
  pendingTasks: {
    count: number
    overdueCount: number
  }
  newContacts: {
    count: number
    thisWeek: number
  }
  todayEvents: {
    count: number
    tasks: Task[]
  }
}

export interface PipelineData {
  prospect: { count: number; value: number }
  qualified: { count: number; value: number }
  proposal: { count: number; value: number }
  negotiation: { count: number; value: number }
  closed_won: { count: number; value: number }
  closed_lost: { count: number; value: number }
}

export interface RecentActivity {
  id: string
  type: 'contact' | 'deal' | 'task' | 'communication'
  title: string
  description: string
  timestamp: string
  relatedEntity?: {
    id: string
    name: string
    type: string
  }
}

export class DashboardService {
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Get active deals
      const { data: deals } = await supabase
        .from('deals')
        .select('status, price, created_at')
        .eq('assigned_agent_id', userId)
        .in('status', ['prospect', 'qualified', 'proposal', 'negotiation'])

      // Get deals from last period for trend calculation
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      const { data: lastWeekDeals } = await supabase
        .from('deals')
        .select('status, price')
        .eq('assigned_agent_id', userId)
        .in('status', ['prospect', 'qualified', 'proposal', 'negotiation'])
        .lt('created_at', lastWeek.toISOString())

      // Get pending tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status, due_date')
        .eq('assigned_user_id', userId)
        .neq('status', 'completed')

      // Get contacts created this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: contacts } = await supabase
        .from('contacts')
        .select('created_at')
        .eq('assigned_agent_id', userId)

      const { data: recentContacts } = await supabase
        .from('contacts')
        .select('created_at')
        .eq('assigned_agent_id', userId)
        .gte('created_at', weekAgo.toISOString())

      // Get today's tasks (using local timezone)
      const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format in local timezone
      const { data: todayTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_user_id', userId)
        .eq('due_date', today)
      
      console.log('Dashboard Service Debug:', {
        todayDate: today,
        todayTasksFound: todayTasks?.length || 0,
        userId
      })

      // Calculate stats
      const activeDealsCount = deals?.length || 0
      const activeDealsValue = deals?.reduce((sum, deal) => sum + (deal.price || 0), 0) || 0
      const lastWeekDealsValue = lastWeekDeals?.reduce((sum, deal) => sum + (deal.price || 0), 0) || 0
      const trend = lastWeekDealsValue > 0 ? ((activeDealsValue - lastWeekDealsValue) / lastWeekDealsValue) * 100 : 0

      const pendingTasksCount = tasks?.length || 0
      const overdueCount = tasks?.filter(task => {
        if (!task.due_date) return false
        return new Date(task.due_date) < new Date()
      }).length || 0

      return {
        activeDeals: {
          count: activeDealsCount,
          totalValue: activeDealsValue,
          trend
        },
        pendingTasks: {
          count: pendingTasksCount,
          overdueCount
        },
        newContacts: {
          count: contacts?.length || 0,
          thisWeek: recentContacts?.length || 0
        },
        todayEvents: {
          count: todayTasks?.length || 0,
          tasks: todayTasks || []
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  static async getPipelineData(userId: string): Promise<PipelineData> {
    try {
      const { data: deals } = await supabase
        .from('deals')
        .select('status, price')
        .eq('assigned_agent_id', userId)

      const pipeline: PipelineData = {
        prospect: { count: 0, value: 0 },
        qualified: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        closed_won: { count: 0, value: 0 },
        closed_lost: { count: 0, value: 0 }
      }

      deals?.forEach(deal => {
        if (pipeline[deal.status as keyof PipelineData]) {
          pipeline[deal.status as keyof PipelineData].count++
          pipeline[deal.status as keyof PipelineData].value += deal.price || 0
        }
      })

      return pipeline
    } catch (error) {
      console.error('Error fetching pipeline data:', error)
      throw error
    }
  }

  static async getRecentActivity(userId: string, limit = 10): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = []

      // Get recent deals
      const { data: recentDeals } = await supabase
        .from('deals')
        .select('id, title, updated_at, contacts(first_name, last_name)')
        .eq('assigned_agent_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5)

      recentDeals?.forEach((deal: any) => {
        activities.push({
          id: deal.id,
          type: 'deal',
          title: `Deal updated: ${deal.title}`,
          description: `Deal "${deal.title}" was updated`,
          timestamp: deal.updated_at,
          relatedEntity: deal.contacts ? {
            id: deal.id,
            name: `${deal.contacts.first_name} ${deal.contacts.last_name}`,
            type: 'contact'
          } : undefined
        })
      })

      // Get recent contacts
      const { data: recentContactsData } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, updated_at')
        .eq('assigned_agent_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5)

      recentContactsData?.forEach(contact => {
        activities.push({
          id: contact.id,
          type: 'contact',
          title: `Contact updated: ${contact.first_name} ${contact.last_name}`,
          description: `Contact "${contact.first_name} ${contact.last_name}" was updated`,
          timestamp: contact.updated_at
        })
      })

      // Get recent tasks
      const { data: recentTasksData } = await supabase
        .from('tasks')
        .select('id, title, updated_at')
        .eq('assigned_agent_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5)

      recentTasksData?.forEach(task => {
        activities.push({
          id: task.id,
          type: 'task',
          title: `Task updated: ${task.title}`,
          description: `Task "${task.title}" was updated`,
          timestamp: task.updated_at
        })
      })

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      throw error
    }
  }

  static async getOverdueTasks(userId: string): Promise<Task[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_agent_id', userId)
        .neq('status', 'completed')
        .not('due_date', 'is', null)
        .lt('due_date', today)
        .order('due_date', { ascending: true })
        .limit(5)

      return overdueTasks || []
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
      throw error
    }
  }

  static async getHotDeals(userId: string): Promise<Deal[]> {
    try {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      const { data: hotDeals } = await supabase
        .from('deals')
        .select(`*, contacts(first_name, last_name, email, phone)`)
        .eq('assigned_agent_id', userId)
        .in('status', ['proposal', 'negotiation'])
        .or(`expected_close_date.lt.${nextWeek.toISOString()},probability.gte.80`)
        .order('expected_close_date', { ascending: true })
        .limit(5)

      return hotDeals || []
    } catch (error) {
      console.error('Error fetching hot deals:', error)
      throw error
    }
  }
}
