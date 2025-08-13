-- Create storage bucket for deal documents
-- This creates a Supabase storage bucket to store deal document files

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deal-documents',
  'deal-documents',
  false, -- Private bucket
  52428800, -- 50MB file size limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for deal documents
-- Users can view files for deals they have access to
CREATE POLICY "Users can view deal documents they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'deal-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM deals WHERE assigned_agent_id = auth.uid()
    )
  );

-- Users can upload files for deals they have access to
CREATE POLICY "Users can upload deal documents for their deals" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'deal-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM deals WHERE assigned_agent_id = auth.uid()
    )
  );

-- Users can update files for deals they have access to
CREATE POLICY "Users can update deal documents for their deals" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'deal-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM deals WHERE assigned_agent_id = auth.uid()
    )
  );

-- Users can delete files for deals they have access to
CREATE POLICY "Users can delete deal documents for their deals" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'deal-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM deals WHERE assigned_agent_id = auth.uid()
    )
  );
