-- Add Google Calendar integration fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create index for Google Calendar event lookup
CREATE INDEX IF NOT EXISTS idx_tasks_google_calendar_event_id 
ON tasks(google_calendar_event_id) 
WHERE google_calendar_event_id IS NOT NULL;

-- Add Google Calendar sync settings table
CREATE TABLE IF NOT EXISTS google_calendar_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    calendar_id TEXT DEFAULT 'primary',
    last_sync TIMESTAMP WITH TIME ZONE,
    is_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for user lookup
CREATE INDEX IF NOT EXISTS idx_google_calendar_settings_user_id 
ON google_calendar_settings(user_id);

-- Add RLS policies for google_calendar_settings
ALTER TABLE google_calendar_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Google Calendar settings" 
ON google_calendar_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Calendar settings" 
ON google_calendar_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Calendar settings" 
ON google_calendar_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Calendar settings" 
ON google_calendar_settings FOR DELETE 
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_calendar_settings_updated_at 
    BEFORE UPDATE ON google_calendar_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
