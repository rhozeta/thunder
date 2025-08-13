-- Migration: Add missing columns to existing agents table
-- Run this if the agents table already exists but is missing columns

-- Add missing columns
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS brokerage_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure email is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_email_unique ON agents(email);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_id ON agents(id);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);

-- Create trigger to automatically update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_agents_updated_at'
  ) THEN
    CREATE TRIGGER update_agents_updated_at 
      BEFORE UPDATE ON agents 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
