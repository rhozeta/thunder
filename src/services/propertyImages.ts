import { supabase } from '@/lib/supabase';
import { PropertyImage, PropertyImageInsert, PropertyImageUpdate } from '@/types/property';

export class PropertyImageService {
  static async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching property images:', error);
      throw error;
    }
  }

  static async uploadPropertyImage(
    propertyId: string, 
    file: File, 
    imageData: Omit<PropertyImageInsert, 'property_id' | 'image_url'>
  ): Promise<PropertyImage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);
      
      console.log('Generated public URL for image:', publicUrl);

      console.log('Generated public URL:', publicUrl);
      console.log('Upload data:', uploadData);

      // Save image record to database
      const { data, error } = await supabase
        .from('property_images')
        .insert([{
          property_id: propertyId,
          user_id: user.id,
          image_url: publicUrl,
          image_name: file.name,
          file_size: file.size,
          ...imageData
        }])
        .select()
        .single();

      console.log('Saved image record:', data);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading property image:', error);
      throw error;
    }
  }

  static async updatePropertyImage(id: string, updates: PropertyImageUpdate): Promise<PropertyImage> {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating property image:', error);
      throw error;
    }
  }

  static async deletePropertyImage(id: string): Promise<void> {
    try {
      // Get image data to delete from storage
      const { data: image, error: fetchError } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      if (image?.image_url) {
        const urlParts = image.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const propertyId = urlParts[urlParts.length - 2];
        const filePath = `${propertyId}/${fileName}`;

        // Delete from storage
        await supabase.storage
          .from('property-images')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting property image:', error);
      throw error;
    }
  }

  static async setPrimaryImage(propertyId: string, imageId: string): Promise<void> {
    try {
      // First, unset all primary images for this property
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId);

      // Set the selected image as primary
      const { error } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }
  }

  static async reorderImages(propertyId: string, imageIds: string[]): Promise<void> {
    try {
      // Update sort_order for each image
      const updates = imageIds.map((imageId, index) => 
        supabase
          .from('property_images')
          .update({ sort_order: index })
          .eq('id', imageId)
          .eq('property_id', propertyId)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering images:', error);
      throw error;
    }
  }

  static async bulkUploadImages(
    propertyId: string,
    files: File[],
    imageType?: string
  ): Promise<PropertyImage[]> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadPropertyImage(propertyId, file, {
          image_type: imageType as any,
          sort_order: index,
          is_primary: index === 0 // First image is primary by default
        })
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error bulk uploading images:', error);
      throw error;
    }
  }
}
