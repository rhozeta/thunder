-- Update all deals to have the correct assigned_agent_id
-- This script sets all deals to be assigned to agent: 47f09df2-ada1-44f0-814a-ee1a361d7417

-- First, let's see how many deals will be affected
SELECT 
    COUNT(*) as total_deals,
    COUNT(CASE WHEN assigned_agent_id IS NULL THEN 1 END) as deals_without_agent,
    COUNT(CASE WHEN assigned_agent_id IS NOT NULL THEN 1 END) as deals_with_agent
FROM deals;

-- Update all deals to have the specified assigned_agent_id
UPDATE deals 
SET assigned_agent_id = '47f09df2-ada1-44f0-814a-ee1a361d7417'
WHERE assigned_agent_id IS NULL OR assigned_agent_id != '47f09df2-ada1-44f0-814a-ee1a361d7417';

-- Verify the update
SELECT 
    COUNT(*) as total_deals,
    COUNT(CASE WHEN assigned_agent_id = '47f09df2-ada1-44f0-814a-ee1a361d7417' THEN 1 END) as deals_with_correct_agent,
    COUNT(CASE WHEN assigned_agent_id != '47f09df2-ada1-44f0-814a-ee1a361d7417' THEN 1 END) as deals_with_other_agents
FROM deals;

-- Show a sample of updated deals
SELECT 
    id,
    title,
    assigned_agent_id,
    created_at
FROM deals 
ORDER BY created_at DESC 
LIMIT 10;
