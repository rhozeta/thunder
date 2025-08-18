'use client'

import { useEffect, useState } from 'react'
import { DashboardStats, DashboardService } from '@/services/dashboard'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, TrendingDown, Users, CheckSquare, Calendar, DollarSign } from 'lucide-react'

interface StatsOverviewProps {
  size?: 'small' | 'medium' | 'large'
}

export default function StatsOverview({ size = 'medium' }: StatsOverviewProps) {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user?.id])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await DashboardService.getDashboardStats(user!.id)
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
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

  const formatTrend = (trend: number) => {
    const isPositive = trend >= 0
    return {
      value: Math.abs(trend).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const trendData = formatTrend(stats.activeDeals.trend)
  const TrendIcon = trendData.icon

  return (
    <div className={`grid gap-4 ${
      size === 'small' ? 'grid-cols-2' : 
      size === 'medium' ? 'grid-cols-2 lg:grid-cols-4' : 
      'grid-cols-2 md:grid-cols-4'
    } sm:gap-6`}>
      {/* Active Deals */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Deals</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeDeals.count}</p>
            <p className="text-sm text-gray-500">{formatCurrency(stats.activeDeals.totalValue)} total</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className={`flex items-center mt-2 ${trendData.color}`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">{trendData.value}%</span>
          <span className="text-sm text-gray-500 ml-1">vs last week</span>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks.count}</p>
            {stats.pendingTasks.overdueCount > 0 && (
              <p className="text-sm text-red-600 font-medium">
                {stats.pendingTasks.overdueCount} overdue
              </p>
            )}
          </div>
          <div className="p-3 bg-orange-50 rounded-full">
            <CheckSquare className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        {stats.pendingTasks.overdueCount === 0 && (
          <div className="flex items-center mt-2 text-green-600">
            <CheckSquare className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">All up to date</span>
          </div>
        )}
      </div>

      {/* New Contacts */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Contacts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.newContacts.count}</p>
            <p className="text-sm text-gray-500">+{stats.newContacts.thisWeek} this week</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="flex items-center mt-2 text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Growing</span>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{stats.todayEvents.count}</p>
            <p className="text-sm text-gray-500">scheduled for today</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="flex items-center mt-2 text-purple-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">View Calendar</span>
        </div>
      </div>
    </div>
  )
}
