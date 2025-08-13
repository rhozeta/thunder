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
      // Store profile image separately in localStorage to avoid header size issues
      if (profileData.profileImage) {
        localStorage.setItem(`profile_image_${userId}`, profileData.profileImage)
      }

      // Update user metadata in auth (without profile image)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          brokerage_name: profileData.brokerageName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zipCode
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
      // Resize and compress image to avoid large headers
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          // Resize to max 150x150 to keep file size small
          const maxSize = 150
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7) // 70% quality
          
          // Check if still too large (> 50KB base64)
          if (compressedBase64.length > 50000) {
            reject(new Error('Image too large even after compression. Please use a smaller image.'))
          } else {
            resolve(compressedBase64)
          }
        }
        
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = URL.createObjectURL(file)
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

  static getProfileImage(userId: string): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`profile_image_${userId}`)
    }
    return null
  }

  static removeProfileImage(userId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`profile_image_${userId}`)
    }
  }
}
