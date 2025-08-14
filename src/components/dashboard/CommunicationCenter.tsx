'use client'

import { useEffect, useState } from 'react'
import { CommunicationService } from '@/services/communications'
import { useAuth } from '@/contexts/AuthContext'
import { Communication } from '@/types/communication'
import { Mail, Phone, MessageSquare, Clock, User, Plus } from 'lucide-react'
import Link from 'next/link'

interface CommunicationStats {
  totalCommunications: number
  emailCount: number
  callCount: number
  noteCount: number
  todayCount: number
}

interface CommunicationCenterProps {
  onAddCommunication?: () => void
}

export default function CommunicationCenter({ onAddCommunication }: CommunicationCenterProps) {
  const { user } = useAuth()
  const [recentCommunications, setRecentCommunications] = useState<Communication[]>([])
  const [stats, setStats] = useState<CommunicationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadCommunicationData()
    }
  }, [user?.id])

  const loadCommunicationData = async () => {
    try {
      setLoading(true)
      const communications = await CommunicationService.getCommunicationsByUser(user!.id)
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const communicationStats: CommunicationStats = {
        totalCommunications: communications.length,
        emailCount: communications.filter((c: any) => c.type === 'email').length,
        callCount: communications.filter((c: any) => c.type === 'call').length,
        noteCount: communications.filter((c: any) => c.type === 'note').length,
        todayCount: communications.filter((c: any) => c.created_at?.startsWith(today)).length
      }

      setStats(communicationStats)
      setRecentCommunications(communications.slice(0, 6))
    } catch (error) {
      console.error('Error loading communication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-600" />
      case 'call':
        return <Phone className="w-4 h-4 text-green-600" />
      case 'note':
        return <MessageSquare className="w-4 h-4 text-purple-600" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getFollowUpSuggestions = () => {
    // Simple logic for follow-up suggestions based on recent communications
    const suggestions = []
    
    if (recentCommunications.length > 0) {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      
      const oldCommunications = recentCommunications.filter(comm => 
        new Date(comm.created_at || '') < lastWeek
      )
      
      if (oldCommunications.length > 0) {
        suggestions.push({
          type: 'follow-up',
          message: `${oldCommunications.length} contacts haven't been contacted in over a week`,
          action: 'Review and follow up'
        })
      }
    }
    
    return suggestions
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const followUpSuggestions = getFollowUpSuggestions()

  return (
    <div className="space-y-6">
      {/* Communication Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Communication Overview</h3>
          <button
            onClick={onAddCommunication}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Log Communication
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Mail className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-600">{stats?.emailCount || 0}</p>
            <p className="text-sm text-gray-600">Emails</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Phone className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-600">{stats?.callCount || 0}</p>
            <p className="text-sm text-gray-600">Calls</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-purple-600">{stats?.noteCount || 0}</p>
            <p className="text-sm text-gray-600">Notes</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-orange-600">{stats?.todayCount || 0}</p>
            <p className="text-sm text-gray-600">Today</p>
          </div>
        </div>
      </div>

      {/* Follow-up Reminders */}
      {followUpSuggestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Follow-up Reminders</h3>
          </div>
          <div className="space-y-3">
            {followUpSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{suggestion.message}</p>
                  <p className="text-sm text-gray-600">{suggestion.action}</p>
                </div>
                <Link
                  href="/dashboard/contacts"
                  className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                >
                  Review →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Communications */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Communications</h3>
          <Link
            href="/dashboard/contacts"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        {recentCommunications.length > 0 ? (
          <div className="space-y-3">
            {recentCommunications.map((communication) => (
              <div key={communication.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getCommunicationIcon(communication.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">
                      {communication.subject || `${communication.type} communication`}
                    </p>
                    <span className="text-xs text-gray-500 capitalize">
                      {communication.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {communication.content || 'No content'}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <User className="w-3 h-3" />
                    <span>Contact communication</span>
                    {communication.created_at && (
                      <>
                        <span>•</span>
                        <span>{formatTimeAgo(communication.created_at)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">No communications logged yet</p>
            <button
              onClick={onAddCommunication}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Log your first communication →
            </button>
          </div>
        )}
      </div>

      {/* Communication Templates */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Follow-up Email</p>
            <p className="text-sm text-gray-600">Standard follow-up template</p>
          </button>
          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Property Inquiry</p>
            <p className="text-sm text-gray-600">Response to property questions</p>
          </button>
          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Market Update</p>
            <p className="text-sm text-gray-600">Monthly market report</p>
          </button>
          <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Thank You Note</p>
            <p className="text-sm text-gray-600">Post-closing appreciation</p>
          </button>
        </div>
      </div>
    </div>
  )
}
