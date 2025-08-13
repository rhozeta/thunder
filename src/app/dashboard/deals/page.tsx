'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Grid, Table, Edit, Trash2, Users, DollarSign, Calendar, Briefcase, SortAsc, SortDesc } from 'lucide-react'
import { format } from 'date-fns'
import { Deal } from '@/types/deal'
import { DealService } from '@/services/deals'
import { useAuth } from '@/contexts/AuthContext'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { StatusChip } from '@/components/ui/StatusChip'
import { DealSidebar } from '@/components/deals/DealSidebar'

// Deal status colors
const DEAL_STATUS_COLORS = {
  prospect: { color: '#6B7280', bgColor: '#F3F4F6', textColor: '#374151' },
  qualified: { color: '#3B82F6', bgColor: '#DBEAFE', textColor: '#1E40AF' },
  proposal: { color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
  negotiation: { color: '#F97316', bgColor: '#FED7AA', textColor: '#C2410C' },
  closed_won: { color: '#10B981', bgColor: '#D1FAE5', textColor: '#047857' },
  closed_lost: { color: '#EF4444', bgColor: '#FEE2E2', textColor: '#DC2626' },
}

// Deal type colors
const DEAL_TYPE_COLORS = {
  buying: { color: '#3B82F6', bgColor: '#DBEAFE', textColor: '#1E40AF' },
  selling: { color: '#10B981', bgColor: '#D1FAE5', textColor: '#047857' },
  renting: { color: '#8B5CF6', bgColor: '#EDE9FE', textColor: '#5B21B6' },
  investment: { color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
}

// Helper functions
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

type SortField = 'title' | 'status' | 'deal_type' | 'price' | 'expected_close_date' | 'created_at'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'table' | 'kanban'

export default function DealsPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dealTypeFilter, setDealTypeFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showDealSidebar, setShowDealSidebar] = useState(false)

  useEffect(() => {
    if (user) {
      loadDeals()
    }
  }, [user])

  const loadDeals = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log('Loading deals for user:', user.id)
      const data = await DealService.getDeals(user.id)
      console.log('Loaded deals:', data)
      setDeals(data)
    } catch (error: any) {
      console.error('Error loading deals:', error.message || error)
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDealStatusChange = async (dealId: string, newStatus: string) => {
    try {
      await DealService.updateDeal(dealId, { status: newStatus as any })
      setDeals(deals.map(deal => 
        deal.id === dealId ? { ...deal, status: newStatus as any } : deal
      ))
    } catch (error) {
      console.error('Error updating deal status:', error)
    }
  }

  const handleDealDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return
    
    try {
      await DealService.deleteDeal(dealId)
      setDeals(deals.filter(deal => deal.id !== dealId))
    } catch (error) {
      console.error('Error deleting deal:', error)
    }
  }

  const handleDealEdit = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowDealSidebar(true)
  }

  const handleNewDeal = () => {
    setSelectedDeal(null)
    setShowDealSidebar(true)
  }

  const handleSidebarClose = () => {
    setShowDealSidebar(false)
    setSelectedDeal(null)
  }

  const handleSidebarSave = (updatedDeal?: Deal) => {
    if (updatedDeal) {
      setDeals(prevDeals => {
        const existingIndex = prevDeals.findIndex(d => d.id === updatedDeal.id)
        if (existingIndex >= 0) {
          // Update existing deal
          const newDeals = [...prevDeals]
          newDeals[existingIndex] = updatedDeal
          return newDeals
        } else {
          // Add new deal
          return [updatedDeal, ...prevDeals]
        }
      })
      
      // Update the selected deal to the saved deal so subsequent auto-saves update instead of create
      setSelectedDeal(updatedDeal)
    }
  }

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.contacts?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.contacts?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter
      const matchesDealType = dealTypeFilter === 'all' || deal.deal_type === dealTypeFilter
      
      return matchesSearch && matchesStatus && matchesDealType
    })

    // Sort deals
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'price') {
        aValue = a.price || 0
        bValue = b.price || 0
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ''
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [deals, searchQuery, statusFilter, dealTypeFilter, sortField, sortDirection])

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      prospect: 'Prospect',
      qualified: 'Qualified', 
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      closed_won: 'Closed Won',
      closed_lost: 'Closed Lost'
    }
    return statusMap[status] || status
  }

  const getDealTypeDisplayName = (dealType: string) => {
    const typeMap: Record<string, string> = {
      buying: 'Buying',
      selling: 'Selling',
      renting: 'Renting',
      investment: 'Investment'
    }
    return typeMap[dealType] || dealType
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Deals' }
        ]}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Deals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your real estate deals and opportunities
          </p>
        </div>
        <button
          onClick={handleNewDeal}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
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
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="all">All Statuses</option>
              <option value="prospect">Prospect</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
            
            <select
              value={dealTypeFilter}
              onChange={(e) => setDealTypeFilter(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="all">All Types</option>
              <option value="buying">Buying</option>
              <option value="selling">Selling</option>
              <option value="renting">Renting</option>
              <option value="investment">Investment</option>
            </select>
            
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-4 py-3 ${viewMode === 'table' ? 'bg-gray-100' : ''} transition-colors`}
                title="Table View"
              >
                <Table className="h-4 w-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex-1 px-4 py-3 ${viewMode === 'kanban' ? 'bg-gray-100' : ''} transition-colors border-l border-gray-300`}
                title="Kanban View"
              >
                <Grid className="h-4 w-4 mx-auto" />
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
          {viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Deal</span>
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('deal_type')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortField === 'deal_type' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        {sortField === 'price' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('expected_close_date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Expected Close</span>
                        {sortField === 'expected_close_date' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip
                          value={getDealTypeDisplayName(deal.deal_type)}
                          {...DEAL_TYPE_COLORS[deal.deal_type as keyof typeof DEAL_TYPE_COLORS]}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip
                          value={getStatusDisplayName(deal.status)}
                          {...DEAL_STATUS_COLORS[deal.status as keyof typeof DEAL_STATUS_COLORS]}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.price ? `$${deal.price.toLocaleString()}` : 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.contacts ? (
                          <Link 
                            href={`/dashboard/contacts/${deal.contact_id}`}
                            className="flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            {deal.contacts.first_name} {deal.contacts.last_name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">No contact</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.expected_close_date ? format(new Date(deal.expected_close_date + 'T00:00:00'), 'MMM dd, yyyy') : 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDealEdit(deal)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDealDelete(deal.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Kanban View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map((status) => (
                <div key={status} className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <StatusChip
                      value={getStatusDisplayName(status)}
                      {...DEAL_STATUS_COLORS[status as keyof typeof DEAL_STATUS_COLORS]}
                      size="sm"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      ({filteredAndSortedDeals.filter(deal => deal.status === status).length})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {filteredAndSortedDeals
                      .filter(deal => deal.status === status)
                      .map((deal) => (
                        <div key={deal.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{deal.title}</h4>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDealEdit(deal)}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDealDelete(deal.id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <StatusChip
                              value={getDealTypeDisplayName(deal.deal_type)}
                              {...DEAL_TYPE_COLORS[deal.deal_type as keyof typeof DEAL_TYPE_COLORS]}
                              size="sm"
                            />
                            
                            {deal.price && (
                              <div className="flex items-center text-sm text-gray-600">
                                <DollarSign className="w-3 h-3 mr-1" />
                                ${deal.price.toLocaleString()}
                              </div>
                            )}
                            
                            {deal.contacts && (
                              <Link 
                                href={`/dashboard/contacts/${deal.contact_id}`}
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                <Users className="w-3 h-3 mr-1" />
                                {deal.contacts.first_name} {deal.contacts.last_name}
                              </Link>
                            )}
                            
                            {deal.expected_close_date && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(deal.expected_close_date + 'T00:00:00'), 'MMM dd')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredAndSortedDeals.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all' || dealTypeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new deal'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Deal Sidebar */}
      <DealSidebar
        deal={selectedDeal}
        isOpen={showDealSidebar}
        onClose={handleSidebarClose}
        onSave={handleSidebarSave}
      />
    </div>
  )
}
