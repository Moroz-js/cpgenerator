-- Create storage bucket for case images
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-images', 'case-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for case-images bucket

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload case images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'case-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM cases
    WHERE created_by = auth.uid()
  )
);

-- Allow authenticated users to view images in their workspace cases
CREATE POLICY "Users can view case images in their workspaces"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'case-images'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text FROM cases c
    JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
    WHERE wm.user_id = auth.uid()
  )
);

-- Allow public access to case images (for public proposals)
CREATE POLICY "Public can view case images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'case-images');

-- Allow users to delete their own case images
CREATE POLICY "Users can delete their own case images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'case-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM cases
    WHERE created_by = auth.uid()
  )
);
