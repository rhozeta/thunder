'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthTest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        console.log('Current user:', user)
        console.log('User ID:', user?.id)
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.id)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      console.log('Starting Google OAuth login...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'https://www.googleapis.com/auth/calendar'
        }
      })
      if (error) {
        console.error('Google OAuth error:', error)
        alert(`Login failed: ${error.message}. Please check your Supabase Google OAuth configuration.`)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }



  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-600">Checking authentication...</div>
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-3">Authentication Status</h3>
      
      {user ? (
        <div className="space-y-2">
          <p className="text-green-600 font-medium">✅ Logged in as: {user.email}</p>
          <p className="text-sm text-gray-600">User ID: {user.id}</p>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-red-600 font-medium">❌ Not logged in</p>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Login with Google
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This will request Google Calendar permissions for full integration
          </p>
        </div>
      )}
    </div>
  )
}
