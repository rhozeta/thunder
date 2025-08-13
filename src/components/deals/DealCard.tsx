'use client'

import { Deal } from '@/types/deal'
import { formatCurrency } from '@/lib/utils'

interface DealCardProps {
  deal: Deal
  onEdit?: (deal: Deal) => void
  onDelete?: (id: string) => void
}

export function DealCard({ deal, onEdit, onDelete }: DealCardProps) {
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
      buying: 'bg-blue-500',
      selling: 'bg-green-500',
      renting: 'bg-purple-500',
      investment: 'bg-orange-500'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{deal.title}</h3>
          <p className="text-sm text-gray-600">
            {deal.contacts?.first_name} {deal.contacts?.last_name}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
          {deal.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getDealTypeColor(deal.deal_type)}`}>
            {deal.deal_type.toUpperCase()}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {deal.price ? formatCurrency(deal.price) : 'Price TBD'}
          </span>
        </div>

        {deal.contacts && (
          <div className="text-sm text-gray-600">
            <p>{deal.contacts.email}</p>
            <p>{deal.contacts.phone}</p>
          </div>
        )}

        {deal.expected_close_date && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Expected close:</span> {new Date(deal.expected_close_date).toLocaleDateString()}
          </div>
        )}

        {deal.probability && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${deal.probability}%` }}
            ></div>
          </div>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
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
      )}
    </div>
  )
}
