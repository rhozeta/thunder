-- Add assigned_user_id to tasks table
-- This migration adds user assignment functionality to tasks

-- Add the assigned_user_id column to tasks table
ALTER TABLE tasks 
ADD COLUMN assigned_user_id UUID;

-- Add foreign key constraint (commented out as we don't have a users table reference)
-- ALTER TABLE tasks 
-- ADD CONSTRAINT fk_tasks_assigned_user 
-- FOREIGN KEY (assigned_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user_id ON tasks(assigned_user_id);

-- Update existing tasks to have the demo agent assigned (if any exist)
-- This ensures existing tasks are visible to the demo user
UPDATE tasks 
SET assigned_user_id = '47f09df2-ada1-44f0-814a-ee1a361d7417'
WHERE assigned_user_id IS NULL;

-- Update RLS policies for tasks
DROP POLICY IF EXISTS "Demo user view tasks" ON tasks;
DROP POLICY IF EXISTS "Demo user create tasks" ON tasks;

-- Create new RLS policies based on assigned_user_id
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (assigned_user_id = auth.uid());

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (assigned_user_id = auth.uid());

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (assigned_user_id = auth.uid());

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (assigned_user_id = auth.uid());

-- Demo user policy for development
CREATE POLICY "Demo user can manage tasks" ON tasks
  FOR ALL USING (assigned_user_id = '47f09df2-ada1-44f0-814a-ee1a361d7417');
