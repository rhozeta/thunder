'use client'

import React, { useState, useEffect } from 'react'
import { Property, PropertyInsert, PropertyUpdate, PROPERTY_FEATURES, PROPERTY_AMENITIES, US_STATES } from '@/types/property'
import { PropertyImageService } from '@/services/propertyImages'
import { AddressAutocomplete } from './AddressAutocomplete'
import { X, Upload, Image as ImageIcon, Trash2, Star, Save, Plus, ChevronDown, ChevronRight, Home, MapPin, Building, DollarSign, Settings, FileText, Users } from 'lucide-react'

interface PropertySidebarProps {
  isOpen: boolean
  onClose: () => void
  property?: Property | null
  onSave: (data: PropertyInsert | PropertyUpdate) => void
  onDelete?: (id: string) => void
  propertyTypes: any[]
  contacts: any[]
  deals: any[]
}

export function PropertySidebar({
  isOpen,
  onClose,
  property,
  onSave,
  onDelete,
  propertyTypes,
  contacts,
  deals
}: PropertySidebarProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    property_type: '',
    listing_type: 'my_listing' as 'my_listing' | 'client_interest',
    status: 'active' as 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    lot_size_sqft: '',
    year_built: '',
    garage_spaces: '',
    list_price: '',
    sale_price: '',
    estimated_value: '',
    hoa_fees: '',
    property_taxes: '',
    mls_number: '',
    features: [] as string[],
    amenities: [] as string[],
    notes: '',
    contact_id: '',
    deal_id: '',
    assigned_agent_id: ''
  })

  const [images, setImages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Section collapse states
  const [sectionStates, setSectionStates] = useState({
    basic: true,      // Basic Information - expanded by default
    address: false,   // Address - collapsed
    details: false,   // Property Details - collapsed
    pricing: false,   // Pricing - collapsed
    features: false,  // Features & Amenities - collapsed
    additional: false,// Additional Details - collapsed
    relationships: false, // Relationships - collapsed
    images: false     // Images - collapsed
  })

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        country: property.country || 'United States',
        property_type: property.property_type || '',
        listing_type: property.listing_type || 'my_listing',
        status: property.status || 'active',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        square_feet: property.square_feet?.toString() || '',
        lot_size_sqft: property.lot_size_sqft?.toString() || '',
        year_built: property.year_built?.toString() || '',
        garage_spaces: property.garage_spaces?.toString() || '',
        list_price: property.list_price?.toString() || '',
        sale_price: property.sale_price?.toString() || '',
        estimated_value: property.estimated_value?.toString() || '',
        hoa_fees: property.hoa_fees?.toString() || '',
        property_taxes: property.property_taxes?.toString() || '',
        mls_number: property.mls_number || '',
        features: property.features || [],
        amenities: property.amenities || [],
        notes: property.notes || '',
        contact_id: property.contact_id || '',
        deal_id: property.deal_id || '',
        assigned_agent_id: property.assigned_agent_id || ''
      })
      setImages(property.images || [])
    } else {
      // Reset form for new property
      setFormData({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',
        property_type: '',
        listing_type: 'my_listing',
        status: 'active',
        bedrooms: '',
        bathrooms: '',
        square_feet: '',
        lot_size_sqft: '',
        year_built: '',
        garage_spaces: '',
        list_price: '',
        sale_price: '',
        estimated_value: '',
        hoa_fees: '',
        property_taxes: '',
        mls_number: '',
        features: [],
        amenities: [],
        notes: '',
        contact_id: '',
        deal_id: '',
        assigned_agent_id: ''
      })
      setImages([])
    }
  }, [property])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleSection = (section: keyof typeof sectionStates) => {
    setSectionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const SectionHeader = ({ 
    title, 
    section, 
    icon: Icon 
  }: { 
    title: string; 
    section: keyof typeof sectionStates; 
    icon: any 
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg mb-3 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {sectionStates[section] ? (
        <ChevronDown className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronRight className="h-4 w-4 text-gray-600" />
      )}
    </button>
  )

  const handleAddressSelect = (addressComponents: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }) => {
    setFormData((prev: any) => ({
      ...prev,
      address: addressComponents.address,
      city: addressComponents.city,
      state: addressComponents.state,
      zip_code: addressComponents.zipCode,
      country: addressComponents.country
    }))
  }

  const handleArrayToggle = (field: 'features' | 'amenities', item: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i: string) => i !== item)
        : [...prev[field], item]
    }))
  }

  const handleImageUpload = async (files: FileList) => {
    // Allow image upload for both new and existing properties
    setUploading(true)
    try {
      if (property) {
        // Existing property - upload to storage immediately
        const uploadPromises = Array.from(files).map(async (file) => {
          const imageData = {
            caption: file.name,
            is_primary: images.length === 0, // First image becomes primary
            sort_order: images.length + 1
          }
          return PropertyImageService.uploadPropertyImage(property.id, file, imageData)
        })
        
        const uploadedImages = await Promise.all(uploadPromises)
        setImages(prev => [...prev, ...uploadedImages])
      } else {
        // New property - store files temporarily for upload after property creation
        const tempImages = Array.from(files).map((file, index) => ({
          id: `temp-${Date.now()}-${index}`,
          file,
          image_url: URL.createObjectURL(file),
          caption: file.name,
          is_primary: images.length === 0 && index === 0,
          sort_order: images.length + index + 1
        }))
        
        setImages(prev => [...prev, ...tempImages])
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      setError('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!property) return
    
    try {
      await PropertyImageService.setPrimaryImage(property.id, imageId)
      setImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })))
    } catch (error) {
      console.error('Error setting primary image:', error)
      setError('Failed to set primary image. Please try again.')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!property) {
      // For new properties, just remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId))
      return
    }
    
    try {
      await PropertyImageService.deletePropertyImage(imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
      setError('Failed to delete image. Please try again.')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Property title is required')
      setSaving(false)
      return
    }

    // Validate numeric fields to prevent overflow
    const bedrooms = formData.bedrooms ? parseInt(formData.bedrooms) : undefined
    const bathrooms = formData.bathrooms ? parseFloat(formData.bathrooms) : undefined
    
    if (bedrooms !== undefined && (bedrooms < 0 || bedrooms > 999)) {
      setError('Bedrooms must be between 0 and 999')
      setSaving(false)
      return
    }
    
    if (bathrooms !== undefined && (bathrooms < 0 || bathrooms > 999.5)) {
      setError('Bathrooms must be between 0 and 999.5')
      setSaving(false)
      return
    }

    try {
      const saveData = {
        ...formData,
        bedrooms,
        bathrooms,
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : undefined,
        lot_size_sqft: formData.lot_size_sqft ? parseInt(formData.lot_size_sqft) : undefined,
        year_built: formData.year_built ? parseInt(formData.year_built) : undefined,
        garage_spaces: formData.garage_spaces ? parseInt(formData.garage_spaces) : undefined,
        list_price: formData.list_price ? parseFloat(formData.list_price) : undefined,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : undefined,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : undefined,
        hoa_fees: formData.hoa_fees ? parseFloat(formData.hoa_fees) : undefined,
        property_taxes: formData.property_taxes ? parseFloat(formData.property_taxes) : undefined,
        contact_id: formData.contact_id || undefined,
        deal_id: formData.deal_id || undefined,
        assigned_agent_id: formData.assigned_agent_id || undefined
      }

      const savedProperty = await onSave(saveData) as any
      
      // If this is a new property and we have temporary images, upload them now
      if (!property && images.length > 0 && savedProperty?.id) {
        const tempImages = images.filter((img: any) => img.id.startsWith('temp-'))
        if (tempImages.length > 0) {
          try {
            const uploadPromises = tempImages.map(async (tempImage: any, index: number) => {
              const imageData = {
                caption: tempImage.caption,
                is_primary: tempImage.is_primary,
                sort_order: index + 1
              }
              return PropertyImageService.uploadPropertyImage(savedProperty.id, tempImage.file, imageData)
            })
            
            const uploadedImages = await Promise.all(uploadPromises)
            
            // Clean up temporary URLs
            tempImages.forEach(img => {
              if (img.image_url.startsWith('blob:')) {
                URL.revokeObjectURL(img.image_url)
              }
            })
            
            // Update images state with uploaded images
            setImages(prev => [
              ...prev.filter(img => !img.id.startsWith('temp-')),
              ...uploadedImages
            ])
          } catch (imageError) {
            console.error('Error uploading images after property creation:', imageError)
            setError('Property saved but some images failed to upload. You can try uploading them again.')
          }
        }
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to save property. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {property ? 'Edit Property' : 'Add Property'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              </div>
            )}
            {/* Basic Information Section */}
            <div>
              <SectionHeader title="Basic Information" section="basic" icon={Home} />
              {sectionStates.basic && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter property title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type *
                      </label>
                      <select
                        value={formData.property_type}
                        onChange={(e) => handleInputChange('property_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        {propertyTypes.map(type => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Listing Type *
                      </label>
                      <select
                        value={formData.listing_type}
                        onChange={(e) => handleInputChange('listing_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="my_listing">My Listing</option>
                        <option value="client_interest">Client Interest</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Property description"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Address Section */}
            <div>
              <SectionHeader title="Address" section="address" icon={MapPin} />
              {sectionStates.address && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={(value) => handleInputChange('address', value)}
                      onAddressSelect={handleAddressSelect}
                      placeholder="123 Main Street"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => handleInputChange('zip_code', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Property Details Section */}
            <div>
              <SectionHeader title="Property Details" section="details" icon={Building} />
              {sectionStates.details && (
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="999.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Garage Spaces
                      </label>
                      <input
                        type="number"
                        value={formData.garage_spaces}
                        onChange={(e) => handleInputChange('garage_spaces', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Square Feet
                      </label>
                      <input
                        type="number"
                        value={formData.square_feet}
                        onChange={(e) => handleInputChange('square_feet', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lot Size (sq ft)
                      </label>
                      <input
                        type="number"
                        value={formData.lot_size_sqft}
                        onChange={(e) => handleInputChange('lot_size_sqft', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Built
                    </label>
                    <input
                      type="number"
                      value={formData.year_built}
                      onChange={(e) => handleInputChange('year_built', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div>
              <SectionHeader title="Pricing & Financial" section="pricing" icon={DollarSign} />
              {sectionStates.pricing && (
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        List Price
                      </label>
                      <input
                        type="number"
                        value={formData.list_price}
                        onChange={(e) => handleInputChange('list_price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="1000"
                        placeholder="$0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price
                      </label>
                      <input
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) => handleInputChange('sale_price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="1000"
                        placeholder="$0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Value
                      </label>
                      <input
                        type="number"
                        value={formData.estimated_value}
                        onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="1000"
                        placeholder="$0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HOA Fees (monthly)
                      </label>
                      <input
                        type="number"
                        value={formData.hoa_fees}
                        onChange={(e) => handleInputChange('hoa_fees', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="10"
                        placeholder="$0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Taxes (annual)
                    </label>
                    <input
                      type="number"
                      value={formData.property_taxes}
                      onChange={(e) => handleInputChange('property_taxes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="100"
                      placeholder="$0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Features & Amenities Section */}
            <div>
              <SectionHeader title="Features & Amenities" section="features" icon={Settings} />
              {sectionStates.features && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Features
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {PROPERTY_FEATURES.map(feature => (
                        <label key={feature} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.features.includes(feature)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('features', [...formData.features, feature])
                              } else {
                                handleInputChange('features', formData.features.filter(f => f !== feature))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {PROPERTY_AMENITIES.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.amenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('amenities', [...formData.amenities, amenity])
                              } else {
                                handleInputChange('amenities', formData.amenities.filter(a => a !== amenity))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details Section */}
            <div>
              <SectionHeader title="Additional Details" section="additional" icon={FileText} />
              {sectionStates.additional && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MLS Number
                    </label>
                    <input
                      type="text"
                      value={formData.mls_number}
                      onChange={(e) => handleInputChange('mls_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MLS123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes about the property..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Relationships Section */}
            <div>
              <SectionHeader title="Relationships" section="relationships" icon={Users} />
              {sectionStates.relationships && (
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact
                      </label>
                      <select
                        value={formData.contact_id}
                        onChange={(e) => handleInputChange('contact_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select contact</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal
                      </label>
                      <select
                        value={formData.deal_id}
                        onChange={(e) => handleInputChange('deal_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select deal</option>
                        {deals.map(deal => (
                          <option key={deal.id} value={deal.id}>
                            {deal.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Images Section */}
            <div>
              <SectionHeader title="Property Images" section="images" icon={ImageIcon} />
              {sectionStates.images && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                    </span>
                    <label className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={image.id || index} className="relative group">
                          <img
                            src={image.image_url}
                            alt={image.caption || 'Property image'}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            onLoad={() => {
                              console.log('Image loaded successfully:', image.image_url);
                            }}
                            onError={(e) => {
                              console.error('PropertySidebar image failed to load:', image.image_url);
                              console.error('Error details:', e);
                              // Show fallback instead of hiding
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTE1IDEySDlNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDcuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSIjOUI5QkEwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                              target.className = "w-full h-24 object-contain rounded-lg border border-gray-200 bg-gray-100";
                            }}
                          />
                          
                          {/* Primary image indicator */}
                          {image.is_primary && (
                            <div className="absolute top-2 left-2 bg-yellow-500 rounded-full p-1 shadow-md">
                              <Star className="w-3 h-3 text-white fill-current" />
                            </div>
                          )}
                          
                          {/* Primary label */}
                          {image.is_primary && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                              PRIMARY
                            </div>
                          )}
                          
                          {/* Image actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                              {!image.is_primary && property && (
                                <button
                                  onClick={() => handleSetPrimaryImage(image.id)}
                                  className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                  title="Set as primary"
                                >
                                  <Star className="w-3 h-3 text-gray-600" />
                                </button>
                              )}
                              {property && (
                                <button
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="p-1 bg-white rounded-full hover:bg-red-100 transition-colors"
                                  title="Delete image"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Caption */}
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {images.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">No images uploaded yet</p>
                      <p className="text-xs text-gray-400">Upload images to showcase this property</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              {property && onDelete && (
                <button
                  onClick={() => onDelete(property.id)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Property'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
