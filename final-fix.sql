-- Definitive fix for demo setup
-- Run this exact SQL in Supabase SQL Editor

-- Step 1: Disable RLS temporarily for testing
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Step 2: Ensure we have data with demo user ID
INSERT INTO contacts (first_name, last_name, email, phone, contact_type, status, assigned_agent_id, budget_min, budget_max) VALUES
('John', 'Doe', 'john@demo.com', '555-0123', 'buyer', 'new', '00000000-0000-0000-0000-000000000000', 300000, 500000),
('Jane', 'Smith', 'jane@demo.com', '555-0124', 'seller', 'qualified', '00000000-0000-0000-0000-000000000000', 400000, 600000),
('Bob', 'Johnson', 'bob@demo.com', '555-0125', 'investor', 'nurturing', '00000000-0000-0000-0000-000000000000', 200000, 800000)
ON CONFLICT DO NOTHING;

-- Step 3: Verify data exists
SELECT 
    id,
    first_name, 
    last_name, 
    email, 
    contact_type, 
    status,
    assigned_agent_id
FROM contacts 
LIMIT 10;
