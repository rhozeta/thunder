'use client'

import { ContactWithDetails } from '@/types/contact'
import { format } from 'date-fns'
import { Phone, Mail, MapPin, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ContactCardProps {
  contact: ContactWithDetails
  onClick?: () => void
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      nurturing: 'bg-yellow-100 text-yellow-800',
      lost: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      buyer: 'bg-blue-50 text-blue-700',
      seller: 'bg-green-50 text-green-700',
      investor: 'bg-purple-50 text-purple-700',
      'past_client': 'bg-gray-50 text-gray-700',
      lead: 'bg-orange-50 text-orange-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700'
  }

  return (
    <Link href={`/dashboard/contacts/${contact.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer touch-manipulation">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h3>
            <p className="text-sm text-gray-500">{contact.contact_type}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
              {contact.status}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(contact.contact_type)}`}>
              {contact.contact_type}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {contact.email}
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {contact.phone}
            </div>
          )}

          {contact.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {contact.address}
              {contact.city && `, ${contact.city}`}
            </div>
          )}

          {(contact.budget_min || contact.budget_max) && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              ${contact.budget_min?.toLocaleString()} - ${contact.budget_max?.toLocaleString()}
            </div>
          )}

          {contact.timeline && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline: {contact.timeline}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Score: {contact.lead_score || 0}</span>
            <span>Updated: {format(new Date(contact.updated_at), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>{(contact as any).communications?.[0]?.count || 0} messages</span>
            <span>{(contact as any).deals?.[0]?.count || 0} deals</span>
            <span>{(contact as any).tasks?.[0]?.count || 0} tasks</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
