"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createSupabaseClient } from "../supabase/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { HttpClient } from "../http/httpClient";
import { getSession } from "@/actions/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Instancia única fuera del componente para evitar recrearla en cada render
const supabase = createSupabaseClient();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const getUser = useCallback(async () => {
    try {
      const sessionResponse = await getSession();
      const serverSession = sessionResponse?.data?.session ?? null;
      const sessionUser = serverSession?.user ?? null;

      if (sessionUser) {
        if (serverSession.access_token && serverSession.refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: serverSession.access_token,
            refresh_token: serverSession.refresh_token,
          });

          if (setSessionError) {
            console.error(
              "Error sincronizando sesión cliente para Realtime:",
              setSessionError,
            );
          } else {
            supabase.realtime.setAuth(serverSession.access_token);
          }
        }

        setUser(sessionUser);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        setUser(null);
        return;
      }

      setUser(user ?? null);
    } catch (error) {
      console.error("Error inesperado:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    await getUser();
  }, [getUser]);

  const signOut = useCallback(async () => {
    try {
      const signOutResponse = await fetch("/api/auth/signout", {
        method: "POST",
        cache: "no-store",
      });

      if (!signOutResponse.ok) {
        throw new Error("No se pudo invalidar la sesión en el servidor");
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      HttpClient.resetSession();
      setUser(null);
      queryClient.clear();

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [router, queryClient]);

  useEffect(() => {
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        HttpClient.resetSession();
        if (session?.user) {
          if (session.access_token) {
            supabase.realtime.setAuth(session.access_token);
          }
          setUser(session.user);
          setLoading(false);
          queryClient.clear();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
          queryClient.clear();
        } else {
          await getUser();
          queryClient.clear();
        }

        if (event === "SIGNED_IN")    console.log("Usuario ha iniciado sesión");
        if (event === "SIGNED_OUT")   console.log("Usuario ha cerrado sesión");
        if (event === "TOKEN_REFRESHED") console.log("Token refrescado");
        if (event === "USER_UPDATED") console.log("Usuario actualizado");
      }
    );

    return () => subscription.unsubscribe();
  }, [getUser, queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
}
