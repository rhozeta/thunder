'use client'

import { Contact } from '@/types/contact'
import { formatPhoneNumber } from '@/lib/utils'
import { Phone, Mail, MapPin, User, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ContactMobileCardProps {
  contact: Contact
  onEdit?: (contact: Contact) => void
  onDelete?: (id: string) => void
}

export function ContactMobileCard({ contact, onEdit, onDelete }: ContactMobileCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      nurturing: 'bg-yellow-100 text-yellow-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getContactTypeColor = (type: string) => {
    const colors = {
      buyer: 'text-blue-600',
      seller: 'text-green-600',
      investor: 'text-orange-600',
      renter: 'text-purple-600',
      referral: 'text-gray-600'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link href={`/dashboard/contacts/${contact.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {contact.first_name} {contact.last_name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 capitalize">{contact.contact_type}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
            {contact.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {contact.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatPhoneNumber(contact.phone)}</span>
          </div>
        )}
        
        {contact.address && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{contact.address}</span>
          </div>
        )}
        
        {contact.created_at && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Added {new Date(contact.created_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className={`text-xs font-medium ${getContactTypeColor(contact.contact_type)}`}>
          {contact.contact_type.toUpperCase()}
        </span>
        
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(contact)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(contact.id)}
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
