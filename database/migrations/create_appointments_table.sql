-- Create appointments table migration
-- Run this in your Supabase SQL Editor

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    appointment_type VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    assigned_user_id UUID NOT NULL,
    notes TEXT,
    reminder_minutes INTEGER DEFAULT 15,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern TEXT, -- 'daily', 'weekly', 'monthly', etc.
    recurring_end_date DATE,
    google_calendar_event_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_user ON appointments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_deal_id ON appointments(deal_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_datetime ON appointments(start_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (assigned_user_id = auth.uid());

CREATE POLICY "Users can create own appointments" ON appointments
    FOR INSERT WITH CHECK (assigned_user_id = auth.uid());

CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (assigned_user_id = auth.uid());

CREATE POLICY "Users can delete own appointments" ON appointments
    FOR DELETE USING (assigned_user_id = auth.uid());

-- Create demo user policies (for testing)
CREATE POLICY "Demo user view appointments" ON appointments
    FOR SELECT USING (assigned_user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo user create appointments" ON appointments
    FOR INSERT WITH CHECK (assigned_user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo user update appointments" ON appointments
    FOR UPDATE USING (assigned_user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Demo user delete appointments" ON appointments
    FOR DELETE USING (assigned_user_id = '00000000-0000-0000-0000-000000000000');

-- Create updated_at trigger
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
