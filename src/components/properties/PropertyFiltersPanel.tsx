'use client'

import React from 'react'
import { PropertyFilters, US_STATES } from '@/types/property'
import { X } from 'lucide-react'

interface PropertyFiltersPanelProps {
  filters: PropertyFilters
  onFiltersChange: (filters: PropertyFilters) => void
  propertyTypes: any[]
  contacts: any[]
  deals: any[]
}

export function PropertyFiltersPanel({
  filters,
  onFiltersChange,
  propertyTypes,
  contacts,
  deals
}: PropertyFiltersPanelProps) {
  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({ listing_type: 'all' })
  }

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'listing_type' && filters[key as keyof PropertyFilters]
  )

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            value={filters.property_type || ''}
            onChange={(e) => updateFilter('property_type', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {propertyTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            value={filters.min_price || ''}
            onChange={(e) => updateFilter('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="$0"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            value={filters.max_price || ''}
            onChange={(e) => updateFilter('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="No limit"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Min Bedrooms
          </label>
          <select
            value={filters.min_bedrooms || ''}
            onChange={(e) => updateFilter('min_bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Min Bathrooms
          </label>
          <select
            value={filters.min_bathrooms || ''}
            onChange={(e) => updateFilter('min_bathrooms', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="1.5">1.5+</option>
            <option value="2">2+</option>
            <option value="2.5">2.5+</option>
            <option value="3">3+</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={filters.city || ''}
            onChange={(e) => updateFilter('city', e.target.value || undefined)}
            placeholder="Enter city"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            value={filters.state || ''}
            onChange={(e) => updateFilter('state', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All States</option>
            {US_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
