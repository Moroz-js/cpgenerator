-- Storage policies for proposal-media bucket
-- This migration adds RLS policies for the proposal-media storage bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload to proposal-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update proposal-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from proposal-media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to proposal-media" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to proposal-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proposal-media');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update proposal-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'proposal-media');

-- Allow authenticated users to delete their files
CREATE POLICY "Authenticated users can delete from proposal-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'proposal-media');

-- Allow public read access (since bucket is public)
CREATE POLICY "Public read access to proposal-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proposal-media');
