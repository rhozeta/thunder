-- Quick Database Setup for Thunder CRM
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts table (minimal version for testing)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    budget_min INTEGER,
    budget_max INTEGER,
    timeline TEXT,
    contact_type TEXT CHECK (contact_type IN ('buyer', 'seller', 'investor', 'past_client', 'lead')),
    lead_source TEXT,
    lead_score INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('new', 'qualified', 'nurturing', 'lost', 'converted')) DEFAULT 'new',
    assigned_agent_id UUID,
    notes TEXT
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can create own contacts" ON contacts
    FOR INSERT WITH CHECK (assigned_agent_id = auth.uid());

CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can delete own contacts" ON contacts
    FOR DELETE USING (assigned_agent_id = auth.uid());

-- Add some test data
INSERT INTO contacts (first_name, last_name, email, phone, contact_type, status, assigned_agent_id, budget_min, budget_max) VALUES
('John', 'Doe', 'john.doe@email.com', '555-0123', 'buyer', 'new', '00000000-0000-0000-0000-000000000000', 300000, 500000),
('Jane', 'Smith', 'jane.smith@email.com', '555-0124', 'seller', 'qualified', '00000000-0000-0000-0000-000000000000', 0, 400000),
('Bob', 'Johnson', 'bob.johnson@email.com', '555-0125', 'investor', 'nurturing', '00000000-0000-0000-0000-000000000000', 200000, 800000);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
