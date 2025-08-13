'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/auth'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Agent profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [brokerageName, setBrokerageName] = useState('')
  const [brokerageWebsite, setBrokerageWebsite] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [stateRegion, setStateRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('US')
  const [timezone, setTimezone] = useState('America/New_York')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Allowed enum options (keep in sync with DB if using enums)
  const allowedCountries = ['US','CA','GB','AU','NZ','IN','SG','DE','FR','ES','OTHER']
  const allowedTimezones = [
    'UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
    'Europe/London','Europe/Berlin','Asia/Singapore','Asia/Kolkata','Australia/Sydney','Other'
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Validate enum-like inputs: must match available options
    if (country && !allowedCountries.includes(country)) {
      setError('Country must be one of the provided options')
      setLoading(false)
      return
    }
    if (timezone && !allowedTimezones.includes(timezone)) {
      setError('Timezone must be one of the provided options')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            brokerage_name: brokerageName,
            brokerage_website: brokerageWebsite,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state: stateRegion,
            postal_code: postalCode,
            country,
            timezone,
            latitude,
            longitude,
            profile_photo_url: profilePhotoUrl,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 flex">
      {/* Split screen container */}
      <div className="flex w-full max-w-7xl mx-auto bg-white rounded-none lg:rounded-3xl shadow-2xl overflow-hidden my-0 lg:my-8">
        
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center overflow-y-auto max-h-screen">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 mb-6">Join Thunder CRM today</p>
            
            <p className="text-center text-sm text-gray-600 mb-6">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign in
              </Link>
            </p>

        <form className="space-y-4" onSubmit={handleSignup}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Agent Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  id="brokerageName"
                  name="brokerageName"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  placeholder="Brokerage (optional)"
                  value={brokerageName}
                  onChange={(e) => setBrokerageName(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="brokerageWebsite"
                  name="brokerageWebsite"
                  type="url"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  placeholder="Website (optional)"
                  value={brokerageWebsite}
                  onChange={(e) => setBrokerageWebsite(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address line 1 <span className="text-gray-400">(optional)</span></label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="123 Main St"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address line 2 <span className="text-gray-400">(optional)</span></label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Apt, suite, etc."
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City <span className="text-gray-400">(optional)</span></label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="stateRegion" className="block text-sm font-medium text-gray-700">State/Region <span className="text-gray-400">(optional)</span></label>
                <input
                  id="stateRegion"
                  name="stateRegion"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="State or Region"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal code <span className="text-gray-400">(optional)</span></label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ZIP / Postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country <span className="text-gray-400">(optional)</span></label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  list="country-options"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="US"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
                <datalist id="country-options">
                  {allowedCountries.map((c) => (
                    <option value={c} key={c} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-gray-500">Select from the list or type to search. Must match an option.</p>
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone <span className="text-gray-400">(optional)</span></label>
              <input
                id="timezone"
                name="timezone"
                type="text"
                list="timezone-options"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="America/New_York"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
              <datalist id="timezone-options">
                {allowedTimezones.map((tz) => (
                  <option value={tz} key={tz} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-gray-500">Select from the list or type to search. Must match an option.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude <span className="text-gray-400">(optional)</span></label>
                <input
                  id="latitude"
                  name="latitude"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="40.7128"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude <span className="text-gray-400">(optional)</span></label>
                <input
                  id="longitude"
                  name="longitude"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="-74.0060"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profilePhotoUrl" className="block text-sm font-medium text-gray-700">Profile photo URL <span className="text-gray-400">(optional)</span></label>
              <input
                id="profilePhotoUrl"
                name="profilePhotoUrl"
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://..."
                value={profilePhotoUrl}
                onChange={(e) => setProfilePhotoUrl(e.target.value)}
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
          </div>
        </div>
        
        {/* Right side - Illustration */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 via-pink-200/50 to-purple-300/50"></div>
          
          {/* Sun */}
          <div className="absolute top-16 right-16 w-20 h-20 bg-yellow-200 rounded-full opacity-80"></div>
          
          {/* Mountains */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {/* Background mountains */}
              <path d="M0,200 Q100,120 200,160 T400,140 L400,300 L0,300 Z" fill="rgba(139, 69, 19, 0.3)" />
              <path d="M0,220 Q150,140 300,180 T400,160 L400,300 L0,300 Z" fill="rgba(139, 69, 19, 0.4)" />
              
              {/* Foreground mountains */}
              <path d="M0,240 Q100,180 200,200 T400,190 L400,300 L0,300 Z" fill="rgba(139, 69, 19, 0.6)" />
              
              {/* Trees */}
              <g fill="rgba(0, 0, 0, 0.7)">
                <rect x="80" y="220" width="3" height="25" />
                <polygon points="81.5,210 75,225 88,225" />
                
                <rect x="120" y="215" width="3" height="30" />
                <polygon points="121.5,205 115,220 128,220" />
                
                <rect x="160" y="225" width="3" height="20" />
                <polygon points="161.5,215 155,230 168,230" />
                
                <rect x="200" y="210" width="3" height="35" />
                <polygon points="201.5,200 195,215 208,215" />
                
                <rect x="240" y="220" width="3" height="25" />
                <polygon points="241.5,210 235,225 248,225" />
              </g>
              
              {/* Water/lake */}
              <ellipse cx="200" cy="260" rx="80" ry="15" fill="rgba(173, 216, 230, 0.6)" />
            </svg>
          </div>
          
          {/* Floating text */}
          <div className="absolute bottom-20 left-8 text-white/90">
            <p className="text-lg font-medium">Welcome to</p>
            <p className="text-xl font-bold">Thunder CRM</p>
          </div>
          
          {/* Navigation dots */}
          <div className="absolute bottom-8 left-8 flex space-x-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
