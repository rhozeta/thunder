'use client'

import { Deal } from '@/types/deal'
import { formatCurrency } from '@/lib/utils'
import { Calendar, User, Home, DollarSign, MapPin, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface DealMobileCardProps {
  deal: Deal
  onEdit?: (deal: Deal) => void
  onDelete?: (id: string) => void
}

export function DealMobileCard({ deal, onEdit, onDelete }: DealMobileCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      prospect: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getDealTypeColor = (type: string) => {
    const colors = {
      buying: 'text-blue-600',
      selling: 'text-green-600',
      renting: 'text-purple-600',
      investment: 'text-orange-600'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  const getStatusDisplayName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      prospect: 'Prospect',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      closed_won: 'Closed Won',
      closed_lost: 'Closed Lost',
    }
    return statusMap[status] || status
  }

  const getDealTypeDisplayName = (dealType: string) => {
    const typeMap: { [key: string]: string } = {
      buying: 'Buying',
      selling: 'Selling',
      renting: 'Renting',
      investment: 'Investment',
    }
    return typeMap[dealType] || dealType
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link href={`/dashboard/deals/${deal.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {deal.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 capitalize">{deal.deal_type}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deal.status)}`}>
            {getStatusDisplayName(deal.status)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {deal.contacts && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">
              {deal.contacts.first_name} {deal.contacts.last_name}
            </span>
          </div>
        )}
        
        {deal.property_address && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{deal.property_address}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-900">
            {formatCurrency(deal.price || 0)}
          </span>
        </div>
        
        {deal.expected_close_date && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Expected: {new Date(deal.expected_close_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className={`text-xs font-medium ${getDealTypeColor(deal.deal_type)}`}>
          {getDealTypeDisplayName(deal.deal_type).toUpperCase()}
        </span>
        
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(deal)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(deal.id)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
