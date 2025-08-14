'use client'

import { useEffect, useState } from 'react'
import { DashboardService, PipelineData, RecentActivity } from '@/services/dashboard'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, Users, DollarSign, Activity, Eye } from 'lucide-react'
import Link from 'next/link'

export default function PipelineInsights() {
  const { user } = useAuth()
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadPipelineData()
    }
  }, [user?.id])

  const loadPipelineData = async () => {
    try {
      setLoading(true)
      const [pipeline, activity] = await Promise.all([
        DashboardService.getPipelineData(user!.id),
        DashboardService.getRecentActivity(user!.id, 8)
      ])
      setPipelineData(pipeline)
      setRecentActivity(activity)
    } catch (error) {
      console.error('Error loading pipeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <DollarSign className="w-4 h-4 text-green-600" />
      case 'contact':
        return <Users className="w-4 h-4 text-blue-600" />
      case 'task':
        return <Activity className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityLink = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'deal':
        return `/dashboard/deals/${activity.id}`
      case 'contact':
        return `/dashboard/contacts/${activity.id}`
      case 'task':
        return `/dashboard/tasks?task=${activity.id}`
      default:
        return '#'
    }
  }

  const pipelineStages = [
    { key: 'prospect', label: 'Prospect', color: 'bg-gray-500' },
    { key: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
    { key: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
    { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
    { key: 'closed_won', label: 'Closed Won', color: 'bg-green-500' },
    { key: 'closed_lost', label: 'Closed Lost', color: 'bg-red-500' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalDeals = pipelineData ? Object.values(pipelineData).reduce((sum, stage) => sum + stage.count, 0) : 0
  const totalValue = pipelineData ? Object.values(pipelineData).reduce((sum, stage) => sum + stage.value, 0) : 0
  const activeValue = pipelineData ? 
    (pipelineData.prospect.value + pipelineData.qualified.value + pipelineData.proposal.value + pipelineData.negotiation.value) : 0

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Deal Pipeline</h3>
          <Link 
            href="/dashboard/deals"
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="w-4 h-4 mr-1" />
            View All
          </Link>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalDeals}</p>
            <p className="text-sm text-gray-600">Total Deals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(activeValue)}</p>
            <p className="text-sm text-gray-600">Active Pipeline</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
        </div>

        {/* Pipeline Visualization */}
        <div className="space-y-3">
          {pipelineStages.map((stage) => {
            const stageData = pipelineData?.[stage.key as keyof PipelineData]
            const percentage = totalDeals > 0 ? (stageData?.count || 0) / totalDeals * 100 : 0
            
            return (
              <div key={stage.key} className="flex items-center">
                <div className="w-20 text-sm text-gray-600 text-right mr-3">
                  {stage.label}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className={`${stage.color} h-6 rounded-full transition-all duration-300 flex items-center justify-between px-3`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {stageData?.count || 0}
                    </span>
                    {(stageData?.value || 0) > 0 && (
                      <span className="text-white text-xs">
                        {formatCurrency(stageData?.value || 0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-600 text-right ml-3">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">Potential Revenue</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(activeValue)}
            </p>
            <p className="text-sm text-gray-600">From active deals</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Closed Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(pipelineData?.closed_won.value || 0)}
            </p>
            <p className="text-sm text-gray-600">This period</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <span className="text-sm text-gray-500">Last 24 hours</span>
        </div>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 6).map((activity) => (
              <Link
                key={activity.id}
                href={getActivityLink(activity)}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.description}
                  </p>
                  {activity.relatedEntity && (
                    <p className="text-xs text-gray-500">
                      Related to: {activity.relatedEntity.name}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
