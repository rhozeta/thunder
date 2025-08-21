export interface Property {
  id: string;
  user_id: string;
  
  // Basic information
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  
  // Property details
  property_type: string;
  listing_type: 'my_listing' | 'client_interest';
  status: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired';
  
  // Specifications
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size_sqft?: number;
  year_built?: number;
  garage_spaces?: number;
  
  // Financial
  list_price?: number;
  sale_price?: number;
  estimated_value?: number;
  hoa_fees?: number;
  property_taxes?: number;
  
  // Additional details
  mls_number?: string;
  features?: string[];
  amenities?: string[];
  notes?: string;
  
  // Relationships
  contact_id?: string;
  deal_id?: string;
  assigned_agent_id?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Joined data
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  deal?: {
    id: string;
    title: string;
    status: string;
    price?: number;
  };
  images?: PropertyImage[];
  primary_image?: PropertyImage;
}

export interface PropertyInsert {
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  property_type: string;
  listing_type: 'my_listing' | 'client_interest';
  status?: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired';
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size_sqft?: number;
  year_built?: number;
  garage_spaces?: number;
  list_price?: number;
  sale_price?: number;
  estimated_value?: number;
  hoa_fees?: number;
  property_taxes?: number;
  mls_number?: string;
  features?: string[];
  amenities?: string[];
  notes?: string;
  contact_id?: string;
  deal_id?: string;
  assigned_agent_id?: string;
}

export interface PropertyUpdate {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  property_type?: string;
  listing_type?: 'my_listing' | 'client_interest';
  status?: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired';
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size_sqft?: number;
  year_built?: number;
  garage_spaces?: number;
  list_price?: number;
  sale_price?: number;
  estimated_value?: number;
  hoa_fees?: number;
  property_taxes?: number;
  mls_number?: string;
  features?: string[];
  amenities?: string[];
  notes?: string;
  contact_id?: string;
  deal_id?: string;
  assigned_agent_id?: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  user_id: string;
  image_url: string;
  image_name?: string;
  image_type?: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'other';
  caption?: string;
  alt_text?: string;
  file_size?: number;
  width?: number;
  height?: number;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyImageInsert {
  property_id: string;
  image_url: string;
  image_name?: string;
  image_type?: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'other';
  caption?: string;
  alt_text?: string;
  file_size?: number;
  width?: number;
  height?: number;
  is_primary?: boolean;
  sort_order?: number;
}

export interface PropertyImageUpdate {
  image_name?: string;
  image_type?: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'other';
  caption?: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface PropertyType {
  id: string;
  name: string;
  category: 'residential' | 'commercial' | 'land';
  description?: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export interface PropertyFilters {
  listing_type?: 'my_listing' | 'client_interest' | 'all';
  status?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_square_feet?: number;
  max_square_feet?: number;
  city?: string;
  state?: string;
  contact_id?: string;
  deal_id?: string;
  search?: string;
}

export interface PropertyStats {
  total_properties: number;
  my_listings: number;
  client_interests: number;
  active_properties: number;
  pending_properties: number;
  sold_properties: number;
  total_value: number;
  average_price: number;
  properties_by_type: { [key: string]: number };
  properties_by_city: { [key: string]: number };
}

// Common property features and amenities
export const PROPERTY_FEATURES = [
  'Pool', 'Spa/Hot Tub', 'Fireplace', 'Hardwood Floors', 'Tile Floors',
  'Carpet', 'Granite Counters', 'Stainless Steel Appliances', 'Walk-in Closet',
  'Master Suite', 'Vaulted Ceilings', 'Bay Windows', 'Skylights', 'Balcony',
  'Patio', 'Deck', 'Fenced Yard', 'Landscaping', 'Sprinkler System',
  'Security System', 'Central Air', 'Forced Air Heat', 'Radiant Heat'
];

export const PROPERTY_AMENITIES = [
  'Gym/Fitness Center', 'Tennis Court', 'Basketball Court', 'Playground',
  'Clubhouse', 'Business Center', 'Concierge', 'Doorman', 'Elevator',
  'Laundry Facilities', 'Storage', 'Parking Garage', 'Guest Parking',
  'Pet Friendly', 'Dog Park', 'Bike Storage', 'Rooftop Deck', 'Garden',
  'BBQ Area', 'Fire Pit', 'Pool Table', 'Library', 'Conference Room'
];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];
