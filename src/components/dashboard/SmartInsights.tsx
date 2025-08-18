'use client'

import { useEffect, useState } from 'react'
import { DashboardService } from '@/services/dashboard'
import { ContactService } from '@/services/contacts'
import { useAuth } from '@/contexts/AuthContext'
import { Brain, TrendingUp, Calendar, Target, AlertCircle, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface Insight {
  id: string
  type: 'suggestion' | 'warning' | 'opportunity' | 'trend'
  title: string
  description: string
  action?: string
  actionLink?: string
  priority: 'high' | 'medium' | 'low'
}

interface SmartInsightsProps {
  size?: 'small' | 'medium' | 'large'
}

export default function SmartInsights({ size = 'medium' }: SmartInsightsProps) {
  const { user } = useAuth()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      generateInsights()
    }
  }, [user?.id])

  const generateInsights = async () => {
    try {
      setLoading(true)
      const [stats, pipelineData, overdueTasks, contacts] = await Promise.all([
        DashboardService.getDashboardStats(user!.id),
        DashboardService.getPipelineData(user!.id),
        DashboardService.getOverdueTasks(user!.id),
        ContactService.getContacts(user!.id, 100)
      ])

      const generatedInsights: Insight[] = []

      // Overdue tasks insight
      if (stats.pendingTasks.overdueCount > 0) {
        generatedInsights.push({
          id: 'overdue-tasks',
          type: 'warning',
          title: 'Overdue Tasks Need Attention',
          description: `You have ${stats.pendingTasks.overdueCount} overdue tasks that need immediate attention.`,
          action: 'Review overdue tasks',
          actionLink: '/dashboard/tasks?filter=overdue',
          priority: 'high'
        })
      }

      // Pipeline stagnation insight
      const totalActiveDeals = pipelineData.prospect.count + pipelineData.qualified.count + 
                              pipelineData.proposal.count + pipelineData.negotiation.count
      if (totalActiveDeals > 0) {
        const proposalRatio = pipelineData.proposal.count / totalActiveDeals
        if (proposalRatio > 0.4) {
          generatedInsights.push({
            id: 'pipeline-stagnation',
            type: 'warning',
            title: 'Pipeline May Be Stagnating',
            description: `${Math.round(proposalRatio * 100)}% of your deals are in proposal stage. Consider following up to move them forward.`,
            action: 'Review proposal stage deals',
            actionLink: '/dashboard/deals?status=proposal',
            priority: 'medium'
          })
        }
      }

      // New contact opportunity
      if (stats.newContacts.thisWeek > 0) {
        generatedInsights.push({
          id: 'new-contacts',
          type: 'opportunity',
          title: 'New Contacts This Week',
          description: `You've added ${stats.newContacts.thisWeek} new contacts this week. Consider scheduling follow-up calls.`,
          action: 'Schedule follow-ups',
          actionLink: '/dashboard/contacts?filter=recent',
          priority: 'medium'
        })
      }

      // Revenue trend insight
      if (stats.activeDeals.trend > 10) {
        generatedInsights.push({
          id: 'positive-trend',
          type: 'trend',
          title: 'Strong Pipeline Growth',
          description: `Your active deal value has increased by ${stats.activeDeals.trend.toFixed(1)}% compared to last week.`,
          action: 'View pipeline details',
          actionLink: '/dashboard/deals',
          priority: 'low'
        })
      } else if (stats.activeDeals.trend < -10) {
        generatedInsights.push({
          id: 'negative-trend',
          type: 'warning',
          title: 'Pipeline Value Declining',
          description: `Your active deal value has decreased by ${Math.abs(stats.activeDeals.trend).toFixed(1)}% compared to last week.`,
          action: 'Focus on lead generation',
          actionLink: '/dashboard/contacts',
          priority: 'high'
        })
      }

      // Task completion insight
      if (stats.pendingTasks.count > 20) {
        generatedInsights.push({
          id: 'task-overload',
          type: 'suggestion',
          title: 'High Task Volume',
          description: `You have ${stats.pendingTasks.count} pending tasks. Consider prioritizing or delegating some tasks.`,
          action: 'Organize tasks',
          actionLink: '/dashboard/tasks',
          priority: 'medium'
        })
      }

      // Contact engagement insight
      const recentContacts = contacts.filter(contact => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(contact.updated_at) > weekAgo
      })

      if (contacts.length > 0 && recentContacts.length / contacts.length < 0.1) {
        generatedInsights.push({
          id: 'low-engagement',
          type: 'suggestion',
          title: 'Low Contact Engagement',
          description: `Only ${Math.round((recentContacts.length / contacts.length) * 100)}% of your contacts have been updated recently. Consider reaching out to dormant contacts.`,
          action: 'Review contact activity',
          actionLink: '/dashboard/contacts',
          priority: 'medium'
        })
      }

      // Success insight
      if (pipelineData.closed_won.count > 0) {
        generatedInsights.push({
          id: 'recent-wins',
          type: 'opportunity',
          title: 'Recent Deal Closures',
          description: `You've closed ${pipelineData.closed_won.count} deals worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(pipelineData.closed_won.value)}. Great work!`,
          action: 'View closed deals',
          actionLink: '/dashboard/deals?status=closed_won',
          priority: 'low'
        })
      }

      // Sort by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      generatedInsights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

      setInsights(generatedInsights.slice(0, 6)) // Limit to 6 insights
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-blue-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'opportunity':
        return <Target className="w-5 h-5 text-green-600" />
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-purple-600" />
      default:
        return <Brain className="w-5 h-5 text-gray-600" />
    }
  }

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'border-red-200 bg-red-50'
    }
    switch (type) {
      case 'suggestion':
        return 'border-blue-200 bg-blue-50'
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'opportunity':
        return 'border-green-200 bg-green-50'
      case 'trend':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse mr-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-6">
        <Brain className="w-6 h-6 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Insights & Recommendations</h3>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 border rounded-lg ${getInsightColor(insight.type, insight.priority)} transition-colors hover:shadow-sm`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    {insight.priority === 'high' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  {insight.action && insight.actionLink && (
                    <Link
                      href={insight.actionLink}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {insight.action} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 mb-2">No insights available yet</p>
          <p className="text-sm text-gray-400">
            Insights will appear as you use the CRM and build your pipeline
          </p>
        </div>
      )}

      {/* Performance Analytics Teaser */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Performance Analytics</h4>
            <p className="text-sm text-gray-600">Track your KPIs and goal progress</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.type === 'opportunity').length}
            </p>
            <p className="text-sm text-gray-600">Opportunities</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">This Week</p>
            <p className="text-xs text-gray-600">Activity Summary</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">Goals</p>
            <p className="text-xs text-gray-600">Track Progress</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">Trends</p>
            <p className="text-xs text-gray-600">Performance</p>
          </div>
        </div>
      </div>
    </div>
  )
}
