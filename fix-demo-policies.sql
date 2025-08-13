-- Exact fix for demo user ID
-- Run this in Supabase SQL Editor

-- First, let's see what data exists
SELECT 
    COUNT(*) as total_contacts,
    MIN(created_at) as earliest_contact,
    MAX(created_at) as latest_contact
FROM contacts;

-- Check if any contacts have the demo user ID
SELECT COUNT(*) as demo_contacts 
FROM contacts 
WHERE assigned_agent_id = '00000000-0000-0000-0000-000000000000';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

-- Create policies for demo user
CREATE POLICY "Demo user view contacts" ON contacts
    FOR SELECT USING (assigned_agent_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo user create contacts" ON contacts
    FOR INSERT WITH CHECK (assigned_agent_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo user update contacts" ON contacts
    FOR UPDATE USING (assigned_agent_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo user delete contacts" ON contacts
    FOR DELETE USING (assigned_agent_id = '00000000-0000-0000-0000-000000000000');

-- Ensure we have test data with demo user ID
INSERT INTO contacts (first_name, last_name, email, phone, contact_type, status, assigned_agent_id, budget_min, budget_max) VALUES
('Test', 'User', 'test@demo.com', '555-0000', 'buyer', 'new', '00000000-0000-0000-0000-000000000000', 250000, 450000)
ON CONFLICT DO NOTHING;
