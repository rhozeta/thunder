-- Storage policies for agent-profiles bucket
-- These policies allow authenticated users to upload their own profile photos

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('agent-profiles', 'agent-profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow users to upload own profile photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND bucket_id = 'agent-profiles'
    AND (storage.foldername(name))[1] = 'profile-photos'
  );

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Allow users to update own profile photos" ON storage.objects
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' 
    AND bucket_id = 'agent-profiles'
    AND owner = auth.uid()
  )
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND bucket_id = 'agent-profiles'
    AND owner = auth.uid()
  );

-- Policy: Allow users to delete their own files
CREATE POLICY "Allow users to delete own profile photos" ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated' 
    AND bucket_id = 'agent-profiles'
    AND owner = auth.uid()
  );

-- Policy: Allow public read access to profile photos
CREATE POLICY "Allow public read access to profile photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'agent-profiles');
