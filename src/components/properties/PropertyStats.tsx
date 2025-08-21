'use client'

import React, { useState, useEffect } from 'react'
import { Property } from '@/types/property'
import { PropertyService } from '@/services/properties'
import { 
  Home, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Calendar,
  Target
} from 'lucide-react'

interface PropertyStatsProps {
  properties: Property[]
}

export function PropertyStats({ properties }: PropertyStatsProps) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    calculateStats()
  }, [properties])

  const calculateStats = async () => {
    try {
      const statsData = await PropertyService.getPropertyStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`
    }
    return `$${price.toLocaleString()}`
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.total_properties,
      icon: Home,
      color: 'blue',
      change: null
    },
    {
      title: 'My Listings',
      value: stats.my_listings,
      icon: Building2,
      color: 'purple',
      change: null
    },
    {
      title: 'Client Interests',
      value: stats.client_interests,
      icon: Users,
      color: 'orange',
      change: null
    },
    {
      title: 'Active Properties',
      value: stats.active_properties,
      icon: Target,
      color: 'green',
      change: null
    },
    {
      title: 'Total Value',
      value: formatPrice(stats.total_value),
      icon: DollarSign,
      color: 'emerald',
      change: null
    },
    {
      title: 'Average Price',
      value: formatPrice(stats.average_price),
      icon: TrendingUp,
      color: 'indigo',
      change: null
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
      green: 'bg-green-50 text-green-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      indigo: 'bg-indigo-50 text-indigo-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Property Distribution */}
      {Object.keys(stats.properties_by_type).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Property Types</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.properties_by_type).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {type}: {count as number}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
