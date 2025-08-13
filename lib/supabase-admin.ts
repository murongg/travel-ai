import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let adminClient: SupabaseClient | null = null

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') return null
  if (!supabaseUrl || !serviceRoleKey) return null
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey)
  }
  return adminClient
}

export function isSupabaseAdminConfigured(): boolean {
  return !!(supabaseUrl && serviceRoleKey)
}


