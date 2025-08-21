import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/types/property';

export class PropertyTypeService {
  static async getPropertyTypes(): Promise<PropertyType[]> {
    try {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching property types:', error);
      throw error;
    }
  }

  static async getPropertyTypesByCategory(category: 'residential' | 'commercial' | 'land'): Promise<PropertyType[]> {
    try {
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .eq('category', category)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching property types by category:', error);
      throw error;
    }
  }
}
