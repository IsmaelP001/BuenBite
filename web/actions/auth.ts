"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Providers = "google";
export const signInWith = async (provider: Providers) => {
  const supabase = await createClient();
  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: auth_callback_url,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
  }
  redirect(data.url!);
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
