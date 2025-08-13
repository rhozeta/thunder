'use client'

import { useState, useEffect } from 'react'
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { ContactForm } from '@/components/contacts/ContactForm'
import { Modal } from '@/components/ui/Modal'
import { ContactService } from '@/services/contacts'
import { Contact } from '@/types/contact'
import { Plus, Search, Filter, Grid, Table } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user, statusFilter])

  const loadContacts = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      let data
      if (statusFilter === 'all') {
        data = await ContactService.getContacts(user.id)
      } else {
        data = await ContactService.getContactsByStatus(statusFilter, user.id)
      }
      setContacts(data || [])
    } catch (error: any) {
      console.error('Error loading contacts:', error.message || error)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim() || !user) {
      loadContacts()
      return
    }
    
    try {
      setLoading(true)
      const data = await ContactService.searchContacts(query, user.id)
      setContacts(data || [])
    } catch (error: any) {
      console.error('Error searching contacts:', error.message || error)
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

  const handleDelete = async (id: string) => {
    if (!user) return
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await ContactService.deleteContact(id, user.id)
        loadContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' || 
      contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Contacts' }
        ]}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your client contacts and leads
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedContact(null)
            setShowForm(true)
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 px-4 py-3 ${viewMode === 'cards' ? 'bg-gray-100' : ''} transition-colors`}
                  title="Card View"
                >
                  <Grid className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-4 py-3 ${viewMode === 'table' ? 'bg-gray-100' : ''} transition-colors border-l border-gray-300`}
                  title="Table View"
                >
                  <Table className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onClick={() => handleEdit(contact)}
                  />
                ))}
              </div>
            ) : (
              <ContactsTable
                contacts={filteredContacts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No contacts found</p>
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setSelectedContact(null)
          }}
          title={selectedContact ? 'Edit Contact' : 'Add New Contact'}
          size="xl"
        >
          <ContactForm
            contact={selectedContact || undefined}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setSelectedContact(null)
            }}
          />
        </Modal>
    </div>
  )
}
