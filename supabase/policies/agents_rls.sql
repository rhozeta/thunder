-- RLS Policies for agents table
-- These policies allow authenticated users to manage their own agent profile

-- Enable RLS on agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all agents (for team collaboration)
CREATE POLICY "Allow authenticated users to view agents" ON agents
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow users to insert their own agent profile
CREATE POLICY "Allow users to insert own agent profile" ON agents
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their own agent profile
CREATE POLICY "Allow users to update own agent profile" ON agents
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow users to delete their own agent profile
CREATE POLICY "Allow users to delete own agent profile" ON agents
  FOR DELETE
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_id ON agents(id);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
