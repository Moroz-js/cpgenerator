-- Create proposal-media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal-media', 'proposal-media', true)
ON CONFLICT (id) DO NOTHING;

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