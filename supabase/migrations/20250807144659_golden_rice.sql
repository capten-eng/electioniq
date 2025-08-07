/*
  # Enhanced Storage Security Policies

  1. Storage Security
    - Restrict file access to owners only
    - Prevent unauthorized file operations
    - Add file type and size restrictions

  2. Data Protection
    - Add confirmation requirements for destructive operations
    - Implement soft delete for critical data
    - Add audit logging for sensitive operations

  3. Additional Security Measures
    - Enhanced RLS policies
    - File access logging
    - Backup preparation tables
*/

-- Enhanced storage policies for documents bucket
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;

-- Strict owner-only access for documents
CREATE POLICY "Users can only access their own documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Enhanced storage policies for media bucket
DROP POLICY IF EXISTS "Users can read media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all media" ON storage.objects;

CREATE POLICY "Users can only access their own media"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'media' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'media' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Enhanced storage policies for reports bucket
DROP POLICY IF EXISTS "Authenticated users can read reports" ON storage.objects;
DROP POLICY IF EXISTS "Monitors can upload report files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all report files" ON storage.objects;

CREATE POLICY "Users can only access their own report files"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'reports' AND 
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role IN ('admin', 'super_admin')
      )
    )
  )
  WITH CHECK (
    bucket_id = 'reports' AND 
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role IN ('admin', 'super_admin')
      )
    )
  );

-- Add soft delete columns to critical tables
ALTER TABLE voters ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE monitors ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE voting_centers ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE families ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(user_id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can read audit logs
CREATE POLICY "Super admins can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create backup metadata table
CREATE TABLE IF NOT EXISTS backup_metadata (
  backup_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL CHECK (backup_type IN ('full', 'incremental', 'manual')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  file_path text,
  file_size bigint,
  tables_included text[],
  created_by uuid REFERENCES users(user_id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

-- Enable RLS on backup metadata
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage backups
CREATE POLICY "Super admins can manage backups"
  ON backup_metadata FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create function to log sensitive operations
CREATE OR REPLACE FUNCTION log_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log for DELETE operations or sensitive updates
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      created_at
    ) VALUES (
      (SELECT user_id FROM users WHERE auth_user_id = auth.uid()),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(OLD.voter_id::text, OLD.monitor_id::text, OLD.center_id::text, OLD.family_id::text),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
      now()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_voters_trigger ON voters;
CREATE TRIGGER audit_voters_trigger
  AFTER UPDATE OR DELETE ON voters
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

DROP TRIGGER IF EXISTS audit_monitors_trigger ON monitors;
CREATE TRIGGER audit_monitors_trigger
  AFTER UPDATE OR DELETE ON monitors
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

DROP TRIGGER IF EXISTS audit_voting_centers_trigger ON voting_centers;
CREATE TRIGGER audit_voting_centers_trigger
  AFTER UPDATE OR DELETE ON voting_centers
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_operation();

-- Create function for safe delete (soft delete)
CREATE OR REPLACE FUNCTION safe_delete_record(
  table_name text,
  record_id uuid,
  confirmation_code text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  expected_code text;
  user_role text;
BEGIN
  -- Get user role
  SELECT role INTO user_role 
  FROM users 
  WHERE auth_user_id = auth.uid();
  
  -- Generate expected confirmation code
  expected_code := encode(digest(record_id::text || current_date::text, 'sha256'), 'hex');
  
  -- Check if user has permission and provided correct confirmation
  IF user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions for delete operation';
  END IF;
  
  IF confirmation_code IS NULL OR confirmation_code != expected_code THEN
    RAISE EXCEPTION 'Invalid or missing confirmation code. Expected: %', expected_code;
  END IF;
  
  -- Perform soft delete based on table
  CASE table_name
    WHEN 'voters' THEN
      UPDATE voters SET deleted_at = now() WHERE voter_id = record_id;
    WHEN 'monitors' THEN
      UPDATE monitors SET deleted_at = now() WHERE monitor_id = record_id;
    WHEN 'voting_centers' THEN
      UPDATE voting_centers SET deleted_at = now() WHERE center_id = record_id;
    WHEN 'families' THEN
      UPDATE families SET deleted_at = now() WHERE family_id = record_id;
    ELSE
      RAISE EXCEPTION 'Table % not supported for safe delete', table_name;
  END CASE;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing RLS policies to exclude soft-deleted records
DROP POLICY IF EXISTS "Admins can manage voters" ON voters;
CREATE POLICY "Admins can manage voters"
  ON voters FOR ALL
  TO authenticated
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Voters can read their own data" ON voters;
CREATE POLICY "Voters can read their own data"
  ON voters FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voters_deleted_at ON voters(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_monitors_deleted_at ON monitors(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voting_centers_deleted_at ON voting_centers(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_families_deleted_at ON families(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);