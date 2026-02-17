'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '../supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const getUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error al obtener usuario:', error)
        setUser(null)
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Error inesperado:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const refreshUser = async () => {
    setLoading(true)
    await getUser()
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  useEffect(() => {
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        
        setLoading(false)
        switch (event) {
          case 'SIGNED_IN':
            console.log('Usuario ha iniciado sesión')
            break
          case 'SIGNED_OUT':
            console.log('Usuario ha cerrado sesión')
            break
          case 'TOKEN_REFRESHED':
            console.log('Token refrescado')
            break
          case 'USER_UPDATED':
            console.log('Usuario actualizado')
            break
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [getUser,supabase])

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  
  return context
}