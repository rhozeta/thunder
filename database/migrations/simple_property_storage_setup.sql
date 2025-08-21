-- Simple storage setup for property images that should work immediately
-- This approach uses minimal RLS restrictions for faster setup

-- Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images', 
  'property-images', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for property images
-- Allow all authenticated users to view property images
CREATE POLICY "Allow authenticated users to view property images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images' AND
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Allow public access to all images in property-images bucket
CREATE POLICY "Allow public access to property images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images'
);

-- Allow all authenticated users to upload property images
CREATE POLICY "Allow authenticated users to upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

-- Allow all authenticated users to update property images
CREATE POLICY "Allow authenticated users to update property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

-- Allow all authenticated users to delete property images
CREATE POLICY "Allow authenticated users to delete property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

-- Note: This is a permissive setup for development/testing
-- In production, you might want to restrict access further based on 
-- property ownership or user relationships
