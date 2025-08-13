'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ContactService } from '@/services/contacts'
import { TaskService } from '@/services/tasks'
import { DealService } from '@/services/deals'
import { CommunicationService } from '@/services/communications'
import { Task } from '@/types/task'
import { Deal } from '@/types/deal'
import { Communication } from '@/types/communication'
import { Contact } from '@/types/contact'
import { useAuth } from '@/contexts/AuthContext'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { StatusChip } from '@/components/ui/StatusChip'
import { format } from 'date-fns'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star,
  Edit,
  Plus,
  Clock,
  MessageSquare,
  CheckSquare,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Modal } from '@/components/ui/Modal'
import { ContactForm } from '@/components/contacts/ContactForm'
import { TaskForm } from '@/components/tasks/TaskForm'
import { ActivityForm } from '@/components/activities/ActivityForm'

// Status colors matching the main deals and tasks pages
const DEAL_STATUS_COLORS = {
  prospect: { color: '#6B7280', bgColor: '#F3F4F6', textColor: '#374151' },
  qualified: { color: '#3B82F6', bgColor: '#DBEAFE', textColor: '#1E40AF' },
  proposal: { color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
  negotiation: { color: '#F97316', bgColor: '#FED7AA', textColor: '#C2410C' },
  closed_won: { color: '#10B981', bgColor: '#D1FAE5', textColor: '#047857' },
  closed_lost: { color: '#EF4444', bgColor: '#FEE2E2', textColor: '#DC2626' },
}

const TASK_STATUS_COLORS = {
  pending: { color: '#6B7280', bgColor: '#F3F4F6', textColor: '#374151' },
  in_progress: { color: '#3B82F6', bgColor: '#DBEAFE', textColor: '#1E40AF' },
  completed: { color: '#10B981', bgColor: '#D1FAE5', textColor: '#047857' },
  cancelled: { color: '#EF4444', bgColor: '#FEE2E2', textColor: '#DC2626' },
}

const TASK_PRIORITY_COLORS = {
  low: { color: '#6B7280', bgColor: '#F3F4F6', textColor: '#374151' },
  medium: { color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
  high: { color: '#F97316', bgColor: '#FED7AA', textColor: '#C2410C' },
  urgent: { color: '#EF4444', bgColor: '#FEE2E2', textColor: '#DC2626' },
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const contactId = params.id as string

  const [contact, setContact] = useState<Contact | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)

  useEffect(() => {
    if (contactId) {
      loadContact()
      loadTasks()
      loadDeals()
      loadActivities()
    }
  }, [contactId])

  const loadContact = async () => {
    if (!user) return
    try {
      const data = await ContactService.getContactById(contactId, user.id)
      setContact(data)
    } catch (error) {
      console.error('Error loading contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const data = await TaskService.getTasksByContact(contactId)
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const loadDeals = async () => {
    try {
      if (!user) return
      // Get all deals for the user and filter by contact_id
      const allDeals = await DealService.getDeals(user.id)
      const contactDeals = allDeals.filter(deal => deal.contact_id === contactId)
      setDeals(contactDeals || [])
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }

  const loadActivities = async () => {
    try {
      const data = await CommunicationService.getCommunicationsByContact(contactId)
      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const handleContactUpdate = async () => {
    await loadContact()
    setShowEditModal(false)
  }

  const handleTaskCreate = async () => {
    await loadTasks()
    setShowTaskModal(false)
  }

  const handleActivityCreate = async () => {
    await loadActivities()
    setShowActivityModal(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Contacts', href: '/dashboard/contacts' },
            { label: `${contact?.first_name} ${contact?.last_name}` }
          ]}
        />
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {contact?.first_name} {contact?.last_name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{contact?.email}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/contacts')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      nurturing: 'bg-yellow-100 text-yellow-800',
      lost: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getContactTypeColor = (type: string) => {
    const colors = {
      buyer: 'bg-blue-100 text-blue-800',
      seller: 'bg-green-100 text-green-800',
      investor: 'bg-purple-100 text-purple-800',
      past_client: 'bg-gray-100 text-gray-800',
      lead: 'bg-yellow-100 text-yellow-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/contacts')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Contacts
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                {contact.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContactTypeColor(contact.contact_type)}`}>
                {contact.contact_type}
              </span>
              {contact.lead_score > 0 && (
                <span className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {contact.lead_score}/100
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Contact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`tel:${contact.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                <div className="space-y-1">
                  {contact.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div className="text-sm text-gray-900">
                        <div>{contact.address}</div>
                        {contact.city && contact.state && (
                          <div>{contact.city}, {contact.state} {contact.zip_code}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lead Details</h3>
                <div className="space-y-2 text-sm">
                  {contact.lead_source && (
                    <div>
                      <span className="text-gray-500">Source:</span>
                      <span className="ml-2 text-gray-900">{contact.lead_source}</span>
                    </div>
                  )}
                  {contact.timeline && (
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <span className="ml-2 text-gray-900">{contact.timeline}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Budget</h3>
                <div className="space-y-2 text-sm">
                  {contact.budget_min && (
                    <div>
                      <span className="text-gray-500">Min:</span>
                      <span className="ml-2 text-gray-900">{formatCurrency(contact.budget_min)}</span>
                    </div>
                  )}
                  {contact.budget_max && (
                    <div>
                      <span className="text-gray-500">Max:</span>
                      <span className="ml-2 text-gray-900">{formatCurrency(contact.budget_max)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {contact.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </div>

          {/* Activities Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Activities</h2>
              <button
                onClick={() => setShowActivityModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Activity
              </button>
            </div>

            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No activities yet</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{activity.type} • {activity.direction}</h4>
                        {activity.subject && <p className="text-sm font-medium text-gray-700">{activity.subject}</p>}
                        <p className="text-sm text-gray-600 mt-1">{activity.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                          {activity.user && ` • ${activity.user.full_name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{deals.length}</div>
                <div className="text-sm text-gray-500">Active Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
                <div className="text-sm text-gray-500">Open Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals and Tasks Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Deals</h2>
              <Link
                href="/dashboard/deals"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {deals.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No deals assigned to this contact</p>
            ) : (
              <div className="space-y-4">
                {deals.slice(0, 5).map((deal) => (
                  <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link 
                          href={`/dashboard/deals`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {deal.title}
                        </Link>
                        {deal.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {deal.description.length > 60 ? `${deal.description.substring(0, 60)}...` : deal.description}
                          </p>
                        )}
                        <div className="flex items-center mt-2 space-x-4">
                          <StatusChip
                            value={deal.status.charAt(0).toUpperCase() + deal.status.slice(1).replace('_', ' ')}
                            {...DEAL_STATUS_COLORS[deal.status as keyof typeof DEAL_STATUS_COLORS]}
                          />
                          {deal.price && (
                            <div className="flex items-center text-xs text-gray-500">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${deal.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {deals.length > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      href="/dashboard/deals"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View {deals.length - 5} more deals
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </button>
                <Link
                  href="/dashboard/tasks"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6">
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No tasks assigned to this contact</p>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link 
                          href={`/dashboard/tasks`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {task.title}
                        </Link>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {task.description.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
                          </p>
                        )}
                        <div className="flex items-center mt-2 space-x-4">
                          <StatusChip
                            value={task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                            {...TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS]}
                          />
                          <StatusChip
                            value={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            {...TASK_PRIORITY_COLORS[task.priority as keyof typeof TASK_PRIORITY_COLORS]}
                          />
                          {task.due_date && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(task.due_date), 'MMM d')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      href="/dashboard/tasks"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View {tasks.length - 5} more tasks
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
        size="xl"
      >
        <ContactForm
          contact={contact}
          onSave={handleContactUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add New Task"
        size="md"
      >
        <TaskForm
          contactId={contactId}
          onSave={handleTaskCreate}
          onCancel={() => setShowTaskModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Add New Activity"
        size="md"
      >
        <ActivityForm
          contactId={contactId}
          onSuccess={handleActivityCreate}
          onCancel={() => setShowActivityModal(false)}
        />
      </Modal>
    </div>
  )
}
