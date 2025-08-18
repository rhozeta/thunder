import { Task } from '@/types/task';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

interface SyncStatus {
  lastSync: string;
  syncEnabled: boolean;
  calendarId: string;
}

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  
  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  async getAuthUrl(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { userId, action: 'getAuthUrl' }
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  }

  async exchangeCodeForToken(userId: string, code: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { userId, code, action: 'exchangeCode' }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  async isConnected(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('google_calendar_connected')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.google_calendar_connected || false;
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      return false;
    }
  }

  async syncTaskToGoogleCalendar(userId: string, task: Task): Promise<string | null> {
    try {
      if (!task.due_date) return null;

      const event: GoogleCalendarEvent = {
        summary: task.title,
        description: task.description || '',
        start: {
          dateTime: new Date(task.due_date).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'popup', minutes: 60 }
          ]
        }
      };

      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { userId, action: 'createEvent', event, taskId: task.id }
      });

      if (error) throw error;
      return data.eventId;
    } catch (error) {
      console.error('Error syncing task to Google Calendar:', error);
      throw error;
    }
  }

  async updateGoogleCalendarEvent(userId: string, task: Task, eventId: string): Promise<void> {
    try {
      if (!task.due_date) return;

      const event: GoogleCalendarEvent = {
        summary: task.title,
        description: task.description || '',
        start: {
          dateTime: new Date(task.due_date).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { userId, action: 'updateEvent', event, eventId }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw error;
    }
  }

  async deleteGoogleCalendarEvent(userId: string, eventId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { userId, action: 'deleteEvent', eventId }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw error;
    }
  }

  async syncFromGoogleCalendar(userId: string, startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { 
          userId, 
          action: 'syncFromCalendar', 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        }
      });

      if (error) throw error;
      return data.events || [];
    } catch (error) {
      console.error('Error syncing from Google Calendar:', error);
      throw error;
    }
  }

  async getSyncStatus(userId: string): Promise<SyncStatus | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('google_calendar_sync_status')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.google_calendar_sync_status || null;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  async updateSyncStatus(userId: string, status: Partial<SyncStatus>): Promise<void> {
    try {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          google_calendar_sync_status: status,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }
  }

  async disconnectGoogleCalendar(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_settings')
        .update({
          google_calendar_connected: false,
          google_calendar_sync_status: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      const { error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { userId, action: 'disconnect' }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      throw error;
    }
  }
}
