
'use client'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserSupabaseClient: SupabaseClient | null = null;

export function createSupabaseClient() {
  if (browserSupabaseClient) return browserSupabaseClient;

  browserSupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  );

  return browserSupabaseClient;
}
