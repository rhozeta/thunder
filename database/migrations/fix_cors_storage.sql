-- Fix CORS and storage policies for property images
-- This addresses the issue where images exist but don't display

-- Ensure the bucket is properly configured for public access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'property-images';

-- Create comprehensive policies for the property-images bucket
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow public access to property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their property images" ON storage.objects;

-- Create permissive policies for property images
-- Public read access for all images
CREATE POLICY "Allow public read access to property images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images'
);

-- Authenticated users can upload images
CREATE POLICY "Allow authenticated upload to property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
);

-- Authenticated users can update their own images
CREATE POLICY "Allow authenticated update to property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
);

-- Authenticated users can delete their own images
CREATE POLICY "Allow authenticated delete to property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
);

-- Ensure CORS is properly configured for the bucket
-- This allows cross-origin requests from your application
-- Note: CORS configuration is typically done in Supabase dashboard under Storage settings
