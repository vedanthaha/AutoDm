/**
 * Supabase Client Initialization & Security Layer
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

// Browser / Public Client
let publicClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!publicClient && supabaseUrl && supabaseAnonKey) {
    publicClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return publicClient;
}

// Server-side Service Role Client (for webhooks & server actions)
let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceRoleClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey || !supabaseUrl.startsWith('https://')) {
    return null;
  }
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serviceClient;
}
