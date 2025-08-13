-- Add assigned_agent_id to deals table
-- This migration adds the assigned_agent_id field to track which agent is responsible for each deal

-- Add the assigned_agent_id column to deals table
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID;

-- Add foreign key constraint (optional, but recommended for data integrity)
-- ALTER TABLE deals 
-- ADD CONSTRAINT fk_deals_assigned_agent 
-- FOREIGN KEY (assigned_agent_id) REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_deals_assigned_agent_id ON deals(assigned_agent_id);

-- Update existing deals to have the demo agent assigned (if any exist)
-- This ensures existing deals are visible to the demo user
UPDATE deals 
SET assigned_agent_id = '00000000-0000-0000-0000-000000000000'
WHERE assigned_agent_id IS NULL;

-- Update RLS policies to use assigned_agent_id directly instead of going through contacts
DROP POLICY IF EXISTS "Demo user view deals" ON deals;
DROP POLICY IF EXISTS "Demo user create deals" ON deals;

-- Create new RLS policies that check assigned_agent_id directly
CREATE POLICY "Users can view own deals" ON deals
    FOR SELECT USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can create own deals" ON deals
    FOR INSERT WITH CHECK (assigned_agent_id = auth.uid());

CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can delete own deals" ON deals
    FOR DELETE USING (assigned_agent_id = auth.uid());

-- Create demo user policy for development
CREATE POLICY "Demo user can manage deals" ON deals
    FOR ALL USING (assigned_agent_id = '00000000-0000-0000-0000-000000000000');
