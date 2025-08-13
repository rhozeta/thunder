-- Create missing tables for CRM functionality
-- Run this SQL in Supabase SQL Editor

-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'phone', 'text', 'meeting', 'note')),
    subject VARCHAR(255),
    content TEXT,
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deal_type VARCHAR(50) CHECK (deal_type IN ('buying', 'selling', 'renting', 'investment')),
    property_address VARCHAR(500),
    price DECIMAL(15,2),
    commission DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'prospect' CHECK (status IN ('prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communications_contact_id ON communications(contact_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Add RLS policies for new tables
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for demo user
CREATE POLICY "Demo user view communications" ON communications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = communications.contact_id 
        AND contacts.assigned_agent_id = '00000000-0000-0000-0000-000000000000'
    ));

CREATE POLICY "Demo user create communications" ON communications
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = communications.contact_id 
        AND contacts.assigned_agent_id = '00000000-0000-0000-0000-000000000000'
    ));

CREATE POLICY "Demo user view deals" ON deals
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = deals.contact_id 
        AND contacts.assigned_agent_id = '00000000-0000-0000-0000-000000000000'
    ));

CREATE POLICY "Demo user create deals" ON deals
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = deals.contact_id 
        AND contacts.assigned_agent_id = '00000000-0000-0000-0000-000000000000'
    ));

CREATE POLICY "Demo user view tasks" ON tasks
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = tasks.contact_id 
        AND contacts.assigned_agent_id = '00000000-0000-0000-0000-000000000000'
    ));

CREATE POLICY "Demo user create tasks" ON tasks
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM contacts 
        WHERE contacts.id = tasks.contact_id 
        AND contacts.assigned_agent_id = '00000000-0000-0000-0000-000000000000'
    ));
