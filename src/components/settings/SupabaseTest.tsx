'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SupabaseTest() {
  const [status, setStatus] = useState<string>('Not tested')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      console.log('Testing Supabase connection...')
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Test basic connection using existing agents table
      const { data, error } = await supabase.from('agents').select('count').limit(1)
      
      if (error) {
        setStatus(`❌ Connection failed: ${error.message}`)
        console.error('Supabase error:', error)
      } else {
        setStatus('✅ Supabase connection successful!')
        console.log('Supabase connected successfully')
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testGoogleProvider = async () => {
    setLoading(true)
    try {
      console.log('Testing Google OAuth provider...')
      
      // This will fail if Google provider is not enabled
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      })

      if (error) {
        setStatus(`❌ Google OAuth error: ${error.message}`)
        console.error('Google OAuth error:', error)
      } else {
        setStatus('✅ Google OAuth initiated (popup should open)')
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('OAuth test error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-2">Current Status:</p>
          <p className="font-medium">{status}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Supabase Connection'}
          </button>
          
          <button
            onClick={testGoogleProvider}
            disabled={loading}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Google OAuth'}
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  )
}
