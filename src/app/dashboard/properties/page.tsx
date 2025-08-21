'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Property, PropertyFilters } from '@/types/property'
import { PropertyService } from '@/services/properties'
import { PropertyTypeService } from '@/services/propertyTypes'
import { ContactService } from '@/services/contacts'
import { DealService } from '@/services/deals'
import { PropertySidebar } from '@/components/properties/PropertySidebar'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertyFiltersPanel } from '@/components/properties/PropertyFiltersPanel'
import { PropertyStats } from '@/components/properties/PropertyStats'
import { ImageDiagnostic } from '@/components/properties/ImageDiagnostic'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MapPin,
  Home,
  Building2,
  Users,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [propertyTypes, setPropertyTypes] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'my_listings' | 'client_interests'>('all')
  
  // Filters
  const [filters, setFilters] = useState<PropertyFilters>({
    listing_type: 'all'
  })

  // Stats visibility
  const [showStats, setShowStats] = useState(true)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [propertiesData, propertyTypesData, contactsData, dealsData] = await Promise.all([
        PropertyService.getProperties(),
        PropertyTypeService.getPropertyTypes(),
        ContactService.getContacts(),
        DealService.getDeals()
      ])
      
      setProperties(propertiesData)
      setPropertyTypes(propertyTypesData)
      setContacts(contactsData)
      setDeals(dealsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  // Filter and search properties
  const applyFilters = useMemo(() => {
    let filtered = [...properties]

    // Apply tab filter
    if (activeTab !== 'all') {
      const listingType = activeTab === 'my_listings' ? 'my_listing' : 'client_interest'
      filtered = filtered.filter(property => property.listing_type === listingType)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query) ||
        property.state.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query) ||
        property.mls_number?.toLowerCase().includes(query)
      )
    }

    // Apply other filters
    if (filters.status) {
      filtered = filtered.filter(property => property.status === filters.status)
    }

    if (filters.property_type) {
      filtered = filtered.filter(property => property.property_type === filters.property_type)
    }

    if (filters.min_price) {
      filtered = filtered.filter(property => 
        property.list_price && property.list_price >= filters.min_price!
      )
    }

    if (filters.max_price) {
      filtered = filtered.filter(property => 
        property.list_price && property.list_price <= filters.max_price!
      )
    }

    if (filters.min_bedrooms) {
      filtered = filtered.filter(property => 
        property.bedrooms && property.bedrooms >= filters.min_bedrooms!
      )
    }

    if (filters.max_bedrooms) {
      filtered = filtered.filter(property => 
        property.bedrooms && property.bedrooms <= filters.max_bedrooms!
      )
    }

    if (filters.city) {
      filtered = filtered.filter(property => 
        property.city.toLowerCase().includes(filters.city!.toLowerCase())
      )
    }

    if (filters.state) {
      filtered = filtered.filter(property => property.state === filters.state)
    }

    if (filters.contact_id) {
      filtered = filtered.filter(property => property.contact_id === filters.contact_id)
    }

    if (filters.deal_id) {
      filtered = filtered.filter(property => property.deal_id === filters.deal_id)
    }

    return filtered
  }, [properties, activeTab, searchQuery, filters])

  useEffect(() => {
    setFilteredProperties(applyFilters)
  }, [applyFilters])

  const handleAddProperty = () => {
    setSelectedProperty(null)
    setSidebarOpen(true)
  }

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property)
    setSidebarOpen(true)
  }

  const handleSaveProperty = async (propertyData: any) => {
    try {
      if (selectedProperty) {
        // Update existing property
        const updatedProperty = await PropertyService.updateProperty(selectedProperty.id, propertyData)
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p))
      } else {
        // Create new property
        const newProperty = await PropertyService.createProperty(propertyData)
        setProperties(prev => [newProperty, ...prev])
      }
      setSidebarOpen(false)
      setSelectedProperty(null)
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await PropertyService.deleteProperty(propertyId)
      setProperties(prev => prev.filter(p => p.id !== propertyId))
      setSidebarOpen(false)
      setSelectedProperty(null)
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'all':
        return properties.length
      case 'my_listings':
        return properties.filter(p => p.listing_type === 'my_listing').length
      case 'client_interests':
        return properties.filter(p => p.listing_type === 'client_interest').length
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Home className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              </div>
              
              {/* Stats Toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showStats ? 'Hide' : 'Show'} Stats</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Add Property Button */}
              <button
                onClick={handleAddProperty}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Property</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-6 mt-4">
            {[
              { key: 'all', label: 'All Properties', icon: Home },
              { key: 'my_listings', label: 'My Listings', icon: Building2 },
              { key: 'client_interests', label: 'Client Interests', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon
              const count = getTabCount(tab.key)
              const isActive = activeTab === tab.key
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Debug Panel - Remove this after fixing images */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4">
          <ImageDiagnostic />
        </div>

        {/* Stats Panel */}
        {showStats && (
          <PropertyStats properties={properties} />
        )}

        {/* Filters Panel */}
        {showFilters && (
          <PropertyFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            propertyTypes={propertyTypes}
            contacts={contacts}
            deals={deals}
          />
        )}

        {/* Properties Grid/List */}
        <div className="flex-1 overflow-auto p-6">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || Object.keys(filters).some(key => filters[key as keyof PropertyFilters])
                  ? 'No properties match your search'
                  : 'No properties yet'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || Object.keys(filters).some(key => filters[key as keyof PropertyFilters])
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by adding your first property'
                }
              </p>
              {!searchQuery && !Object.keys(filters).some(key => filters[key as keyof PropertyFilters]) && (
                <button
                  onClick={handleAddProperty}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Property</span>
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewMode={viewMode}
                  onEdit={handleEditProperty}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Property Sidebar */}
      <PropertySidebar
        isOpen={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false)
          setSelectedProperty(null)
        }}
        property={selectedProperty}
        onSave={handleSaveProperty}
        onDelete={handleDeleteProperty}
        propertyTypes={propertyTypes}
        contacts={contacts}
        deals={deals}
      />
    </div>
  )
}
