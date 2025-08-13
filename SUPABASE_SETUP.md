# Supabase Setup Guide for Thunder CRM

## Initial Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Schema**

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts table
CREATE TABLE contacts (
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
    property_preferences JSONB,
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

-- Communications table
CREATE TABLE communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('email', 'sms', 'call')),
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    content TEXT NOT NULL,
    metadata JSONB,
    user_id UUID NOT NULL
);

-- Deals table
CREATE TABLE deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    deal_type TEXT CHECK (deal_type IN ('buyer', 'seller')),
    value INTEGER,
    commission INTEGER,
    stage TEXT CHECK (stage IN ('prospect', 'qualified', 'showing', 'offer', 'under_contract', 'closed_won', 'closed_lost')) DEFAULT 'prospect',
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_agent_id UUID NOT NULL,
    notes TEXT
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    assigned_user_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_assigned_agent ON contacts(assigned_agent_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX idx_contacts_lead_source ON contacts(lead_source);
CREATE INDEX idx_communications_contact_id ON communications(contact_id);
CREATE INDEX idx_communications_user_id ON communications(user_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_assigned_agent ON deals(assigned_agent_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_tasks_assigned_user ON tasks(assigned_user_id);
CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);

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

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can create own contacts" ON contacts
    FOR INSERT WITH CHECK (assigned_agent_id = auth.uid());

CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can delete own contacts" ON contacts
    FOR DELETE USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can view own communications" ON communications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own communications" ON communications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own deals" ON deals
    FOR SELECT USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can create own deals" ON deals
    FOR INSERT WITH CHECK (assigned_agent_id = auth.uid());

CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (assigned_agent_id = auth.uid());

CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (assigned_user_id = auth.uid());

CREATE POLICY "Users can create own tasks" ON tasks
    FOR INSERT WITH CHECK (assigned_user_id = auth.uid());

CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (assigned_user_id = auth.uid());

CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (assigned_user_id = auth.uid());
```

4. **Authentication Setup**
   - Go to Authentication > Providers in Supabase dashboard
   - Enable email/password authentication
   - Configure any additional providers you want (Google, Facebook, etc.)

5. **Test the Setup**
   - Start the development server: `npm run dev`
   - Navigate to `/contacts` to test contact management

## Next Steps

1. **Add Sample Data**: Create a few test contacts to verify everything works
2. **Set up Authentication**: Implement user registration/login
3. **Add Communication Features**: Start building the communication hub
4. **Implement Pipeline Management**: Add deal tracking functionality

## Mobile Considerations

For React Native Web compatibility:
- All components use responsive design
- Touch-friendly interactions
- Offline capability will be added with service workers
- Consider using React Native for Web components when building mobile app
