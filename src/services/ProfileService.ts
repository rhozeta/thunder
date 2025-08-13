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
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          email: profileData.email
        }
      })

      if (authError) {
        throw authError
      }

      // Update or insert into agents table with profile photo URL
      const { error: agentError } = await supabase
        .from('agents')
        .upsert({
          id: userId,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          brokerage_name: profileData.brokerageName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zipCode,
          profile_photo_url: profileData.profileImage,
          updated_at: new Date().toISOString()
        })

      if (agentError) {
        console.error('Agent table update failed:', agentError)
        throw agentError
      }

      return true
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  static async uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
      // Resize and compress image first
      const compressedFile = await this.compressImage(file)
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `profile-photos/${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('agent-profiles')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('agent-profiles')
        .getPublicUrl(filePath)

      return data.publicUrl
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
        .from('agents')
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

  static async getProfileImage(userId: string): Promise<string | null> {
    try {
      const profile = await this.getProfile(userId)
      return profile?.profile_photo_url || null
    } catch (error) {
      console.error('Get profile image error:', error)
      return null
    }
  }
}
