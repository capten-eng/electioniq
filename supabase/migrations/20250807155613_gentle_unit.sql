/*
  Arabic Election Campaign Management System - Complete Database Schema
  
  This file contains the complete database schema for the Arabic Election Campaign System.
  Run this file in your Supabase SQL editor or via psql to set up the database.
  
  Tables included:
  1. Users - System users with role-based access
  2. Voters - Voter registration and information
  3. Monitors - Field monitors and their assignments
  4. Voting Centers - Polling stations and locations
  5. Families - Family member information
  6. Notifications - System notifications
  7. Reports - Monitor reports and issues
  8. Issues - Problem reports and tracking
  9. Salaries - Monitor salary management
  10. Route History - GPS tracking for monitors
  11. Audit Logs - System audit trail
  12. Backup Metadata - Backup tracking
  
  Security:
  - Row Level Security (RLS) enabled on all tables
  - Role-based access policies
  - Audit logging for sensitive operations
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'monitor', 'voter');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE gps_status AS ENUM ('active', 'inactive');
CREATE TYPE center_status AS ENUM ('active', 'inactive', 'closed');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');
CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'reviewed', 'approved');
CREATE TYPE backup_type AS ENUM ('full', 'incremental', 'manual');
CREATE TYPE backup_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Audit logging function
CREATE OR REPLACE FUNCTION log_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        COALESCE(
            (SELECT user_id FROM users WHERE auth_user_id = auth.uid()),
            NULL
        ),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'voter',
    password_hash TEXT NOT NULL,
    status user_status DEFAULT 'active',
    auth_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users indexes
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_role ON users(role);

-- Users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data"
    ON users FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Super admins can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Admins can manage non-super-admin users"
    ON users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
        AND role != 'super_admin'
    );

-- Users triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Voting Centers Table
CREATE TABLE voting_centers (
    center_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    province TEXT NOT NULL,
    gps_lat DECIMAL(10,8),
    gps_long DECIMAL(11,8),
    monitor_id UUID,
    status center_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Voting Centers indexes
CREATE INDEX idx_voting_centers_deleted_at ON voting_centers(deleted_at) WHERE deleted_at IS NOT NULL;

-- Voting Centers RLS
ALTER TABLE voting_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voting centers"
    ON voting_centers FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

-- Voting Centers triggers
CREATE TRIGGER update_voting_centers_updated_at
    BEFORE UPDATE ON voting_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_voting_centers_trigger
    AFTER UPDATE OR DELETE ON voting_centers
    FOR EACH ROW
    EXECUTE FUNCTION log_sensitive_operation();

-- 3. Monitors Table
CREATE TABLE monitors (
    monitor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    gps_home_lat DECIMAL(10,8),
    gps_home_long DECIMAL(11,8),
    salary DECIMAL(10,2) DEFAULT 0,
    gps_status gps_status DEFAULT 'inactive',
    assigned_center_id UUID,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Monitors indexes
CREATE INDEX idx_monitors_assigned_center ON monitors(assigned_center_id);
CREATE INDEX idx_monitors_deleted_at ON monitors(deleted_at) WHERE deleted_at IS NOT NULL;

-- Monitors foreign keys
ALTER TABLE monitors ADD CONSTRAINT monitors_assigned_center_id_fkey 
    FOREIGN KEY (assigned_center_id) REFERENCES voting_centers(center_id);
ALTER TABLE monitors ADD CONSTRAINT monitors_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Add foreign key to voting_centers
ALTER TABLE voting_centers ADD CONSTRAINT fk_voting_centers_monitor 
    FOREIGN KEY (monitor_id) REFERENCES monitors(monitor_id);

-- Monitors RLS
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage monitors"
    ON monitors FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

-- Monitors triggers
CREATE TRIGGER update_monitors_updated_at
    BEFORE UPDATE ON monitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_monitors_trigger
    AFTER UPDATE OR DELETE ON monitors
    FOR EACH ROW
    EXECUTE FUNCTION log_sensitive_operation();

-- 4. Families Table
CREATE TABLE families (
    family_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID,
    relation TEXT NOT NULL,
    name TEXT NOT NULL,
    dob DATE,
    education TEXT,
    job TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Families indexes
CREATE INDEX idx_families_deleted_at ON families(deleted_at) WHERE deleted_at IS NOT NULL;

-- Families RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage families"
    ON families FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

-- Families triggers
CREATE TRIGGER update_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Voters Table
CREATE TABLE voters (
    voter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    mother_name TEXT,
    dob DATE,
    address TEXT,
    gps_home_lat DECIMAL(10,8),
    gps_home_long DECIMAL(11,8),
    education TEXT,
    job TEXT,
    unemployed BOOLEAN DEFAULT FALSE,
    documents JSONB DEFAULT '{}',
    vote_proof JSONB DEFAULT '{}',
    family_id UUID,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Voters indexes
CREATE INDEX idx_voters_family_id ON voters(family_id);
CREATE INDEX idx_voters_deleted_at ON voters(deleted_at) WHERE deleted_at IS NOT NULL;

-- Voters foreign keys
ALTER TABLE voters ADD CONSTRAINT voters_family_id_fkey 
    FOREIGN KEY (family_id) REFERENCES families(family_id);
ALTER TABLE voters ADD CONSTRAINT voters_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Add foreign key to families
ALTER TABLE families ADD CONSTRAINT fk_families_voter 
    FOREIGN KEY (voter_id) REFERENCES voters(voter_id);

-- Voters RLS
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voters"
    ON voters FOR ALL
    TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Voters can read their own data"
    ON voters FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL AND
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Voters triggers
CREATE TRIGGER update_voters_updated_at
    BEFORE UPDATE ON voters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_voters_trigger
    AFTER UPDATE OR DELETE ON voters
    FOR EACH ROW
    EXECUTE FUNCTION log_sensitive_operation();

-- 6. Roles Table
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL CHECK (role_name IN ('super_admin', 'admin', 'monitor', 'voter')),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can read roles"
    ON roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Super admins can manage roles"
    ON roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Roles triggers
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Notifications Table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    target_role TEXT CHECK (target_role IN ('super_admin', 'admin', 'monitor', 'voter', 'all')),
    ack_required BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications foreign keys
ALTER TABLE notifications ADD CONSTRAINT notifications_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(user_id);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notifications"
    ON notifications FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

-- Notifications triggers
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Reports Table
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID,
    center_id UUID,
    status report_status DEFAULT 'draft',
    issues JSONB DEFAULT '{}',
    media JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports indexes
CREATE INDEX idx_reports_monitor_center ON reports(monitor_id, center_id);

-- Reports foreign keys
ALTER TABLE reports ADD CONSTRAINT reports_monitor_id_fkey 
    FOREIGN KEY (monitor_id) REFERENCES monitors(monitor_id);
ALTER TABLE reports ADD CONSTRAINT reports_center_id_fkey 
    FOREIGN KEY (center_id) REFERENCES voting_centers(center_id);

-- Reports RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all reports"
    ON reports FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

-- Reports triggers
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Issues Table
CREATE TABLE issues (
    issue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by_id UUID,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'monitor', 'voter')),
    description TEXT NOT NULL,
    media JSONB DEFAULT '{}',
    center_id UUID,
    status issue_status DEFAULT 'open',
    priority issue_priority DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues indexes
CREATE INDEX idx_issues_status ON issues(status);

-- Issues foreign keys
ALTER TABLE issues ADD CONSTRAINT issues_reported_by_id_fkey 
    FOREIGN KEY (reported_by_id) REFERENCES users(user_id);
ALTER TABLE issues ADD CONSTRAINT issues_center_id_fkey 
    FOREIGN KEY (center_id) REFERENCES voting_centers(center_id);

-- Issues RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all issues"
    ON issues FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

CREATE POLICY "All authenticated users can create issues"
    ON issues FOR INSERT
    TO authenticated
    WITH CHECK (
        reported_by_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Issues triggers
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Salaries Table
CREATE TABLE salaries (
    salary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    hours_worked INTEGER DEFAULT 0,
    gps_compliance DECIMAL(5,2) DEFAULT 100.00,
    deductions DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salaries indexes
CREATE INDEX idx_salaries_monitor_period ON salaries(monitor_id, period_start, period_end);

-- Salaries foreign keys
ALTER TABLE salaries ADD CONSTRAINT salaries_monitor_id_fkey 
    FOREIGN KEY (monitor_id) REFERENCES monitors(monitor_id);

-- Salaries RLS
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage salaries"
    ON salaries FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

-- Salaries triggers
CREATE TRIGGER update_salaries_updated_at
    BEFORE UPDATE ON salaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Route History Table
CREATE TABLE route_history (
    route_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    gps_lat DECIMAL(10,8) NOT NULL,
    gps_long DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Route History indexes
CREATE INDEX idx_route_history_monitor_timestamp ON route_history(monitor_id, timestamp);

-- Route History foreign keys
ALTER TABLE route_history ADD CONSTRAINT route_history_monitor_id_fkey 
    FOREIGN KEY (monitor_id) REFERENCES monitors(monitor_id);

-- Route History RLS
ALTER TABLE route_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all route history"
    ON route_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
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

-- 12. Audit Logs Table
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs indexes
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Audit Logs foreign keys
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Audit Logs RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- 13. Backup Metadata Table
CREATE TABLE backup_metadata (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type backup_type NOT NULL,
    status backup_status DEFAULT 'pending',
    file_path TEXT,
    file_size BIGINT,
    tables_included TEXT[],
    created_by UUID,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

-- Backup Metadata foreign keys
ALTER TABLE backup_metadata ADD CONSTRAINT backup_metadata_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(user_id);

-- Backup Metadata RLS
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage backups"
    ON backup_metadata FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Insert default roles
INSERT INTO roles (role_name, permissions) VALUES
('super_admin', '{"all": true}'),
('admin', '{"manage_users": true, "manage_centers": true, "view_reports": true}'),
('monitor', '{"add_voters": true, "create_reports": true, "update_location": true}'),
('voter', '{"view_profile": true, "upload_documents": true, "report_issues": true}');

-- Create a safe delete function
CREATE OR REPLACE FUNCTION safe_delete_record(
    table_name TEXT,
    record_id TEXT,
    confirmation_code TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    expected_code TEXT;
    today TEXT;
BEGIN
    -- Generate expected confirmation code
    today := CURRENT_DATE::TEXT;
    expected_code := UPPER(SUBSTRING(encode(digest(record_id || '-' || today, 'sha256'), 'base64'), 1, 8));
    
    -- Check if confirmation code matches (if provided)
    IF confirmation_code IS NOT NULL AND confirmation_code != expected_code THEN
        RAISE EXCEPTION 'Invalid confirmation code';
    END IF;
    
    -- Perform soft delete by setting deleted_at timestamp
    CASE table_name
        WHEN 'voters' THEN
            UPDATE voters SET deleted_at = NOW() WHERE voter_id::TEXT = record_id;
        WHEN 'monitors' THEN
            UPDATE monitors SET deleted_at = NOW() WHERE monitor_id::TEXT = record_id;
        WHEN 'voting_centers' THEN
            UPDATE voting_centers SET deleted_at = NOW() WHERE center_id::TEXT = record_id;
        WHEN 'families' THEN
            UPDATE families SET deleted_at = NOW() WHERE family_id::TEXT = record_id;
        ELSE
            RAISE EXCEPTION 'Table % not supported for safe delete', table_name;
    END CASE;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Final message
SELECT 'Arabic Election Campaign System database schema created successfully!' as status;