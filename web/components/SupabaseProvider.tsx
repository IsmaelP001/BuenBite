'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    // 1. Supabase automáticamente inicia el timer de refresh aquí
    // 2. Cada ~60 segundos antes de expirar, hace refresh automático
    // 3. Cuando termina, dispara el evento TOKEN_REFRESHED
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Este evento se dispara DESPUÉS de que Supabase ya refrescó
      if (event === 'TOKEN_REFRESHED') {
        console.log('Nueva sesión:', session)
        // Sincronizar con el servidor
        router.refresh()
      }
      
      if (event === 'SIGNED_IN') {
        router.refresh()
      }
      
      if (event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return <>{children}</>
}