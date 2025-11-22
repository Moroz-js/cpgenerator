-- Create storage buckets for file uploads

-- Case images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-images', 'case-images', true);

-- Proposal attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal-attachments', 'proposal-attachments', false);

-- Preview attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('preview-attachments', 'preview-attachments', false);

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policies for case-images bucket
CREATE POLICY "Users can view case images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-images');

CREATE POLICY "Authenticated users can upload case images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their workspace case images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'case-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their workspace case images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-images'
    AND auth.role() = 'authenticated'
  );

-- Storage policies for proposal-attachments bucket
CREATE POLICY "Users can view proposal attachments from their workspaces"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'proposal-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload proposal attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'proposal-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update proposal attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'proposal-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete proposal attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'proposal-attachments'
    AND auth.role() = 'authenticated'
  );

-- Storage policies for preview-attachments bucket
CREATE POLICY "Users can view preview attachments from their workspaces"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'preview-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload preview attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'preview-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update preview attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'preview-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete preview attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'preview-attachments'
    AND auth.role() = 'authenticated'
  );

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );
