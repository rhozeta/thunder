-- Create appointment types table migration
-- Run this in your Supabase SQL Editor

-- Create appointment_types table for custom appointment types
CREATE TABLE IF NOT EXISTS appointment_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    is_default BOOLEAN DEFAULT FALSE,
    user_id UUID, -- NULL for default types, user_id for custom types
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, user_id) -- Prevent duplicate names per user
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointment_types_user_id ON appointment_types(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_types_is_default ON appointment_types(is_default);

-- Enable Row Level Security
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view default and own appointment types" ON appointment_types
    FOR SELECT USING (is_default = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can create own appointment types" ON appointment_types
    FOR INSERT WITH CHECK (user_id = auth.uid() AND is_default = FALSE);

CREATE POLICY "Users can update own appointment types" ON appointment_types
    FOR UPDATE USING (user_id = auth.uid() AND is_default = FALSE);

CREATE POLICY "Users can delete own appointment types" ON appointment_types
    FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- Create demo user policies (for testing)
CREATE POLICY "Demo user view appointment types" ON appointment_types
    FOR SELECT USING (is_default = TRUE OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo user create appointment types" ON appointment_types
    FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000' AND is_default = FALSE);

CREATE POLICY "Demo user update appointment types" ON appointment_types
    FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000000' AND is_default = FALSE);

CREATE POLICY "Demo user delete appointment types" ON appointment_types
    FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000000' AND is_default = FALSE);

-- Insert default appointment types for real estate agents
INSERT INTO appointment_types (name, color, is_default) VALUES
('Property Showing', '#10B981', TRUE),
('Listing Appointment', '#3B82F6', TRUE),
('Buyer Consultation', '#8B5CF6', TRUE),
('Seller Consultation', '#F59E0B', TRUE),
('Home Inspection', '#EF4444', TRUE),
('Appraisal Meeting', '#06B6D4', TRUE),
('Closing Meeting', '#84CC16', TRUE),
('Open House', '#F97316', TRUE),
('Market Analysis Meeting', '#6366F1', TRUE),
('Contract Review', '#EC4899', TRUE),
('Photography Session', '#14B8A6', TRUE),
('Client Follow-up', '#A855F7', TRUE),
('Networking Event', '#22C55E', TRUE),
('Training/Education', '#3B82F6', TRUE),
('Administrative Meeting', '#6B7280', TRUE);

-- Create updated_at trigger
CREATE TRIGGER update_appointment_types_updated_at 
    BEFORE UPDATE ON appointment_types
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
