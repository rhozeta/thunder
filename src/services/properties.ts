import { supabase } from '@/lib/supabase';
import { Property, PropertyInsert, PropertyUpdate, PropertyFilters, PropertyStats } from '@/types/property';

export class PropertyService {
  static async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          deal:deals(id, title, status, price),
          images:property_images(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.listing_type && filters.listing_type !== 'all') {
          query = query.eq('listing_type', filters.listing_type);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.property_type) {
          query = query.eq('property_type', filters.property_type);
        }
        
        if (filters.min_price) {
          query = query.gte('list_price', filters.min_price);
        }
        
        if (filters.max_price) {
          query = query.lte('list_price', filters.max_price);
        }
        
        if (filters.min_bedrooms) {
          query = query.gte('bedrooms', filters.min_bedrooms);
        }
        
        if (filters.max_bedrooms) {
          query = query.lte('bedrooms', filters.max_bedrooms);
        }
        
        if (filters.min_bathrooms) {
          query = query.gte('bathrooms', filters.min_bathrooms);
        }
        
        if (filters.max_bathrooms) {
          query = query.lte('bathrooms', filters.max_bathrooms);
        }
        
        if (filters.min_square_feet) {
          query = query.gte('square_feet', filters.min_square_feet);
        }
        
        if (filters.max_square_feet) {
          query = query.lte('square_feet', filters.max_square_feet);
        }
        
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }
        
        if (filters.state) {
          query = query.eq('state', filters.state);
        }
        
        if (filters.contact_id) {
          query = query.eq('contact_id', filters.contact_id);
        }
        
        if (filters.deal_id) {
          query = query.eq('deal_id', filters.deal_id);
        }
        
        if (filters.search) {
          query = query.textSearch('search_vector', filters.search);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to add primary_image
      return (data || []).map(property => {
        console.log('Property images data:', property.id, property.images);
        const primaryImage = property.images?.find((img: any) => img.is_primary) || property.images?.[0];
        if (primaryImage) {
          console.log('Primary image URL:', primaryImage.image_url);
        }
        return {
          ...property,
          primary_image: primaryImage
        };
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  static async getProperty(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          deal:deals(id, title, status, price),
          images:property_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data,
        primary_image: data.images?.find((img: any) => img.is_primary) || data.images?.[0]
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  static async createProperty(property: PropertyInsert): Promise<Property> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...property,
          user_id: user.id
        }])
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          deal:deals(id, title, status, price),
          images:property_images(*)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        primary_image: data.images?.find((img: any) => img.is_primary) || data.images?.[0]
      };
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  static async updateProperty(id: string, updates: PropertyUpdate): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          deal:deals(id, title, status, price),
          images:property_images(*)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        primary_image: data.images?.find((img: any) => img.is_primary) || data.images?.[0]
      };
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  static async deleteProperty(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  static async getPropertyStats(): Promise<PropertyStats> {
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*');

      if (error) throw error;

      const stats: PropertyStats = {
        total_properties: properties?.length || 0,
        my_listings: properties?.filter(p => p.listing_type === 'my_listing').length || 0,
        client_interests: properties?.filter(p => p.listing_type === 'client_interest').length || 0,
        active_properties: properties?.filter(p => p.status === 'active').length || 0,
        pending_properties: properties?.filter(p => p.status === 'pending').length || 0,
        sold_properties: properties?.filter(p => p.status === 'sold').length || 0,
        total_value: properties?.reduce((sum, p) => sum + (p.list_price || 0), 0) || 0,
        average_price: 0,
        properties_by_type: {},
        properties_by_city: {}
      };

      // Calculate average price
      const propertiesWithPrice = properties?.filter(p => p.list_price) || [];
      stats.average_price = propertiesWithPrice.length > 0 
        ? propertiesWithPrice.reduce((sum, p) => sum + p.list_price, 0) / propertiesWithPrice.length
        : 0;

      // Group by type
      properties?.forEach(property => {
        stats.properties_by_type[property.property_type] = 
          (stats.properties_by_type[property.property_type] || 0) + 1;
      });

      // Group by city
      properties?.forEach(property => {
        stats.properties_by_city[property.city] = 
          (stats.properties_by_city[property.city] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching property stats:', error);
      throw error;
    }
  }

  static async searchProperties(query: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          deal:deals(id, title, status, price),
          images:property_images(*)
        `)
        .textSearch('search_vector', query)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(property => ({
        ...property,
        primary_image: property.images?.find((img: any) => img.is_primary) || property.images?.[0]
      }));
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  static async getPropertiesByContact(contactId: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          deal:deals(id, title, status, price),
          images:property_images(*)
        `)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(property => ({
        ...property,
        primary_image: property.images?.find((img: any) => img.is_primary) || property.images?.[0]
      }));
    } catch (error) {
      console.error('Error fetching properties by contact:', error);
      throw error;
    }
  }

  static async getPropertiesByDeal(dealId: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          deal:deals(id, title, status, price),
          images:property_images(*)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(property => ({
        ...property,
        primary_image: property.images?.find((img: any) => img.is_primary) || property.images?.[0]
      }));
    } catch (error) {
      console.error('Error fetching properties by deal:', error);
      throw error;
    }
  }
}
