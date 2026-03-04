"use server";
import { createClient } from "@/lib/supabase/server";
import { getRequiredEnv } from "@/lib/config/env";
import { redirect } from "next/navigation";

type Providers = "google";
export const signInWith = async (provider: Providers) => {
  const supabase = await createClient();
  const siteUrl = getRequiredEnv(
    "siteUrl",
    "Missing SITE_URL/NEXT_PUBLIC_SITE_URL for OAuth callback",
  );
  const auth_callback_url = `${siteUrl}/auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: auth_callback_url,
      queryParams: {
        access_type: "offline",
        prompt: "select_account consent",
      },
    },
  });

  if (error) {
    throw new Error(error.message || "No se pudo iniciar sesión con OAuth");
  }

  if (!data?.url) {
    throw new Error("No se pudo obtener la URL de autenticación");
  }
  redirect(data.url);
};

export const getSession = async () => {
  try {
    const supabase = await createClient();
    return await supabase.auth.getSession();
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};
