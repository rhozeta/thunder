import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, action, event, eventId, startDate, endDate, taskId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    // Get user's Google Calendar token
    const { data: userSettings } = await supabaseClient
      .from('user_settings')
      .select('google_calendar_token')
      .eq('user_id', userId)
      .single()

    if (!userSettings?.google_calendar_token) {
      throw new Error('Google Calendar not connected')
    }

    const token = userSettings.google_calendar_token

    const getAccessToken = async () => {
      if (token.expires_at && new Date(token.expires_at * 1000) > new Date()) {
        return token.access_token
      }

      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: token.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshResponse.json()

      if (refreshData.error) {
        throw new Error(refreshData.error_description)
      }

      // Update token in database
      await supabaseClient
        .from('user_settings')
        .update({
          google_calendar_token: {
            ...token,
            access_token: refreshData.access_token,
            expires_at: Math.floor(Date.now() / 1000) + refreshData.expires_in,
          },
        })
        .eq('user_id', userId)

      return refreshData.access_token
    }

    const accessToken = await getAccessToken()

    if (action === 'createEvent') {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      const eventData = await response.json()

      if (eventData.error) {
        throw new Error(eventData.error.message)
      }

      // Store the Google Calendar event ID with the task
      if (taskId) {
        await supabaseClient
          .from('tasks')
          .update({ google_calendar_event_id: eventData.id })
          .eq('id', taskId)
      }

      return new Response(
        JSON.stringify({ eventId: eventData.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateEvent') {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      const eventData = await response.json()

      if (eventData.error) {
        throw new Error(eventData.error.message)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteEvent') {
      await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'syncFromCalendar') {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate}&timeMax=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      const eventsData = await response.json()

      if (eventsData.error) {
        throw new Error(eventsData.error.message)
      }

      const events = eventsData.items || []
      const syncedTasks = []

      for (const event of events) {
        if (event.start?.dateTime || event.start?.date) {
          const startDateTime = event.start.dateTime || event.start.date
          
          // Check if this event already exists as a task
          const { data: existingTask } = await supabaseClient
            .from('tasks')
            .select('id')
            .eq('google_calendar_event_id', event.id)
            .single()

          if (!existingTask) {
            const newTask = {
              title: event.summary || 'Untitled Event',
              description: event.description || '',
              due_date: startDateTime,
              type: 'appointment',
              status: 'pending',
              user_id: userId,
              google_calendar_event_id: event.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            const { data: createdTask } = await supabaseClient
              .from('tasks')
              .insert(newTask)
              .select()
              .single()

            if (createdTask) {
              syncedTasks.push(createdTask)
            }
          }
        }
      }

      // Update last sync time
      await supabaseClient
        .from('user_settings')
        .upsert({
          user_id: userId,
          google_calendar_sync_status: {
            lastSync: new Date().toISOString(),
            syncEnabled: true,
          },
          updated_at: new Date().toISOString(),
        })

      return new Response(
        JSON.stringify({ events: syncedTasks }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  } catch (error) {
    console.error('Error in google-calendar-sync:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
