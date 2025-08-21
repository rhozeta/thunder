'use client'

import React from 'react'
import { Property } from '@/types/property'
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Calendar,
  User,
  Building2,
  Eye,
  Edit,
  Phone,
  Mail
} from 'lucide-react'

interface PropertyCardProps {
  property: Property
  viewMode: 'grid' | 'list'
  onEdit: (property: Property) => void
}

export function PropertyCard({ property, viewMode, onEdit }: PropertyCardProps) {
  const formatPrice = (price?: number) => {
    if (!price) return 'Price not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sold':
        return 'bg-blue-100 text-blue-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getListingTypeColor = (listingType: string) => {
    return listingType === 'my_listing' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800'
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-6">
          {/* Property Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
              {property.primary_image ? (
                <img
                  src={property.primary_image.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    console.log('List view image loaded:', property.primary_image?.image_url);
                  }}
                  onError={(e) => {
                    console.error('List view image failed to load:', property.primary_image?.image_url);
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTE1IDEySDlNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDMuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSIjOUI5QkEwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                    target.className = "w-full h-full object-contain bg-gray-100";
                  }}
                  style={{ minHeight: '1px' }}  /* Force image to render */
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {property.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {property.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(property.listing_type)}`}>
                    {property.listing_type === 'my_listing' ? 'My Listing' : 'Client Interest'}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {property.address}, {property.city}, {property.state} {property.zip_code}
                  </span>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.square_feet && (
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      <span>{property.square_feet.toLocaleString()} sq ft</span>
                    </div>
                  )}
                </div>

                {property.contact && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{property.contact.first_name} {property.contact.last_name}</span>
                    </div>
                    {property.contact.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{property.contact.phone}</span>
                      </div>
                    )}
                    {property.contact.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{property.contact.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end space-y-2">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(property.list_price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Listed {formatDate(property.created_at)}
                  </div>
                </div>

                <button
                  onClick={() => onEdit(property)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Property Image */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {property.primary_image ? (
          <img
            src={property.primary_image.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
            style={{ 
              display: 'block',
              width: '100%',
              height: '100%'
            }}
            onLoad={(e) => {
              console.log(`${viewMode} view image loaded:`, property.primary_image?.image_url);
              console.log('Image dimensions:', 
                (e.target as HTMLImageElement).naturalWidth, 
                (e.target as HTMLImageElement).naturalHeight
              );
            }}
            onError={(e) => {
              console.error(`${viewMode} view image failed to load:`, property.primary_image?.image_url);
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTE1IDEySDlNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDMuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSIjOUI5QkEwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {property.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Listing Type Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(property.listing_type)}`}>
            {property.listing_type === 'my_listing' ? 'My Listing' : 'Client Interest'}
          </span>
        </div>

        {/* Edit Button - Visible on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={() => onEdit(property)}
            className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 px-4 py-2 bg-white text-gray-900 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Property</span>
          </button>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.address}, {property.city}, {property.state}
            </span>
          </div>
        </div>

        {/* Property Specs */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-3">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
          </div>
          {property.square_feet && (
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.square_feet.toLocaleString()} sq ft</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {property.contact && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <User className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">
              {property.contact.first_name} {property.contact.last_name}
            </span>
          </div>
        )}

        {/* Price and Date */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            {formatPrice(property.list_price)}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(property.created_at)}
          </div>
        </div>

        {/* MLS Number */}
        {property.mls_number && (
          <div className="mt-2 text-xs text-gray-500">
            MLS# {property.mls_number}
          </div>
        )}
      </div>
    </div>
  )
}
