"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Optional Supabase browser client.
 *
 * MoonshotsMastery works fully WITHOUT Supabase (local-only, no login). When the
 * two public env vars are present, real magic-link accounts + cross-device sync
 * light up automatically. The anon key is safe to expose in the browser — Row
 * Level Security (see supabase/schema.sql) is what actually protects user data.
 *
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

let _client: SupabaseClient | null = null;

/** Returns the singleton client, or null when Supabase isn't configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  _client = createClient(url!, anon!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // picks up the magic-link token on return
      flowType: "pkce",
    },
  });
  return _client;
}
