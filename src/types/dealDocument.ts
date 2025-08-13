export interface DealDocument {
  id: string
  deal_id: string
  name: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export interface DealDocumentInsert {
  deal_id: string
  name: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  uploaded_by?: string
}

export interface DealDocumentUpdate {
  name?: string
  file_name?: string
  file_path?: string
  file_size?: number
  mime_type?: string
}
