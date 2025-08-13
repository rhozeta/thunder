-- Add sort_order to tasks table for kanban column ordering
-- This migration adds the ability to reorder tasks within columns

-- Add the sort_order column to tasks table
ALTER TABLE tasks 
ADD COLUMN sort_order DECIMAL(10,2) DEFAULT 0;

-- Create index for performance on sorting
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
