/*
  Storage Configuration for Arabic Election Campaign System
  
  This file sets up Supabase Storage buckets and policies for file management.
  Run this after setting up the main database schema.
  
  Buckets:
  1. documents - ID cards, official documents
  2. media - Photos, videos from reports
  3. reports - Report attachments
  4. avatars - User profile pictures
  5. backups - System backup files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('media', 'media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']),
  ('reports', 'reports', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'text/plain']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('backups', 'backups', false, 1073741824, ARRAY['application/json', 'application/zip', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Documents bucket policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (SELECT role FROM users WHERE auth_user_id = auth.uid()) IN ('voter', 'monitor', 'admin', 'super_admin')
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (SELECT role FROM users WHERE auth_user_id = auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Media bucket policies
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND
  (SELECT role FROM users WHERE auth_user_id = auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Reports bucket policies
CREATE POLICY "Monitors and admins can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  (SELECT role FROM users WHERE auth_user_id = auth.uid()) IN ('monitor', 'admin', 'super_admin')
);

CREATE POLICY "Monitors can view their own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    (SELECT role FROM users WHERE auth_user_id = auth.uid()) IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Monitors can update their own reports"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Monitors can delete their own reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    (SELECT role FROM users WHERE auth_user_id = auth.uid()) IN ('admin', 'super_admin')
  )
);

-- Avatars bucket policies (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Backups bucket policies
CREATE POLICY "Super admins can manage backups"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'backups' AND
  (SELECT role FROM users WHERE auth_user_id = auth.uid()) = 'super_admin'
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage helper functions
CREATE OR REPLACE FUNCTION get_file_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN concat(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/',
    bucket_name,
    '/',
    file_path
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_file_upload(
  bucket_name TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  bucket_config RECORD;
BEGIN
  -- Get bucket configuration
  SELECT * INTO bucket_config
  FROM storage.buckets
  WHERE id = bucket_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bucket % not found', bucket_name;
  END IF;
  
  -- Check file size
  IF file_size > bucket_config.file_size_limit THEN
    RAISE EXCEPTION 'File size % exceeds limit %', file_size, bucket_config.file_size_limit;
  END IF;
  
  -- Check MIME type
  IF bucket_config.allowed_mime_types IS NOT NULL AND 
     NOT (mime_type = ANY(bucket_config.allowed_mime_types)) THEN
    RAISE EXCEPTION 'MIME type % not allowed for bucket %', mime_type, bucket_name;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create cleanup function for old files
CREATE OR REPLACE FUNCTION cleanup_old_files(
  bucket_name TEXT,
  days_old INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Only super admins can run cleanup
  IF (SELECT role FROM users WHERE auth_user_id = auth.uid()) != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can run file cleanup';
  END IF;
  
  -- Delete old files
  FOR file_record IN
    SELECT name FROM storage.objects
    WHERE bucket_id = bucket_name
    AND created_at < NOW() - INTERVAL '1 day' * days_old
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = bucket_name AND name = file_record.name;
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

SELECT 'Storage configuration completed successfully!' as status;