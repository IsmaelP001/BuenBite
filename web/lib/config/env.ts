const trim = (value?: string) => value?.trim() ?? "";

export const env = {
  apiUrl: trim(process.env.API_URL) || trim(process.env.NEXT_PUBLIC_API_URL),
  siteUrl:
    trim(process.env.NEXT_PUBLIC_SITE_URL) || trim(process.env.SITE_URL),
  supabaseUrl: trim(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: trim(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  nodeEnv: trim(process.env.NODE_ENV) || "development",
} as const;

export function getRequiredEnv(
  key: keyof typeof env,
  message?: string,
): string {
  const value = env[key];
  if (!value) {
    throw new Error(message || `Missing environment variable for ${key}`);
  }
  return value;
}
