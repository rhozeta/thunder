-- Fix RLS policies for dashboard_preferences table
-- This script applies the RLS policy fixes to resolve authentication issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own dashboard preferences" ON dashboard_preferences;
DROP POLICY IF EXISTS "Users can insert their own dashboard preferences" ON dashboard_preferences;
DROP POLICY IF EXISTS "Users can update their own dashboard preferences" ON dashboard_preferences;
DROP POLICY IF EXISTS "Users can delete their own dashboard preferences" ON dashboard_preferences;

-- Create more permissive RLS policies that work with auth context
CREATE POLICY "Users can view their own dashboard preferences" ON dashboard_preferences
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT auth.jwt() ->> 'sub')::uuid = user_id
  );

CREATE POLICY "Users can insert their own dashboard preferences" ON dashboard_preferences
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (SELECT auth.jwt() ->> 'sub')::uuid = user_id
  );

CREATE POLICY "Users can update their own dashboard preferences" ON dashboard_preferences
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (SELECT auth.jwt() ->> 'sub')::uuid = user_id
  );

CREATE POLICY "Users can delete their own dashboard preferences" ON dashboard_preferences
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (SELECT auth.jwt() ->> 'sub')::uuid = user_id
  );

-- Ensure RLS is enabled
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON dashboard_preferences TO authenticated;
GRANT SELECT ON dashboard_preferences TO anon;
