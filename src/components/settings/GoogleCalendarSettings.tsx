'use client'

import { useState, useEffect } from 'react'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { createClient } from '@supabase/supabase-js'
import { Calendar, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GoogleCalendarSettings() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [userId, setUserId] = useState<string | null>(null)

  const googleCalendarService = GoogleCalendarService.getInstance()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      if (user?.id) {
        checkConnection(user.id)
      }
    }
    getUser()
  }, [])

  const checkConnection = async (userId: string) => {
    try {
      const connected = await googleCalendarService.isConnected(userId)
      setIsConnected(connected)
      
      if (connected) {
        const status = await googleCalendarService.getSyncStatus(userId)
        if (status?.lastSync) {
          setLastSync(new Date(status.lastSync))
        }
      }
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error)
    }
  }

  const handleConnect = async () => {
    if (!userId) {
      alert('Please log in first to connect Google Calendar');
      return;
    }
    
    setIsLoading(true);
    setSyncStatus('syncing');
    
    console.log('Starting Google Calendar integration for user:', userId);
    
    try {
      // Use Supabase OAuth with Google Calendar scopes
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'https://www.googleapis.com/auth/calendar',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google Calendar OAuth error:', error);
        alert(`Failed to connect Google Calendar: ${error.message}`);
        setIsLoading(false);
        setSyncStatus('idle');
        return;
      }

      // The OAuth flow will redirect to /auth/callback
      // We'll check for connection status when the user returns
      
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      setSyncStatus('idle');
    }
  }

  const handleDisconnect = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      await googleCalendarService.disconnectGoogleCalendar(userId)
      setIsConnected(false)
      setLastSync(null)
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!userId) {
      alert('Please log in to sync Google Calendar');
      return;
    }
    
    setSyncStatus('syncing')
    console.log('Starting sync for user:', userId);
    
    try {
      await googleCalendarService.syncFromGoogleCalendar(userId, new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
      setLastSync(new Date())
      setSyncStatus('idle')
      alert('Google Calendar sync completed successfully!');
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      setSyncStatus('error');
      alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure functions are deployed.`);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Sync your tasks with Google Calendar for seamless scheduling
          </p>
        </div>
        {isConnected && (
          <CheckCircle className="h-6 w-6 text-green-500" />
        )}
      </div>

      {/* Debug Information */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md text-xs">
        <p className="font-semibold mb-1">Debug Info:</p>
        <p>User ID: {userId || 'Not logged in'}</p>
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing'}</p>
        <p>Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Connection Status
            </p>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Not Connected'}
            </p>
          </div>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isLoading || !userId}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                syncStatus === 'syncing' ? 'Connecting & Syncing...' : 'Connecting...'
              ) : (
                'Connect & Sync Google Calendar'
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
        </div>

        {!userId && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Please log in to use Google Calendar integration
            </p>
          </div>
        )}

        {isConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Last Sync</p>
                <p className="text-sm text-gray-600">
                  {lastSync ? lastSync.toLocaleString() : 'Never'}
                </p>
              </div>
              <button
                onClick={handleSync}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
            
            {syncStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Sync failed. Please try again or check your connection.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
