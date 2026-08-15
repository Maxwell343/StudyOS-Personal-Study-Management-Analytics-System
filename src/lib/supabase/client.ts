import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let clientInstance: SupabaseClient<Database> | null = null;

/**
 * Returns a browser-safe singleton instance of the Supabase client.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (clientInstance) {
    return clientInstance;
  }

  // During SSG/build without env vars, provide a non-throwing fallback client
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "StudyOS: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are not set. Ensure .env.local is configured."
      );
    }
    clientInstance = createClient<Database>(
      supabaseUrl || "https://placeholder-project.supabase.co",
      supabaseKey || "placeholder-key"
    );
    return clientInstance;
  }

  clientInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
}

/**
 * Returns a Supabase client configured with the provided user access token.
 * Passes the Authorization header so queries succeed under Row Level Security (RLS).
 */
export function getAuthenticatedSupabaseClient(accessToken?: string | null): SupabaseClient<Database> {
  if (!accessToken || !supabaseUrl || !supabaseKey) {
    return getSupabaseClient();
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== "https://placeholder-project.supabase.co"
);

export const supabase = getSupabaseClient();
