-- Create deal_documents table for file attachments
-- This table stores metadata about documents attached to deals

-- Create the deal_documents table
CREATE TABLE IF NOT EXISTS deal_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_documents_uploaded_by ON deal_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_deal_documents_created_at ON deal_documents(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view documents for deals they have access to
CREATE POLICY "Users can view deal documents they have access to" ON deal_documents
    FOR SELECT USING (
        deal_id IN (
            SELECT id FROM deals WHERE assigned_agent_id = auth.uid()
        )
    );

-- Users can insert documents for deals they have access to
CREATE POLICY "Users can insert deal documents for their deals" ON deal_documents
    FOR INSERT WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE assigned_agent_id = auth.uid()
        )
    );

-- Users can update documents for deals they have access to
CREATE POLICY "Users can update deal documents for their deals" ON deal_documents
    FOR UPDATE USING (
        deal_id IN (
            SELECT id FROM deals WHERE assigned_agent_id = auth.uid()
        )
    );

-- Users can delete documents for deals they have access to
CREATE POLICY "Users can delete deal documents for their deals" ON deal_documents
    FOR DELETE USING (
        deal_id IN (
            SELECT id FROM deals WHERE assigned_agent_id = auth.uid()
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deal_documents_updated_at 
    BEFORE UPDATE ON deal_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
