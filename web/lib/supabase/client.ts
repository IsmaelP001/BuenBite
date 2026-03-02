
'use client'
import { createClient } from '@supabase/supabase-js'


export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: true, 
        persistSession: true,
      },
    }
  );
}
