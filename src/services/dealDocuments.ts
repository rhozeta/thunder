import { supabase } from '@/lib/supabase'
import { DealDocument, DealDocumentInsert, DealDocumentUpdate } from '@/types/dealDocument'

export class DealDocumentService {
  static async getDocumentsByDealId(dealId: string): Promise<DealDocument[]> {
    try {
      const { data, error } = await supabase
        .from('deal_documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching deal documents:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getDocumentsByDealId:', error)
      throw error
    }
  }

  static async createDocument(document: DealDocumentInsert): Promise<DealDocument> {
    try {
      const { data, error } = await supabase
        .from('deal_documents')
        .insert(document)
        .select()
        .single()

      if (error) {
        console.error('Error creating deal document:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createDocument:', error)
      throw error
    }
  }

  static async updateDocument(id: string, updates: DealDocumentUpdate): Promise<DealDocument> {
    try {
      const { data, error } = await supabase
        .from('deal_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating deal document:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateDocument:', error)
      throw error
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('deal_documents')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting deal document:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteDocument:', error)
      throw error
    }
  }

  static async uploadFile(file: File, dealId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${dealId}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading file:', error)
        throw error
      }

      return data.path
    } catch (error) {
      console.error('Error in uploadFile:', error)
      throw error
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('deal-documents')
        .remove([filePath])

      if (error) {
        console.error('Error deleting file:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteFile:', error)
      throw error
    }
  }

  static async getFileUrl(filePath: string): Promise<string> {
    try {
      const { data } = await supabase.storage
        .from('deal-documents')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error getting file URL:', error)
      throw error
    }
  }

  static async downloadFile(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .download(filePath)

      if (error) {
        console.error('Error downloading file:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in downloadFile:', error)
      throw error
    }
  }
}
