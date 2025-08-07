import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityCheckRequest {
  user_id: string
  action: string
  table: string
  record_id?: string
  data?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, action, table, record_id, data }: SecurityCheckRequest = await req.json()

    // Get user information
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('role, status')
      .eq('user_id', user_id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ allowed: false, reason: 'User not found or invalid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Check if user is active
    if (user.status !== 'active') {
      return new Response(
        JSON.stringify({ allowed: false, reason: 'User account is not active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Role-based security checks
    const securityRules = {
      // Super admin can do everything
      super_admin: () => true,
      
      // Admin restrictions
      admin: (action: string, table: string) => {
        const restrictedTables = ['users', 'roles', 'salaries']
        if (restrictedTables.includes(table) && ['INSERT', 'UPDATE', 'DELETE'].includes(action)) {
          return false
        }
        return true
      },
      
      // Monitor restrictions
      monitor: (action: string, table: string) => {
        const allowedTables = ['voters', 'families', 'reports', 'issues', 'route_history']
        if (!allowedTables.includes(table)) {
          return false
        }
        if (table === 'voters' && action === 'DELETE') {
          return false
        }
        return true
      },
      
      // Voter restrictions
      voter: (action: string, table: string) => {
        const allowedTables = ['voters', 'families', 'issues']
        if (!allowedTables.includes(table)) {
          return false
        }
        if (['DELETE'].includes(action)) {
          return false
        }
        return true
      }
    }

    const roleCheck = securityRules[user.role as keyof typeof securityRules]
    if (!roleCheck) {
      return new Response(
        JSON.stringify({ allowed: false, reason: 'Invalid user role' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    const allowed = roleCheck(action, table)

    // Additional checks for sensitive operations
    if (allowed && ['DELETE', 'UPDATE'].includes(action)) {
      // Check for GPS requirement for monitors
      if (user.role === 'monitor' && table === 'voters') {
        const { data: monitor } = await supabaseClient
          .from('monitors')
          .select('gps_status')
          .eq('user_id', user_id)
          .single()

        if (monitor?.gps_status !== 'active') {
          return new Response(
            JSON.stringify({ allowed: false, reason: 'GPS must be active for field operations' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }
      }

      // Rate limiting for sensitive operations
      const { data: recentOperations } = await supabaseClient
        .from('audit_logs')
        .select('created_at')
        .eq('user_id', user_id)
        .eq('action', action)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute

      if (recentOperations && recentOperations.length > 10) {
        return new Response(
          JSON.stringify({ allowed: false, reason: 'Rate limit exceeded. Too many operations in the last minute' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
    }

    // Log the security check
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id,
        action: `SECURITY_CHECK_${action}`,
        table_name: table,
        record_id: record_id || 'N/A',
        new_values: { allowed, table, action }
      })

    return new Response(
      JSON.stringify({ 
        allowed, 
        user_role: user.role,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Security check error:', error)
    return new Response(
      JSON.stringify({ allowed: false, reason: 'Internal security error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})