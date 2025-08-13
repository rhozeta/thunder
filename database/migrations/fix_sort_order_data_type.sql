-- Fix sort_order data type to support decimal values
-- This migration changes the sort_order column from INTEGER to DECIMAL

-- Drop the existing column if it exists as INTEGER
ALTER TABLE tasks DROP COLUMN IF EXISTS sort_order;

-- Add the sort_order column with proper DECIMAL type
ALTER TABLE tasks 
ADD COLUMN sort_order DECIMAL(10,2) DEFAULT 0;

-- Recreate index for performance on sorting
DROP INDEX IF EXISTS idx_tasks_sort_order;
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON tasks(status, sort_order);

-- Initialize sort_order for existing tasks based on created_at
-- This ensures existing tasks have a proper order
UPDATE tasks 
SET sort_order = row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at) as row_number
  FROM tasks
) AS ordered_tasks
WHERE tasks.id = ordered_tasks.id;
