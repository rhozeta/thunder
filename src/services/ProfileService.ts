import { supabase } from '@/lib/supabase'

export interface ProfileData {
  firstName: string
  lastName: string
  phone: string
  brokerageName: string
  address: string
  city: string
  state: string
  zipCode: string
  profileImage?: string
}

export class ProfileService {
  static async updateProfile(userId: string, profileData: ProfileData) {
    try {
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          brokerage_name: profileData.brokerageName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zipCode,
          profile_image: profileData.profileImage
        }
      })

      if (authError) {
        throw authError
      }

      // Also store in profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          brokerage_name: profileData.brokerageName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zipCode,
          profile_image: profileData.profileImage,
          updated_at: new Date().toISOString()
        })

      // Don't throw error if profiles table doesn't exist
      if (profileError && !profileError.message.includes('relation "profiles" does not exist')) {
        console.warn('Profile table update failed:', profileError)
      }

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  static async uploadProfileImage(file: File): Promise<string> {
    try {
      // Convert file to base64 as fallback since storage bucket doesn't exist
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64String = event.target?.result as string
          resolve(base64String)
        }
        reader.onerror = (error) => {
          reject(error)
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  static async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && !error.message.includes('No rows')) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }
}
