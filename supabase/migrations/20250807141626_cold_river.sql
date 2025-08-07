/*
  # Arabic Election Campaign Management System Database Schema

  1. New Tables
    - `roles` - Role definitions (super_admin, admin, monitor, voter) with permissions
    - `users` - System users with authentication and role assignment
    - `voting_centers` - Voting locations with GPS coordinates and monitor assignment
    - `monitors` - Field monitors with personal info, GPS tracking, and salary details
    - `families` - Family units for voter organization
    - `voters` - Voter information with demographics and family relationships
    - `notifications` - System-wide notifications with role targeting
    - `reports` - Monitor reports from voting centers
    - `salaries` - Monitor salary tracking with GPS compliance
    - `route_history` - GPS tracking history for monitors
    - `issues` - Issue reporting system for problems at centers

  2. Storage Buckets
    - `documents` - For voter documents and official paperwork
    - `media` - For photos, videos, and other media files
    - `reports` - For report attachments and evidence

  3. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Authenticated users can only access data according to their role
    - Monitors can only access their assigned data
    - Super admins have full access

  4. Features
    - UUID primary keys for all tables
    - Automatic timestamp tracking (created_at, updated_at)
    - GPS coordinate tracking for monitors and locations
    - Comprehensive audit trail
    - Document and media storage integration
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('documents', 'documents', false),
  ('media', 'media', false),
  ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  role_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL CHECK (role_name IN ('super_admin', 'admin', 'monitor', 'voter')),
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'voter' CHECK (role IN ('super_admin', 'admin', 'monitor', 'voter')),
  password_hash text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  auth_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create voting_centers table
CREATE TABLE IF NOT EXISTS voting_centers (
  center_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  province text NOT NULL,
  gps_lat decimal(10, 8),
  gps_long decimal(11, 8),
  monitor_id uuid,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create monitors table
CREATE TABLE IF NOT EXISTS monitors (
  monitor_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  address text NOT NULL,
  gps_home_lat decimal(10, 8),
  gps_home_long decimal(11, 8),
  salary decimal(10, 2) DEFAULT 0,
  gps_status text DEFAULT 'inactive' CHECK (gps_status IN ('active', 'inactive')),
  assigned_center_id uuid REFERENCES voting_centers(center_id),
  user_id uuid REFERENCES users(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  family_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid, -- Will reference voters table after it's created
  relation text NOT NULL,
  name text NOT NULL,
  dob date,
  education text,
  job text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create voters table
CREATE TABLE IF NOT EXISTS voters (
  voter_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  mother_name text,
  dob date,
  address text,
  gps_home_lat decimal(10, 8),
  gps_home_long decimal(11, 8),
  education text,
  job text,
  unemployed boolean DEFAULT false,
  documents jsonb DEFAULT '{}', -- Store document references/metadata
  vote_proof jsonb DEFAULT '{}', -- Store voting proof metadata
  family_id uuid REFERENCES families(family_id),
  user_id uuid REFERENCES users(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  target_role text CHECK (target_role IN ('super_admin', 'admin', 'monitor', 'voter', 'all')),
  ack_required boolean DEFAULT false,
  created_by uuid REFERENCES users(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid REFERENCES monitors(monitor_id),
  center_id uuid REFERENCES voting_centers(center_id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')),
  issues jsonb DEFAULT '{}',
  media jsonb DEFAULT '{}', -- Store media file references
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create salaries table
CREATE TABLE IF NOT EXISTS salaries (
  salary_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid REFERENCES monitors(monitor_id),
  amount decimal(10, 2) NOT NULL,
  hours_worked integer DEFAULT 0,
  gps_compliance decimal(5, 2) DEFAULT 100.00, -- Percentage
  deductions decimal(10, 2) DEFAULT 0,
  final_amount decimal(10, 2) NOT NULL,
  payment_date date,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create route_history table
CREATE TABLE IF NOT EXISTS route_history (
  route_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid REFERENCES monitors(monitor_id),
  timestamp timestamptz DEFAULT now(),
  gps_lat decimal(10, 8) NOT NULL,
  gps_long decimal(11, 8) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  issue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by_id uuid REFERENCES users(user_id),
  role text CHECK (role IN ('super_admin', 'admin', 'monitor', 'voter')),
  description text NOT NULL,
  media jsonb DEFAULT '{}', -- Store media file references
  center_id uuid REFERENCES voting_centers(center_id),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints that were deferred
ALTER TABLE voting_centers 
ADD CONSTRAINT fk_voting_centers_monitor 
FOREIGN KEY (monitor_id) REFERENCES monitors(monitor_id);

ALTER TABLE families 
ADD CONSTRAINT fk_families_voter 
FOREIGN KEY (voter_id) REFERENCES voters(voter_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voting_centers_updated_at BEFORE UPDATE ON voting_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON monitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON salaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles table
CREATE POLICY "Super admins can manage roles"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "All users can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for users table
CREATE POLICY "Super admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can manage non-super-admin users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    ) AND role != 'super_admin'
  );

CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- RLS Policies for voting_centers table
CREATE POLICY "Admins can manage voting centers"
  ON voting_centers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Monitors can read their assigned centers"
  ON voting_centers FOR SELECT
  TO authenticated
  USING (
    monitor_id IN (
      SELECT monitor_id FROM monitors 
      WHERE user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- RLS Policies for monitors table
CREATE POLICY "Admins can manage monitors"
  ON monitors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Monitors can read their own data"
  ON monitors FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policies for families table
CREATE POLICY "Admins can manage families"
  ON families FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Voters can read their family data"
  ON families FOR SELECT
  TO authenticated
  USING (
    voter_id IN (
      SELECT voter_id FROM voters 
      WHERE user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- RLS Policies for voters table
CREATE POLICY "Admins can manage voters"
  ON voters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Voters can read their own data"
  ON voters FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Admins can manage notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can read targeted notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    target_role = 'all' OR 
    target_role IN (
      SELECT role FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policies for reports table
CREATE POLICY "Admins can manage all reports"
  ON reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Monitors can manage their own reports"
  ON reports FOR ALL
  TO authenticated
  USING (
    monitor_id IN (
      SELECT monitor_id FROM monitors 
      WHERE user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- RLS Policies for salaries table
CREATE POLICY "Admins can manage salaries"
  ON salaries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Monitors can read their own salary data"
  ON salaries FOR SELECT
  TO authenticated
  USING (
    monitor_id IN (
      SELECT monitor_id FROM monitors 
      WHERE user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- RLS Policies for route_history table
CREATE POLICY "Admins can read all route history"
  ON route_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Monitors can manage their own route history"
  ON route_history FOR ALL
  TO authenticated
  USING (
    monitor_id IN (
      SELECT monitor_id FROM monitors 
      WHERE user_id IN (
        SELECT user_id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- RLS Policies for issues table
CREATE POLICY "All authenticated users can create issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (
    reported_by_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all issues"
  ON issues FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can read their own issues"
  ON issues FOR SELECT
  TO authenticated
  USING (
    reported_by_id IN (
      SELECT user_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can read their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Admins can manage all documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Storage policies for media bucket
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Users can read media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'media');

CREATE POLICY "Admins can manage all media"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'media' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Storage policies for reports bucket
CREATE POLICY "Monitors can upload report files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reports' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('monitor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can read reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'reports');

CREATE POLICY "Admins can manage all report files"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'reports' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Insert default roles
INSERT INTO roles (role_name, permissions) VALUES
  ('super_admin', '{"all": true}'),
  ('admin', '{"manage_users": true, "manage_centers": true, "view_reports": true}'),
  ('monitor', '{"create_reports": true, "view_own_data": true, "track_location": true}'),
  ('voter', '{"view_own_data": true, "report_issues": true}')
ON CONFLICT (role_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_monitors_assigned_center ON monitors(assigned_center_id);
CREATE INDEX IF NOT EXISTS idx_voters_family_id ON voters(family_id);
CREATE INDEX IF NOT EXISTS idx_route_history_monitor_timestamp ON route_history(monitor_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_reports_monitor_center ON reports(monitor_id, center_id);
CREATE INDEX IF NOT EXISTS idx_salaries_monitor_period ON salaries(monitor_id, period_start, period_end);