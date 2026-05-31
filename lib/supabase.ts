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
// supabase-js wants the bare project ORIGIN (https://<ref>.supabase.co). Common
// mistakes that break auth with a 404:
//   • the dashboard URL  → https://supabase.com/dashboard/project/<ref>
//   • the REST URL       → https://<ref>.supabase.co/rest/v1   (yields /rest/v1/auth/v1/otp)
//   • a trailing slash
// We rewrite a dashboard URL to the API host, then collapse EVERYTHING to the
// origin so any leftover path (/rest/v1, etc.), query, or slash is dropped.
function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  let u = raw.trim();
  const dash = u.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dash) return `https://${dash[1]}.supabase.co`;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    return new URL(u).origin; // drops /rest/v1, query strings, and trailing slashes
  } catch {
    return u.replace(/\/+$/, "");
  }
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
