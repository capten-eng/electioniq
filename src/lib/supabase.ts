import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Database features will be disabled. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Only create client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
// Database types
export interface User {
  user_id: string
  name: string
  phone: string
  role: 'voter' | 'monitor' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended'
  auth_user_id: string
  created_at: string
  updated_at: string
}

export interface Voter {
  voter_id: string
  first_name: string
  last_name: string
  mother_name?: string
  dob?: string
  address?: string
  gps_home_lat?: number
  gps_home_long?: number
  education?: string
  job?: string
  unemployed: boolean
  documents: any
  vote_proof: any
  family_id?: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface VotingCenter {
  center_id: string
  name: string
  address: string
  province: string
  gps_lat?: number
  gps_long?: number
  monitor_id?: string
  status: 'active' | 'inactive' | 'closed'
  created_at: string
  updated_at: string
}

export interface Monitor {
  monitor_id: string
  first_name: string
  last_name: string
  phone: string
  address: string
  gps_home_lat?: number
  gps_home_long?: number
  salary: number
  gps_status: 'active' | 'inactive'
  assigned_center_id?: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface Family {
  family_id: string
  voter_id?: string
  relation: string
  name: string
  dob?: string
  education?: string
  job?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  notification_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  target_role?: string
  ack_required: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Issue {
  issue_id: string
  reported_by_id?: string
  role?: string
  description: string
  media: any
  center_id?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
}

export interface Report {
  report_id: string
  monitor_id?: string
  center_id?: string
  status: 'draft' | 'submitted' | 'reviewed' | 'approved'
  issues: any
  media: any
  created_at: string
  updated_at: string
}

export interface RouteHistory {
  route_id: string
  monitor_id?: string
  timestamp: string
  gps_lat: number
  gps_long: number
  created_at: string
}

export interface Salary {
  salary_id: string
  monitor_id?: string
  amount: number
  hours_worked: number
  gps_compliance: number
  deductions: number
  final_amount: number
  payment_date?: string
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

// Auth helpers
export const signInWithOTP = async (phone: string) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
    },
  })
  return { data, error }
}

export const verifyOTP = async (phone: string, token: string) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  return { data, error }
}

export const signOut = async () => {
  // Clear mock user
  localStorage.removeItem('mockUser');
  if (!supabase) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return { user: userData, error }
}

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  return { data, error }
}

export const getFileUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return data.publicUrl
}

export const deleteFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path])
  return { data, error }
}

// Security helpers
export const checkRealtimeSecurity = async (
  action: string,
  table: string,
  recordId?: string,
  data?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { allowed: false, reason: 'Not authenticated' }

    const { data: userData } = await supabase
      .from('users')
      .select('user_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData) return { allowed: false, reason: 'User not found' }

    const response = await fetch(`${supabaseUrl}/functions/v1/realtime-security`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userData.user_id,
        action,
        table,
        record_id: recordId,
        data
      })
    })

    return await response.json()
  } catch (error) {
    console.error('Security check failed:', error)
    return { allowed: false, reason: 'Security check failed' }
  }
}

// Safe delete with confirmation
export const safeDelete = async (
  tableName: string,
  recordId: string,
  confirmationCode?: string
) => {
  const { data, error } = await supabase.rpc('safe_delete_record', {
    table_name: tableName,
    record_id: recordId,
    confirmation_code: confirmationCode
  })
  return { data, error }
}

// Generate confirmation code for delete operations
export const generateDeleteConfirmation = (recordId: string) => {
  const today = new Date().toISOString().split('T')[0]
  return btoa(`${recordId}-${today}`).slice(0, 8).toUpperCase()
}

// Enhanced upload with security checks
export const secureUploadFile = async (
  bucket: string, 
  path: string, 
  file: File,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
) => {
  // File size check
  if (file.size > maxSizeBytes) {
    return { 
      data: null, 
      error: { message: `File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit` }
    }
  }

  // File type check
  const allowedTypes = {
    documents: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    media: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
    reports: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
  }

  const allowed = allowedTypes[bucket as keyof typeof allowedTypes] || []
  if (!allowed.includes(file.type)) {
    return {
      data: null,
      error: { message: `File type ${file.type} not allowed for ${bucket} bucket` }
    }
  }

  // Security check
  const securityCheck = await checkRealtimeSecurity('INSERT', 'storage_objects', path)
  if (!securityCheck.allowed) {
    return {
      data: null,
      error: { message: securityCheck.reason }
    }
  }

  // Proceed with upload
  return uploadFile(bucket, path, file)
}

// Backup trigger
export const triggerBackup = async (backupType: 'full' | 'incremental' = 'full') => {
  const { data, error } = await supabase
    .from('backup_metadata')
    .insert({
      backup_type: backupType,
      status: 'pending',
      tables_included: [
        'users', 'voters', 'monitors', 'voting_centers', 
        'families', 'notifications', 'reports', 'issues', 
        'salaries', 'route_history'
      ]
    })
    .select()
    .single()

  return { data, error }
}