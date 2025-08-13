-- Fix RLS policies for demo user
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

-- Create new policies for demo user ID
CREATE POLICY "Allow all operations for demo" ON contacts
    FOR ALL USING (assigned_agent_id = '00000000-0000-0000-0000-000000000000');

-- Alternative: Allow all users to see all contacts (for testing)
-- CREATE POLICY "Allow all users" ON contacts FOR ALL USING (true);

-- Check if policies are working
SELECT * FROM contacts LIMIT 5;
