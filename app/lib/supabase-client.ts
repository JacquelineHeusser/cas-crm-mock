/**
 * Supabase Client Setup
 * Stellt Admin und User Clients bereit
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY müssen in .env gesetzt sein');
}

/**
 * Admin Client mit Service Role Key
 * Nur für Server-side Operations verwenden!
 */
export function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY fehlt in .env');
  }

  return createClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Standard Client mit Anon Key
 * Für Client-side oder authenticated User Operations
 */
export function getSupabaseClient() {
  return createClient(supabaseUrl!, supabaseAnonKey!);
}
