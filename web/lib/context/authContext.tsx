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
      const sessionUser = sessionResponse?.data?.session?.user ?? null;

      if (sessionUser) {
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
      queryClient.invalidateQueries();

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
          setUser(session.user);
          setLoading(false);
          queryClient.invalidateQueries();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
          queryClient.invalidateQueries();
        } else {
          await getUser();
          queryClient.invalidateQueries();
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
