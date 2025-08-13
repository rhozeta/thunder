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
  email: string
}

export class ProfileService {
  static async updateProfile(userId: string, profileData: ProfileData) {
    try {
      // Store profile image in localStorage for now (until storage bucket is created)
      if (profileData.profileImage) {
        localStorage.setItem(`profile_image_${userId}`, profileData.profileImage)
      }

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
          zip_code: profileData.zipCode
        }
      })

      if (authError) {
        throw authError
      }

      // Try to update profiles table if it exists (fallback)
      try {
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
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.warn('Profiles table update failed (table may not exist):', profileError)
        }
      } catch (error) {
        console.warn('Profiles table not available:', error)
      }

      return true
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  static async uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
      // Resize and compress image to base64 for now (until storage bucket is created)
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          // Resize to max 200x200 for reasonable quality and size
          const maxSize = 200
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8) // 80% quality
          
          // Check if still reasonable size (< 100KB base64)
          if (compressedBase64.length > 100000) {
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

  private static async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Resize to max 300x300 for better quality while keeping size reasonable
        const maxSize = 300
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
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        }, 'image/jpeg', 0.8) // 80% quality
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
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
}
