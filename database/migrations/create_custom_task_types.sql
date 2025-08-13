-- Create custom_task_types table
CREATE TABLE IF NOT EXISTS custom_task_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique task type names per user
    UNIQUE(name, user_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE custom_task_types ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own custom task types
CREATE POLICY "Users can view own custom task types" ON custom_task_types
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own custom task types
CREATE POLICY "Users can insert own custom task types" ON custom_task_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own custom task types
CREATE POLICY "Users can update own custom task types" ON custom_task_types
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own custom task types
CREATE POLICY "Users can delete own custom task types" ON custom_task_types
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_custom_task_types_user_id ON custom_task_types(user_id);
CREATE INDEX idx_custom_task_types_name ON custom_task_types(name);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_task_types_updated_at 
    BEFORE UPDATE ON custom_task_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Also need to add the type column to the existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS type VARCHAR(255);

-- Create index on tasks.type for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
