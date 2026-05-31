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
// Normalize the URL defensively. The #1 magic-link failure ("Invalid path
// specified in request URL") comes from pasting the Supabase *dashboard* URL
// (https://supabase.com/dashboard/project/<ref>) instead of the API URL
// (https://<ref>.supabase.co), or leaving a trailing slash. We strip the slash
// and, if a dashboard URL slipped in, rewrite it to the correct API origin.
function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  let u = raw.trim().replace(/\/+$/, "");
  const dash = u.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dash) u = `https://${dash[1]}.supabase.co`;
  return u;
}

const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

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
