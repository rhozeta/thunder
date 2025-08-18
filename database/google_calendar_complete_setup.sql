-- Complete Google Calendar Integration Setup SQL
-- Run this in Supabase SQL Editor to set up Google Calendar integration

-- Step 1: Clean up any existing Google Calendar related structures
DROP TABLE IF EXISTS google_calendar_settings CASCADE;
DROP INDEX IF EXISTS idx_tasks_google_calendar_event_id;
DROP INDEX IF EXISTS idx_google_calendar_settings_user_id;

-- Step 2: Remove Google Calendar column from tasks if it exists
ALTER TABLE tasks 
DROP COLUMN IF EXISTS google_calendar_event_id;

-- Step 3: Add Google Calendar event ID column to tasks table
ALTER TABLE tasks 
ADD COLUMN google_calendar_event_id TEXT;

-- Step 4: Create Google Calendar settings table
CREATE TABLE google_calendar_settings (
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

-- Step 5: Create indexes for performance
CREATE INDEX idx_tasks_google_calendar_event_id 
ON tasks(google_calendar_event_id) 
WHERE google_calendar_event_id IS NOT NULL;

CREATE INDEX idx_google_calendar_settings_user_id 
ON google_calendar_settings(user_id);

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE google_calendar_settings ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own Google Calendar settings" ON google_calendar_settings;
DROP POLICY IF EXISTS "Users can update their own Google Calendar settings" ON google_calendar_settings;
DROP POLICY IF EXISTS "Users can insert their own Google Calendar settings" ON google_calendar_settings;
DROP POLICY IF EXISTS "Users can delete their own Google Calendar settings" ON google_calendar_settings;

-- Step 8: Create RLS policies
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

-- Step 9: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 10: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_google_calendar_settings_updated_at ON google_calendar_settings;

-- Step 11: Create updated_at trigger
CREATE TRIGGER update_google_calendar_settings_updated_at 
    BEFORE UPDATE ON google_calendar_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Verify the setup
-- This query should return the new structures
SELECT 
    'tasks table has google_calendar_event_id' as check_name,
    CASE WHEN column_name IS NOT NULL THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'google_calendar_event_id'

UNION ALL

SELECT 
    'google_calendar_settings table exists' as check_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables 
WHERE table_name = 'google_calendar_settings'

UNION ALL

SELECT 
    'RLS is enabled on google_calendar_settings' as check_name,
    CASE WHEN rowsecurity THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_tables 
WHERE tablename = 'google_calendar_settings';

-- Step 13: Grant necessary permissions (if needed)
GRANT ALL ON google_calendar_settings TO authenticated;
GRANT ALL ON google_calendar_settings TO service_role;

-- Step 14: Create a view for debugging (optional)
CREATE OR REPLACE VIEW google_calendar_debug AS
SELECT 
    u.id as user_id,
    u.email,
    gcs.is_connected,
    gcs.last_sync,
    gcs.calendar_id,
    gcs.created_at,
    gcs.updated_at
FROM auth.users u
LEFT JOIN google_calendar_settings gcs ON u.id = gcs.user_id;

-- Step 15: Final verification query
SELECT * FROM google_calendar_debug LIMIT 10;
