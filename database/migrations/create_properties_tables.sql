-- Properties table for managing real estate properties
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic property information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Property details
    property_type VARCHAR(50) NOT NULL, -- 'single_family', 'condo', 'townhouse', 'multi_family', 'commercial', 'land'
    listing_type VARCHAR(50) NOT NULL, -- 'my_listing', 'client_interest'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'pending', 'sold', 'withdrawn', 'expired'
    
    -- Property specifications
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
    lot_size_sqft INTEGER,
    year_built INTEGER,
    garage_spaces INTEGER,
    
    -- Financial information
    list_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    estimated_value DECIMAL(12,2),
    hoa_fees DECIMAL(8,2),
    property_taxes DECIMAL(10,2),
    
    -- Additional details
    mls_number VARCHAR(50),
    features TEXT[], -- Array of features like 'pool', 'fireplace', 'hardwood_floors'
    amenities TEXT[], -- Array of amenities
    notes TEXT,
    
    -- Relationships
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            coalesce(title, '') || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(address, '') || ' ' ||
            coalesce(city, '') || ' ' ||
            coalesce(state, '') || ' ' ||
            coalesce(mls_number, '')
        )
    ) STORED
);

-- Property images table for photo galleries
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Image information
    image_url TEXT NOT NULL,
    image_name VARCHAR(255),
    image_type VARCHAR(50), -- 'exterior', 'interior', 'kitchen', 'bathroom', 'bedroom', 'other'
    caption TEXT,
    alt_text TEXT,
    
    -- Image metadata
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property types lookup table
CREATE TABLE IF NOT EXISTS property_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'residential', 'commercial', 'land'
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default property types
INSERT INTO property_types (name, category, description, is_default, sort_order) VALUES
('Single Family Home', 'residential', 'Detached single-family residence', true, 1),
('Condominium', 'residential', 'Individually owned unit in a multi-unit building', true, 2),
('Townhouse', 'residential', 'Multi-story home sharing walls with adjacent units', true, 3),
('Multi-Family', 'residential', 'Property with multiple separate housing units', true, 4),
('Duplex', 'residential', 'Building divided into two separate living units', true, 5),
('Apartment Building', 'residential', 'Multi-unit residential building', true, 6),
('Mobile Home', 'residential', 'Manufactured home designed to be movable', true, 7),
('Office Building', 'commercial', 'Building designed for office use', true, 8),
('Retail Space', 'commercial', 'Property designed for retail businesses', true, 9),
('Warehouse', 'commercial', 'Large building for storage or manufacturing', true, 10),
('Restaurant', 'commercial', 'Property designed for food service business', true, 11),
('Vacant Land', 'land', 'Undeveloped land parcel', true, 12),
('Farm/Ranch', 'land', 'Agricultural or ranch property', true, 13)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_contact_id ON properties(contact_id);
CREATE INDEX IF NOT EXISTS idx_properties_deal_id ON properties(deal_id);
CREATE INDEX IF NOT EXISTS idx_properties_search_vector ON properties USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_list_price ON properties(list_price);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_user_id ON property_images(user_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_property_images_sort_order ON property_images(sort_order);

-- Row Level Security (RLS) policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Users can view their own properties" ON properties
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties" ON properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" ON properties
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" ON properties
    FOR DELETE USING (auth.uid() = user_id);

-- Property images policies
CREATE POLICY "Users can view images for their properties" ON property_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert images for their properties" ON property_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update images for their properties" ON property_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete images for their properties" ON property_images
    FOR DELETE USING (auth.uid() = user_id);

-- Property types policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view property types" ON property_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_images_updated_at 
    BEFORE UPDATE ON property_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
