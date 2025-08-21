'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (addressComponents: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address",
  className = "",
  required = false
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        // Check if Google Maps API key is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          setError('Google Maps API key not configured')
          return
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        })

        await loader.load()
        setIsLoaded(true)

        if (inputRef.current && !autocompleteRef.current && (window as any).google) {
          // Initialize autocomplete
          autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['address'],
              componentRestrictions: { country: 'us' }, // Restrict to US addresses
              fields: ['address_components', 'formatted_address', 'geometry']
            }
          )

          // Add place changed listener
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace()
            
            if (place && place.address_components) {
              const addressComponents = place.address_components
              
              // Extract address components
              let streetNumber = ''
              let route = ''
              let city = ''
              let state = ''
              let zipCode = ''
              let country = ''

              addressComponents.forEach((component: any) => {
                const types = component.types
                
                if (types.includes('street_number')) {
                  streetNumber = component.long_name
                }
                if (types.includes('route')) {
                  route = component.long_name
                }
                if (types.includes('locality')) {
                  city = component.long_name
                }
                if (types.includes('administrative_area_level_1')) {
                  state = component.long_name
                }
                if (types.includes('postal_code')) {
                  zipCode = component.long_name
                }
                if (types.includes('country')) {
                  country = component.long_name
                }
              })

              const fullAddress = `${streetNumber} ${route}`.trim()
              
              // Update the input value
              onChange(place.formatted_address || fullAddress)
              
              // Call the address select callback with parsed components
              if (onAddressSelect) {
                onAddressSelect({
                  address: fullAddress,
                  city,
                  state,
                  zipCode,
                  country
                })
              }
            }
          })
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load address autocomplete')
      }
    }

    initializeAutocomplete()

    // Cleanup
    return () => {
      if (autocompleteRef.current && (window as any).google) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onChange, onAddressSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  if (error) {
    // Fallback to regular input if Google Maps fails to load
    return (
      <div>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
          required={required}
        />
        <p className="text-xs text-yellow-600 mt-1">
          Address autocomplete unavailable - using manual entry
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        required={required}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
