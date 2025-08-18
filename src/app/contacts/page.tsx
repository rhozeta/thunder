'use client'

import { useState, useEffect } from 'react'
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { ContactForm } from '@/components/contacts/ContactForm'
import { ContactService } from '@/services/contacts'
import { Contact } from '@/types/contact'
import { Plus, Search, Filter, Grid, Table } from 'lucide-react'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock user ID - replace with actual auth
  useEffect(() => {
    loadContacts()
  }, [statusFilter])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const userId = '00000000-0000-0000-0000-000000000000' // Mock user ID for demo
      let data
      if (statusFilter === 'all') {
        data = await ContactService.getContacts(userId)
      } else {
        data = await ContactService.getContactsByStatus(statusFilter, userId)
      }
      setContacts(data)
    } catch (error: any) {
      console.error('Error loading contacts:', error.message || error)
      // For demo purposes, show empty array if no contacts or policies not set
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadContacts()
      return
    }

    try {
      setLoading(true)
      const userId = '00000000-0000-0000-0000-000000000000' // Mock user ID for demo
      const data = await ContactService.searchContacts(query, userId)
      setContacts(data)
    } catch (error: any) {
      console.error('Error searching contacts:', error.message || error)
      // For demo purposes, show empty array if no contacts or policies not set
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    setShowForm(false)
    setSelectedContact(null)
    loadContacts()
  }

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setSelectedContact(null)
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedContact ? 'Edit Contact' : 'Create New Contact'}
          </h1>
          <ContactForm
            contact={selectedContact || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="nurturing">Nurturing</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : ''
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : ''
              }`}
            >
              <Table className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'No contacts match your search.' : 'Get started by adding your first contact.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      ) : (
        <div>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} onClick={() => handleEdit(contact)} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ContactsTable contacts={contacts} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
